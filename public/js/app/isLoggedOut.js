/**
 * isLoggedOut.js
 *
 * This javascript file will be used if a user is not logged in.
 * 
 */
 
$(document).ready(function() {    
    events = map.getEvents();
	var a = 0;
	var b = 99;
	
	/* this callback will be called if marks where loaded from the server */
    map.addCallback(events.SERVER_REMOVE, function (self) {
		console.log("delete "+self.type);
		console.log("-----------------");
		console.log(self);
		console.log(b);
		b++;
		console.log("-----------------");
    });

	/* this callback will be called if marks where loaded from the server */
    map.addCallback(events.SERVER_CREATE, function (self) {
		console.log("create "+self.type);
		console.log("-----------------");
		console.log(self);
		console.log(a);
		a++;
		console.log("-----------------");
    });
});