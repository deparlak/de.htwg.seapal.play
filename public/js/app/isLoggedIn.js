/**
 * isLoggedIn.js
 *
 * This javascript file will be used if a user is logged in.
 * 
 */
 
$(document).ready(function() {    
    events = map.getEvents();
	
	/* this callback will be called if marks where loaded from the server */
    map.addCallback(events.SERVER_REMOVE, function (self) {
		console.log("delete "+self.type);
		console.log("-----------------");
		console.log(self);
		console.log("-----------------");
    });

	/* this callback will be called if marks where loaded from the server */
    map.addCallback(events.SERVER_CREATE, function (self) {
        console.log("create "+self.type);
		console.log("-----------------");
		console.log(self);
		console.log("-----------------");

        /* request to server for login */
        request = $.ajax({
            url         : "api/"+self.type,
            type        : "post",
            contentType : "application/json",
            data        : JSON.stringify(self),
        });

        /* callback handler that will be called on success */
        request.done(function (response, textStatus, jqXHR){
			console.log(response._rev);
            console.log(self);
            self._rev = response._rev;
            self._id = response._id;
			//map.set(self.type, self);
        });

        /* callback handler that will be called on failure */
        request.fail(function (jqXHR, textStatus, errorThrown){
			console.log(jqXHR);
			console.log(textStatus);
			console.log(errorThrown);
			console.log("error");
        });
    });
});