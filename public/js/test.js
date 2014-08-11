

$(document).ready(function(){
    console.log( "ready!" );
    var db = new PouchDB('http://localhost:9000/database/');
    console.log(db);

    
    db.get("boatDoc", function(err, doc) { 
    console.log("Dokument müsste existieren:");
    console.log(err);
    console.log(doc);
    });

    /*
    PouchDB.sync('database', 'http://localhost:9000/database/', {live: true})
        .on('change', function (info) {
            console.log(info);
        }).on('complete', function (info) {
            console.log(info);
        }).on('uptodate', function (info) {
            console.log(info);
        }).on('error', function (err) {
            console.log(err);
        });
  
    $('#createTestData').click(function(){
        console.log(db);
        db.put({
            channels : "test",
            title: 'neues dokument das es jetzt ziemlich oft gibt...'
        }, function (err, response) { 
            console.log(err);
            console.log(response);
        }, "boatDoc");
    });*/
});
 
