

console.log( "ready!" );
var db = new PouchDB('http://localhost:9000/database');
console.log(db);

db.get("2A8EF33F-6B97-AFDD-BDAC-58A58B226F56", function(err, doc) { 
    console.log("Dokument müsste existieren:");
    console.log(err);
    console.log(doc);
});


db.post({
  title: 'neues dokument das es jetzt ziemlich oft gibt...'
}, function (err, response) { 
    console.log(err);
    console.log(response);
});

