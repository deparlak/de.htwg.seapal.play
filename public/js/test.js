

$(document).ready(function(){
    console.log( "ready!" );
    var idCounter = {};
    var user = "test@test.de";
    
    var db = new PouchDB('http://localhost:9000/database/');
    console.log(db);

   
    allDocsOptions = {};
    allDocsOptions.include_docs = false;
//    allDocsOptions.startkey = "username/boat/0";
 //   allDocsOptions.endkey = "username/boat/99";
    
  //  db.get('username/boat/1', function(err, doc) { console.log(doc);});
    
    db.allDocs(allDocsOptions, function(err, response) {
        console.log("FETCH DOCS RESULT");
        if (err) {
            console.log(err);
            return;
        } else {
            console.log(response);
            // go through all docs and generate the doc id counter
            for (var i in response.rows) {
                // split key of document
                obj = response.rows[i].key.split('/');
                // we expect username/type/id
                if (3 != obj.length) continue;
                // create documents is only in own docs possible
                if (user != obj[0]) continue;
                // if type is not in idCount, create it
                if (!idCounter[obj[1]]) idCounter[obj[1]] = 1;
                // increment idCount for the type
                idCounter[obj[1]]++;
            }
        }
        console.log(idCounter);
        if (!idCounter['boat'] || 0 >= idCounter['boat']) {
            idCounter['boat'] = 1;
        }
        if (!idCounter['mark'] || 0 >= idCounter['mark']) {
            idCounter['mark'] = 1;
        }
        console.log(idCounter);
    });

    var changes = db.changes({
        since: 'now',
        live: true
    }).on('change', function(change) { 
        console.log(change);    
    }).on('error', function(err) { 
        console.log(err);
    }).on('uptodate', function(info) { 
        console.log(info);
    });
    
    var getId = function (type) {
        idStr = idCounter[type].toString();
        idCounter[type]++;
        for (var i = idStr.length; i < 6; i++) {
            idStr = "0" + idStr;
        }
        return user + '/' + type + '/' + idStr;
    }
    
    
    $('#createTestBoat').click(function(){
        var doc = 
        {
            owner       : user,
            title       : 'Irgend ein Boot',
            type        : 'boat',
            _id         : getId('boat'),
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
    
    $('#createTestMark').click(function(){
        var doc = 
        {
            owner       : user,
            title       : 'Irgend ein Mark',
            type        : 'mark',
            _id         : getId('mark'),
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
    
    $('#createFriendRequest').click(function() {
        from = user;
        to = 'user@user.de';
        // set same ordering, no matter from which address the request will be sent
        first = (to > from) ? to : from;
        second = (first == to) ? from : to;
        
        var doc = 
        {
            type        : 'friend',
            to          : to,
            from        : from,
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
        to = 'user@user.de';
        // set same ordering, no matter from which address the request will be sent
        first = (to > from) ? to : from;
        second = (first == to) ? from : to;
        _id = 'friend'+'/'+first+'/'+second;

        db.get(_id, function (err, response) { 
            if (err) {
                console.log(err);
            } else {
                db.put(response, function(err, response) { console.log(err);});
            }
        });
    });
    
    $('#rejectFriendRequest').click(function() {
        from = user;
        to = 'user@user.de';
        // set same ordering, no matter from which address the request will be sent
        first = (to > from) ? to : from;
        second = (first == to) ? from : to;
        _id = 'friend'+'/'+first+'/'+second;

        db.get(_id, function (err, response) { 
            if (err) {
                console.log(err);
            } else {
                db.remove(response._id, response._rev, function(err, response) { console.log(err);});
            }
        });
    });
});
 
