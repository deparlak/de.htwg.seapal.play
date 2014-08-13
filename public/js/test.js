

$(document).ready(function(){
    console.log( "ready!" );
    var docStore = {};
    var user = seapal.user;
    
    if (user == '') {
        console.log("error no user");
    } else {
        console.log("hello : "+user);
    }
    
    var db = new PouchDB('http://localhost:9000/database/');
    console.log(db);

    db.allDocs({include_docs : true}, function(err, response) {
        console.log("FETCH DOCS RESULT");
        if (err) {
            console.log(err);
            return;
        } else {
            console.log(response);
            // go through all docs and generate the doc id counter
            for (var i in response.rows) {
                storeDocument(response.rows[i].doc)     
            }
            console.log(docStore);
        }
    });

    db.changes({since : 'now', live : true, include_docs : true})
        .on('change', function (info) {
            console.log(info);
            storeDocument(info.doc);
        }).on('complete', function (info) {
            console.log(info);
        }).on('error', function (err) {
            console.log(err);
        });
        
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
    
    var createDoc = function(type) {
        var doc = 
        {
            owner       : user,
            title       : 'Irgend ein '+type,
            type        : type,
            _id         : getId(type),
            _rev        : null
        };

        db.put(doc, function (err, response) { 
            if (err) {
                console.log(err);
            } else {
                console.log(response);
            }
        });
    };
    
    var bulkDoc = function (type) {
        console.log('START');
        all_docs = [];
        for (var i = 0; i < 100; i++) {
            var doc = 
            {
                owner       : user,
                title       : 'Irgend ein '+type,
                type        : type,
                _id         : getId(type),
                _rev        : null
            };
            all_docs.push(doc);
        }
        console.log('END');
        db.bulkDocs(all_docs, function (err, response) { 
            if (err) {
                console.log(err);
            } else {
                console.log(response);
            }
        });
    };
    
    $('#createTestBoat').click(function(){
        createDoc('boat');
    });
    
    $('#createTestMark').click(function(){
        createDoc('mark');
    });
    
    $('#multipleCreate').click(function(){
        bulkDoc('boat');
    });
    
    $('#createFriendRequest').click(function() {
        from = user;
        to = (user == 'user@user.de') ? 'test@test.de' : 'user@user.de';
        // set same ordering, no matter from which address the request will be sent
        first = (to > from) ? to : from;
        second = (first == to) ? from : to;
        
        var doc = 
        {
            type        : 'friend',
            to          : to,
            from        : from,
            access      : false,
            _id         : 'friend'+'/'+first+'/'+second,
            _rev        : null
        };
        console.log(doc);
        db.put(doc, function (err, response) { 
            if (err) {
                console.log(err);
            } else {
                console.log(response);
            }
        });
    });
    
    $('#acceptFriendRequest').click(function() {
        from = user;
        to = (user == 'user@user.de') ? 'test@test.de' : 'user@user.de';
        // set same ordering, no matter from which address the request will be sent
        first = (to > from) ? to : from;
        second = (first == to) ? from : to;
        _id = 'friend'+'/'+first+'/'+second;

        db.get(_id, function (err, response) { 
            if (err) {
                console.log(err);
            } else {
                response.access = true;
                db.put(response, function(err, response) { 
                    if (err) {
                        console.log(err);
                    } else {
                        console.log(response);
                    }
                });
            }
        });
    });
    
    $('#rejectFriendRequest').click(function() {
        from = user;
        to = (user == 'user@user.de') ? 'test@test.de' : 'user@user.de';
        // set same ordering, no matter from which address the request will be sent
        first = (to > from) ? to : from;
        second = (first == to) ? from : to;
        _id = 'friend'+'/'+first+'/'+second;

        db.get(_id, function (err, response) { 
            if (err) {
                console.log(err);
            } else {
                db.remove(response, function(err, response) { 
                    if (err) {
                        console.log(err);
                    } else {
                        console.log(response);
                    }
                });
            }
        });
    });
});
 
