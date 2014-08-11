

$(document).ready(function(){
    console.log( "ready!" );
    var boatID = 1;
    var markID = 1;
    
   var db = new PouchDB('database');
    console.log(db);

   
    allDocsOptions = {};
    allDocsOptions.include_docs = false;
    allDocsOptions.startkey = "username_boat_0";
    allDocsOptions.endkey = "username_boat_99";
    
  //  db.get('username_boat_1', function(err, doc) { console.log(doc);});
    
    db.allDocs(allDocsOptions, function(err, response) {
        console.log("FETCH DOCS RESULT");
        if (err) {
            console.log(err);
            return;
        } else {
            console.log(response);    
            for (var i in response.rows) {
                console.log(response.rows[i].doc);
            }
        }
        if (0 < response.rows.length) {
            boatID = response.rows.length;
        }
    });

    options = {};
    options.live = true;
    PouchDB.replicate('http://localhost:9000/database/', db, options)
        .on('change', function (info) {
            console.log(info);
        }).on('complete', function (info) {
            console.log(info);
        }).on('uptodate', function (info) {
            console.log(info);
        }).on('error', function (err) {
            console.log(err);
        });
        
    PouchDB.replicate(db, 'http://localhost:9000/database/', options)
        .on('change', function (info) {
            console.log(info);
        }).on('complete', function (info) {
            console.log(info);
        }).on('uptodate', function (info) {
            console.log(info);
        }).on('error', function (err) {
            console.log(err);
        });
       
    $('#createTestBoat').click(function(){
        var doc = 
        {
            title       : 'Irgend ein Boot',
            type        : 'boat',
            _id         : 'username'+'_'+'boat'+'_'+boatID.toString(),
            _rev        : null
        };
        console.log(doc);
        db.put(doc, function (err, response) { 
            if (err) {
                console.log(err);
            } else {
                console.log(response);
            }
            boatID++;
        });
    });
    
    $('#createTestMark').click(function(){
        var doc = 
        {
            title       : 'Irgend ein Mark',
            type        : 'mark',
            _id         : 'username'+'_'+'mark'+'_'+markID.toString(),
            _rev        : null
        };
        console.log(doc);
        db.put(doc, function (err, response) { 
            if (err) {
                console.log(err);
            } else {
                console.log(response);
            }
            markID++;
        });
    });
});
 
