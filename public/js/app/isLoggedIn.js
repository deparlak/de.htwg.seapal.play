/**
 * isLoggedIn.js
 *
 * This javascript file will be used if a user is logged in.
 *
 */

$(document).ready(function() {
    events = map.getEvents();
    var templateFriendRequests = Handlebars.compile($("#template-friendRequests").html());
    var user = seapal.user;
    // TODO we use docStore to handle all documents, because replication is actually not working with pouchdb to couchbase sync gateway.
    // If the bug is fixed, we should use the replication instead of this variable.
    // See https://github.com/pouchdb/pouchdb/issues/1666
    var docStore = {};

    var db = new PouchDB('http://localhost:9000/database/');
    
    // initial start up code, which fetch all docs and store them to the docStore.
    // This call should be replaced with a PouchDB.sync()
    db.allDocs({include_docs : true}, function(err, response) {
        console.log("FETCH DOCS RESULT");
        if (err) {
            output.error(err);
        } else {
            // run through all docs and store them in the docStore
            for (var i in response.rows) {
                storeDocument(response.rows[i].doc)     
            }
            console.log(docStore);
        }
    });
    
    // listen on database changes with longpoll. This call can be removed if PouchDB.sync() is working.
    db.changes({since : 'now', live : true, include_docs : true})
        .on('change', function (info) {
            console.log(info);
            storeDocument(info.doc);
        }).on('complete', function (info) {
            console.log(info);
        }).on('error', function (err) {
            console.log(err);
        });
    
    //helper function to store a document in the docStore variable
    var storeDocument = function (doc) {
        // split key of document
        var obj = doc._id.split('/');
        // we expect username/type/id, if this is not given, we ignore the document
        if (3 != obj.length) return;
        var user = obj[0];
        var type = obj[1];
        var id = obj[2];
        // check if user is already in docStore
        if (undefined === docStore[user]) docStore[user] = {};
        // check if document type is in docStore
        if (undefined === docStore[user][type]) docStore[user][type] = {_counter : 0};
        // check if it was not a document deletion
        if (undefined !== doc._deleted) {
            // check if it is a document update or not
            if (undefined === docStore[user][type][id]) docStore[user][type]['_counter']++;
            // store the document
            docStore[user][type][id] = doc;
            // check if document was stored in before and call the hook
        } else {
            // remove the document from the docStore
            delete docStore[user][type][id];
            // call the hook for the deleted document
        }
    };
    
    // Helper function to generate the id, with which a document should be stored on the server.
    var getId = function (type) {
        if (undefined === docStore[user]) docStore[user] = {};
        if (undefined === docStore[user][type]) docStore[user][type] = {_counter : 0};
        docStore[user][type]['_counter']++;
        idStr = docStore[user][type]['_counter'].toString();
        for (var i = idStr.length; i < 6; i++) {
            idStr = "0" + idStr;
        }
        return user + '/' + type + '/' + idStr;
    }
    
 	/* this callback will be called if an object was updated by a user */
    map.addCallback([events.SWITCHED_PERSON], function (self) {
        $("#tracks").html("");
        $("#logbook-trips").html("");
        $("#routes").html("");
        $("#logbook-boats").html("");
        $("#marks").html("");
        
        console.log('TODO');
        console.log(self);
        return;

        ['boat', 'route', 'mark', 'trip', 'waypoint'].forEach(function(type) {
            response[type].map( function(item) {
                map.set(type, item);
            });
        });
    });

    /* callback to open the modal with which a friend request can be send */
    menu.addCallback('leftclick', 'logbookCrewAdd', function (self) {
        menu.disableAutoClose();
        $('#modal-form_addCrewman').modal('show');
    });

    /* on click of button to sent a friend request */
    $('#modal-form_addCrewman').submit(function(event) {
        $('#modal-form_addCrewman').modal('hide');

        /* post to server */
        request = $.ajax({
            url         : "/api/sendFriendRequestMail/"+$('#email_addCrewman').val(),
            type        : "get",
        });

        /* callback handler that will be called on success */
        request.done(function (response, textStatus, jqXHR){
            output.info("Friend request send");
        });

        /* callback handler that will be called on failure */
        request.fail(function (jqXHR, textStatus, errorThrown){
            var res = JSON.parse(jqXHR.responseText);            
			output.error("Friend request failed: " + res.error);
        });
        return false;
    });

    /* Callback for confirm crew request */
    menu.addCallback('leftclick', 'icon-friendRequests', function (self) {
        var template = Handlebars.compile($("#confirmCrewRequest_Template").text());
        var html = template(receivedRequests[self.data('id')]);
        $('#confirmCrewRequestInputForm').html(html);

        menu.disableAutoClose();
        $('#modal-form_confirmCrewRequest').modal('show');

        $('#rejectCrewRequest').on('click', function() {
            $('#modal-form_confirmCrewRequest').modal('hide');

            request = $.ajax({
                url         : "api/abortFriendRequest/"+self.data('id'),
                type        : "get"
            });
            /* callback handler that will be called on success */
            request.done(function (response, textStatus, jqXHR){
                $("#friendRequests"+self.data('id')).remove();
                delete receivedRequests[self.data('id')];
                if (0 == Object.keys(receivedRequests).length) {
                    friendRequest();
                    $("#logbook-friendRequests").hide();
                }
            });
        });

        $('#confirmCrewRequest').on('click', function() {
            $('#modal-form_confirmCrewRequest').modal('hide');

            request = $.ajax({
                url         : "api/sendFriendRequest/"+self.data('id'),
                type        : "get"
            });
            /* callback handler that will be called on success */
            request.done(function (response, textStatus, jqXHR){
                $("#friendRequests"+self.data('id')).remove();
                delete receivedRequests[self.data('id')];
                if (0 == Object.keys(receivedRequests).length) {
                    friendRequest();
                    $("#logbook-friendRequests").hide();
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
        /* if there is no _id from the server, this object was not uploaded, so we do not send a server request. */
        if (null == self._id) return;

        /* post to server */
        request = $.ajax({
            url         : "api/"+self.type+"/"+self._id,
            type        : "delete"
        });

        /* callback handler that will be called on failure */
        request.fail(function (jqXHR, textStatus, errorThrown){
			var res = JSON.parse(jqXHR.responseText);
            output.error(res.error);
        });
    });

	/* this callback will be called if a document (mark, route, track,...) should be created on the server */
    map.addCallback(events.SERVER_CREATE, function (self) {
        /*
            we set the id which will be used by the client as a handle for the object to null,
            because the server will interpret an 'id' as a '_id'.
        */
        var objectId = self.id;
        var image_big = null;
        self.id = null;

        /*
            If we like to upload an image, save the image to a variable,
            because the image has to be uploaded seperatly.
        */
        if (self.image_big) {
            image_big = self.image_big
            self.image_big = null;
        }

        /* post to server */
        request = $.ajax({
            url         : "api/"+self.type,
            type        : "post",
            contentType : "application/json",
            data        : JSON.stringify(self),
        });

        /* callback handler that will be called on success */
        request.done(function (response, textStatus, jqXHR){
            response.id = objectId;
            response.type = self.type;
            response.image_big = null;
			map.set(response.type, response);
			
			 /* restore the object id and set the response object to the map storage (because the _rev and _id changed). */
			if (self.newTripFlag) {
                $('#trip' + objectId).prop('href', 'logbook/' + self.boat + '/' + response._id);
            }
			
            /* If we have uploaded an item with an image (mark, waypoint, ...) we have to upload the image file now */
            if (image_big) {
                var formData = new FormData();
                formData.append("picture", image_big);

                var xhr = new XMLHttpRequest();
                xhr.onreadystatechange = function () {
                    if (xhr.readyState == 4) {
                        var json = JSON.parse(xhr.responseText);
                        /* Adding an attachement changes the revision, so we have to set the revision */
                        response._rev = json._rev;
                        map.set(response.type, response);
                    }
                }
                xhr.open("POST", "/api/photo/"+response._id+"/"+self.type);
                xhr.send(formData);
            }
        });

        /* callback handler that will be called on failure */
        request.fail(function (jqXHR, textStatus, errorThrown){
            var res = JSON.parse(jqXHR.responseText);
            output.error(res.error);
        });
    });

    /* this callback will be called if settings (unit for distance, logging interval,...) should be saved to the server */
    map.addCallback(events.UPDATED_SETTINGS, function (self) {
        console.log('TODO');
        console.log(self);
        /* set response from server back to settings, because the _id and _rev changed. */
        //map.initGlobalSettings(response);
    });
});
