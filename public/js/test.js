

$(document).ready(function(){
    console.log( "ready!" );
    var idCounter = {};
    var user = seapal.user;
    
    if (user == '') {
        console.log("error no user");
    } else {
        console.log("hello : "+user);
    }
    
    var db = new PouchDB('http://localhost:9000/database/');
    console.log(db);

   
    allDocsOptions = {};
    allDocsOptions.include_docs = true;
    
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

    db.changes({since : 'now', live : true})
      .on('change', function (info) {
        console.log(info);
      }).on('complete', function (info) {
        console.log(info);
      }).on('error', function (err) {
        console.log(err);
      });
    
    var getId = function (type) {
        idStr = idCounter[type].toString();
        idCounter[type]++;
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
 
