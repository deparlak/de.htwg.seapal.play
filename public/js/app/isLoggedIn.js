/**
 * isLoggedIn.js
 *
 * This javascript file will be used if a user is logged in.
 *
 */

$(document).ready(function() {
    events = map.getEvents();
    var templateFriendRequests = Handlebars.compile($("#template-friendRequests").html());
    var selectedUser = seapal.user;
    // prefix to store the returned id of the map object, which uses it's own internal id structure.
    var MAP_ID = 'id';
    // TODO we use docStore to handle all documents, because replication is actually not working with pouchdb to couchbase sync gateway.
    // If the bug is fixed, we should use the replication instead of this variable.
    // See https://github.com/pouchdb/pouchdb/issues/1666
    var docStore = {};
    // the geohash document which should be send on a geohash cluster update
    var subscribeGeohash = {type : 'subscribeGeohash', owner : seapal.user};
    var geoPosition = {_id : seapal.user + '/geoPosition', type : 'geoPosition', owner : seapal.user};
    // variable indicating when syncing is complete
    var complete = false;
    // connect to database
    var db = new PouchDB('http://localhost:9000/database/');
    
    // initial start up code, which fetch all docs and store them to the docStore.
    // This call should be replaced with a PouchDB.sync()
    db.allDocs({include_docs : true}, function(err, response) {
        console.log("FETCH DOCS RESULT");
        if (err) {
            output.error(err);
        } else {
            console.log(response);
            // set the active person, to the logged in user.
            docStore[seapal.user] = {person : {}};
            docStore[seapal.user]['person'][MAP_ID] = map.set('person', {type : 'person', _id : seapal.user, _rev : 'some_rev', email : seapal.user, owner : seapal.user});
            // run through all docs and store them in the docStore
            for (var i in response.rows) {
                storeDocument(response.rows[i].doc)     
            }
            map.select('person', docStore[seapal.user]['person'][MAP_ID]);
            console.log(docStore);
            complete = true;
            // if we have not subscribed since yet, do it now.
            if (!subscribeGeohash._rev) {
                callSubscribeGeohash();
            } else {
                // TODO remove complete else case. only for test added.
                return;
                db.remove(subscribeGeohash, function (err, response) { 
                    console.log(err);
                    console.log(response);
                });
            }
        }
    });
    
    // listen on database changes with longpoll. This call can be removed if PouchDB.sync() is working.
    db.changes({since : 'now', live : true, include_docs : true})
        .on('change', function (info) {
            complete = false;
            storeDocument(info.doc);
        }).on('complete', function (info) {
            complete = true;
            console.log('complete');
        }).on('error', function (err) {
            complete = false;
            console.log(err);
        });
    
    //helper function to store a document in the docStore variable
    var storeDocument = function (doc) {
        // id which come are set here are invalid
        delete doc.id;
        // split key of document
        var obj = doc._id.split('/');
        console.log(doc.id);
        
        // we will be notified about documents which removed channels
        if (doc._removed && 3 == obj.length && 'publishGeohash' == obj[1]) {
            return;
        }
        
        // check if it is a geoPosition document
        if (doc.type == 'geoPosition') {
            geoPosition = doc;
            return;
        }
        
        // check if it is a geoPosition document
        if (doc.type == 'subscribeGeohash') {
            subscribeGeohash = doc;
            return;
        }
        
        // check if it is a subscribeGeohash document
        if (doc.type == 'subscribeGeohash') {
            subscribeGeohash = doc;
            return;
        }
        
        // check if it is a publishGeohash document
        if (doc.type == 'publishGeohash') {
            receivedPubilishGeohash(doc);
            return;
        }
        
        // check if it is a settings document
        if (doc.type == 'settings') {
            map.initGlobalSettings(doc);
            return;
        }
        
        //if it is a crew request or member
        if ('crew' === doc.type) {
            var type = doc.type;
            var friendMail = (doc.from == seapal.user) ? doc.to : doc.from;
            // transform the id to a unique hex string, because we need to set the crew document
            // to the html, and there are some characters like '@' not allowed for id's.
            var id = idtoHex(friendMail);
            // some checks to build docStore correct
            if (undefined === docStore[type]) docStore[type] = {_counter : 0};
            
            // check if the friend request is in the html and has be removed.
            removeCrewRequest(id);
            
            // is it a request to ask to be a crew member.
            if ('request' === doc.access) {
                if (seapal.user !== doc.from) {
                    $("#friendRequests").append(templateFriendRequests({from : doc.from, id : id}));
                    $("#logbook-friendRequests").show();
                    docStore[type][friendMail] = doc;
                }
            // access grant
            } else if ('grant' === doc.access && undefined === docStore[type][friendMail]) {
                if (undefined === docStore[type][friendMail]) docStore[type]['_counter']++;
                if (undefined === docStore[type][friendMail]) docStore[type][friendMail] = {};
                docStore[type][friendMail][MAP_ID] = map.set('person', {id : doc[MAP_ID], type : 'person', _id : friendMail, _rev : 'some_rev', email : friendMail, owner : friendMail});
            // access rejected
            } else if ('reject' === doc.access) {
                // remove the document from the map
                if (docStore[type][friendMail] && docStore[type][friendMail][MAP_ID]) {
                    map.remove('person', docStore[type][friendMail][MAP_ID], true);
                    // remove from the gui
                    $('.person'+docStore[type][friendMail][MAP_ID]).remove();
                    // check if we have to switch the person (if the actual selected user is the user who quit the friend
                    if (friendMail == selectedUser) {
                        output.warning("Selected own logbook, because the friendship to "+friendMail+" was quit.");
                        map.select('person', docStore[seapal.user]['person'][MAP_ID]);
                    }
                }
                // remove the document from the docStore
                delete docStore[type][friendMail];
            } else {
                console.log("unknown crew document");
                console.log(doc);
            }
            return;
        }

        // other documentes
        if (-1 != ['boat', 'mark', 'route', 'trip', 'waypoint', 'trackpoint'].indexOf(doc.type)) {
            var type = doc.type;
            var user = doc.owner;
            var _id = doc._id;
            // check if user is already in docStore
            if (undefined === docStore[user]) docStore[user] = {};
            // check if document type is in docStore
            if (undefined === docStore[user][type]) docStore[user][type] = {_counter : 0};
            // check if it was not a document deletion
            if (undefined === doc._deleted) {
                // check if it is a new document
                if (undefined === docStore[user][type][_id]) {
                    docStore[user][type]['_counter']++;
                    docStore[user][type][_id] = {};
                }
                // get the id if it exist.
                var tmp = docStore[user][type][_id][MAP_ID];
                // store the document
                docStore[user][type][_id] = doc;
                docStore[user][type][_id][MAP_ID] = tmp;
                if (user === selectedUser) {
                    // call the set method in the map
                    docStore[user][type][_id][MAP_ID] = map.set(type, docStore[user][type][_id]);
                }
            } else {
                // call remove method in the map
                if (docStore[user][type][_id] && docStore[user][type][_id][MAP_ID]) map.remove(type, docStore[user][type][_id][MAP_ID], true);
                // remove the document from the docStore
                delete docStore[user][type][_id];
            }
        }
    };
    
    var removeCrewRequest = function (id) {
        if ( $("#friendRequests"+id).length != 0) {
            $("#friendRequests"+id).remove();
            if ($("#friendRequests li").text() == "") {
                $("#logbook-friendRequests").hide();
            }
        }
    };
    
    // get called when a publicGeohash package will be get from the server.
    var receivedPubilishGeohash = function (doc) {
        map.updateBoatCluster(doc);
    }
    
    // Helper function to generate the id, with which a document should be stored on the server.
    var getId = function (self) {
        if (undefined === docStore[selectedUser]) docStore[selectedUser] = {};
        if (undefined === docStore[selectedUser][self.type]) docStore[selectedUser][self.type] = {_counter : 0};
        docStore[selectedUser][self.type]['_counter']++;
        // get the time now.
        var now = new Date();
        var idStr = now.getTime().toString()
        // store the actual time as a ISO string in the document
        self.date = now.toISOString();
        
        // waypoints and trackpoint get the id of the trip additional added 
        if ('trackpoint' == self.type || 'waypoint' == self.type) {
            return self.trip + '/' + self.type + '/' + idStr;
        }
        return selectedUser + '/' + self.type + '/' + idStr;
    }
    
    // document id's are used in many parts by the seapal-app e.g. as id's for html documents.
    // In some parts document id's with for example a @ character are not allowed. Due to this, we
    // parse the id to hex for internal use and if a document get pulled back, we parse the document
    // to it's original form. For this action we have this helper functions.
    var idtoHex = function (tmp) {
        var str = '';
     
        for (var i = 0; i < tmp.length; i++) {
            c = tmp.charCodeAt(i);
            str += c.toString(16) + '_';
        }
        return str;
    };
    
    var idtoString = function (tmp) {
        var arr = tmp.split('_');
        var str = '';
     
        for (var i = 0; i < arr.length; i++) {
            c = String.fromCharCode( parseInt(arr[i], 16) );
            str += c;
        }
        // The conversion add a extra character to the string, remove it
        return str.substring(0, str.length-1);
    };
    
 	/* this callback will be called if an object was updated by a user */
    map.addCallback([events.SWITCHED_PERSON], function (self) {
        $("#tracks").html("");
        $("#logbook-trips").html("");
        $("#routes").html("");
        $("#logbook-boats").html("");
        $("#marks").html("");
        
        // extract the user _id
        selectedUser = self._id;

        // return if there are no documents for this user
        if (undefined === docStore[selectedUser]) return;

        // run through each document type and set it to the map.
        ['boat', 'route', 'mark', 'trip', 'waypoint'].forEach(function(type) {
            if (undefined !== docStore[selectedUser][type]) {
                keys = Object.keys(docStore[selectedUser][type]);
                keys.splice(keys.indexOf('_counter'), 1);
                keys.map( function(item) {
                    // delete the old map id and get a new one.
                    delete docStore[selectedUser][type][item][MAP_ID];
                    docStore[selectedUser][type][item][MAP_ID] = map.set(type, docStore[selectedUser][type][item]);
                });
            }
        });
    });

    /* callback to open the modal with which a crew request can be send */
    menu.addCallback('leftclick', 'logbookCrewAdd', function (self) {
        menu.disableAutoClose();
        $('#modal-form_addCrewman').modal('show');
    });

    /* on click of button to sent a crew request */
    $('#modal-form_addCrewman').submit(function(event) {
        $('#modal-form_addCrewman').modal('hide');

        from = seapal.user;
        to = $('#email_addCrewman').val();
        // set same ordering, no matter from which address the request will be sent
        first = (to < from) ? to : from;
        second = (to < from) ? from : to;
        
        var doc = 
        {
            type        : 'crew',
            to          : to,
            from        : from,
            access      : 'request',
            _id         : 'crew'+'/'+first+'/'+second,
            _rev        : "2-1b199798404fc0e717c4faf05e512aaf"
        };
        
        db.put(doc, function (err, response) { 
            if (err) {
                if (err.message) err = err.message;
                output.error("Crew request failed with " + err);
            } else {
                output.info("Crew request send");
            }
        });
        
        return false;
    });

    /* Callback for confirm / reject crew request */
    menu.addCallback('leftclick', 'icon-friendRequests', function (self) {
        var template = Handlebars.compile($("#confirmCrewRequest_Template").text());
        var html = template(self.data);
        $('#confirmCrewRequestInputForm').html(html);

        menu.disableAutoClose();
        $('#modal-form_confirmCrewRequest').modal('show');

        $('#rejectCrewRequest').on('click', function() {
            $('#modal-form_confirmCrewRequest').modal('hide');
            doc = docStore['crew'][self.data('from')];
            doc.access = 'reject';
            
            db.put(doc, function(err, response) { 
                if (err) {
                    if (err.message) err = err.message;
                    output.error(err);
                }
            });
        });

        $('#confirmCrewRequest').on('click', function() {
            $('#modal-form_confirmCrewRequest').modal('hide');
            doc = docStore['crew'][self.data('from')];
            doc.access = 'grant';
            
            db.put(doc, function(err, response) { 
                if (err) {
                    if (err.message) err = err.message;
                    output.error(err);
                }
            });
        });
    });

    $('#modal-form_confirmCrewRequest').on('hidden.bs.modal',
        function() {
            menu.enableAutoClose();
            $('#confirmCrewRequestInputForm').html("");
        }
    );

	/* this callback will be called if a document (mark, route, track,...) should be removed from the server */
    map.addCallback(events.SERVER_REMOVE, function (self) {
        // remove the entry from the docStore
        if (docStore[self.owner] && docStore[self.owner][self.type]) {
            delete docStore[self.owner][self.type][self._id];
        }
        /* if there is no _id from the server, this object was not uploaded, so we do not send a server request. */
        if (null == self._id) return;

        db.remove(self, function(err, response) { 
            if (err) {
                output.error(err);
            }
        });
    });

	/* this callback will be called if a document (mark, route, track,...) should be created on the server */
    map.addCallback(events.SERVER_CREATE, function (self) {
        /*
            we set the id which will be used by the client as a handle for the object to null,
            because the server will interpret an 'id' as a '_id'.
        */
        
        // if this is a trip, we ignore the marks attribute which will be uploaded cyclic in another object called trackpoint
        if (self.type == 'trip') {
            delete self.marks;
        }

        // if there is no _id actually.
        if (!self._id || null == self._id) {
            // generate an id
            self._id = getId(self);
            // object is not in docStore, because it was created by the map, so set the object to the docStore
            docStore[selectedUser][self.type][self._id] = {id : self.id};
        }
        var obj = jQuery.extend(true, {}, self);
        // delete all object fields, which we not like to upload to the server.
        delete obj.id;
        delete obj.image_big;
        
        createDocument(self.id, obj);
    });
    
    var callSubscribeGeohash = function () {
        subscribeGeohash._id = seapal.user + '/subscribeGeohash/' + new Date().toISOString();
        subscribeGeohash._rev = null;
        subscribeGeohash.channels = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'j', 'k', 'm', 'n', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z'];
        db.put(subscribeGeohash, function (err, response) { 
            if (err) {
                console.log(err);
            }
        });
    }
    
    var createDocument = function (mapid, obj) {
        db.put(obj, function (err, response) { 
            // if document already exist and there is no _rev, there should be chosen another _id.
            if (err && err.status == 409 && obj._rev == null) {
                obj._id = getId(obj);
                docStore[obj.owner][obj.type][obj._id] = {id : mapid};
                console.log("use other _id");
                // call create method again.
                createDocument(mapid, obj);
                return;
            }
            if (err) {
                output.error(err.message);
                return;
            }
            console.log('ok');
            return;
            
            // TODO this has to  be done in the db.changes() callback where the successfully uploaded object will be synched.
            
			/* restore the object id and set the response object to the map storage (because the _rev and _id changed). */
			if (self.newTripFlag) {
                $('#trip' + id).prop('href', 'logbook/' + self.boat + '/' + response._id);
            }
			
            /* If we have uploaded an item with an image (mark, waypoint, ...) we have to upload the image file now */
            if (image_big) {
                console.log("TODO : image upload should be implemented.")
            }
        });
    }

    /* this callback will be called if settings (unit for distance, logging interval,...) should be saved to the server */
    map.addCallback(events.UPDATED_SETTINGS, function (self) {
        if (!complete) return;
        // set the id of the settings document
        self._id = seapal.user + '/settings';
        db.put(self, function(err, response) {   
            if (err) {
                console.log(err);
            }
        });
    });

    /* this callback will be cyclic called if tracking is enabled, and return the position of the boat in lat, lng and geohash. */
    map.addCallback(events.GEO_POSITION_UPDATE, function (self) {
        if (!complete) return;
        console.log("GEO_POSITION_UPDATE");
        geoPosition.geohash = self.geohash;
        geoPosition.lat = self.lat;
        geoPosition.lng = self.lng;
        
        db.put(geoPosition, function(err, response) {
            if (err) {
                console.log(err);
            }
        });
    });
});
