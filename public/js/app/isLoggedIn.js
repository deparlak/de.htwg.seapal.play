/**
 * isLoggedIn.js
 *
 * This javascript file will be used if a user is logged in.
 * 
 */
 
$(document).ready(function() {    
    events = map.getEvents();
	
    /* startup code initialise objects from the server */
    request = $.ajax({
        url         : "api/boat/own",
        type        : "get",
        contentType : "application/json",
    });

    /* callback handler that will be called on success */
    request.done(function (response, textStatus, jqXHR){
        console.log(jqXHR);
        console.log(textStatus);
        console.log(response);
        return;
        for (var i in response) {
            map.set('mark', response[i]);
        }
        console.log("success");
    });

    /* callback handler that will be called on failure */
    request.fail(function (jqXHR, textStatus, errorThrown){
        console.log(jqXHR);
        console.log(textStatus);
        console.log(errorThrown);
        console.log("error");
    });
    
	/* this callback will be called if marks where loaded from the server */
    map.addCallback(events.SERVER_REMOVE, function (self) {
		console.log("delete "+self.type);
		console.log("-----------------");
		console.log(self);
		console.log("-----------------");
        /* 
            if there is no _id from the server, this object wasn't yet uploaded, so we can't delete it.
        */
        if (null == self._id) return;
        /* post to server */
        request = $.ajax({
            url         : "api/"+self.type+"/"+self._id,
            type        : "delete",
            contentType : "application/json",
        });

        /* callback handler that will be called on success */
        request.done(function (response, textStatus, jqXHR){
            console.log("delete success");
        });

        /* callback handler that will be called on failure */
        request.fail(function (jqXHR, textStatus, errorThrown){
			console.log(jqXHR);
			console.log(textStatus);
			console.log(errorThrown);
			console.log("error");
        });
    });

	/* this callback will be called if marks where loaded from the server */
    map.addCallback(events.SERVER_CREATE, function (self) {
        console.log("create "+self.type);
		console.log("-----------------");
		console.log(self);
		console.log("-----------------");
        /* 
            we set the id which will be used by the client as a handle for the object to null, 
            because the server will interpret an 'id' as a '_id'.
        */
        var objectId = self.id;
        self.id = null;
        /* post to server */
        request = $.ajax({
            url         : "api/"+self.type,
            type        : "post",
            contentType : "application/json",
            data        : JSON.stringify(self),
        });

        /* callback handler that will be called on success */
        request.done(function (response, textStatus, jqXHR){
            /* restore the object id and set the response object to the map storage (because the _rev and _id changed). */
			response.id = objectId;
            response.type = self.type;
			map.set(self.type, response);
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