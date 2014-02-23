/**
 * isLoggedIn.js
 *
 * This javascript file will be used if a user is logged in.
 *
 */

$(document).ready(function() {
    events = map.getEvents();
    var templateFriendRequests = Handlebars.compile($("#template-friendRequests").html());

    /* local list to store friend requests */
    var receivedRequests = {};
    /* local friend list, which can be checked for new friends */
    var friend_list = [];
    /* method to call friend request list cylic */
    var friendRequest = function(){
        request = $.ajax({
            url         : "api/all/asking",
            type        : "get",
            contentType : "application/json",
        });

        request.done(function (response, textStatus, jqXHR){
            /* run through all requests and check if they will already be displayed. */
            for (var i in response.person_info) {
                if (!receivedRequests[response.person_info[i].owner]) {
                    $("#friendRequests").append(templateFriendRequests(response.person_info[i]));
                    receivedRequests[response.person_info[i].owner] = response.person_info[i];
                }
            }
            /* there are no friend requests */
            if (Object.keys(receivedRequests).length === 0) {
                $("#logbook-friendRequests").hide();
            } else {
                $("#logbook-friendRequests").show();
            }

            /* check if you have a new friend */
            if (friend_list.length != response.account_info.friend_list.length) {
                newFriendsRequest = $.ajax({
                    url         : "api/all/friends",
                    type        : "get",
                    contentType : "application/json",
                });

                newFriendsRequest.done(function (response, textStatus, jqXHR){
                    for (var i in response.person_info) {
                        /* friend entry not exist, download the info about the new friend now. */
                        if (-1 == friend_list.indexOf(response.person_info[i]._id)) {
                            friend_list.push(response.person_info[i]._id);
                            map.set('person', response.person_info[i]);
                        }
                    }
                });
            }
        });
    };

 	/* this callback will be called if an object was updated by a user */
    map.addCallback([events.SWITCHED_PERSON], function (self) {
        $("#tracks").html("");
        $("#logbook-trips").html("");
        $("#routes").html("");
        $("#logbook-boats").html("");
        $("#marks").html("");

        /* startup code initialise objects from the server */
        request = $.ajax({
            url         : "api/all/all",
            type        : "get",
            contentType : "application/json",
        });

        /* callback handler that will be called on success */
        request.done(function (response, textStatus, jqXHR){
            console.log(response);
            var firstBoat = null;
            response.boat.map( function(item) {
                if (item.owner == self.owner) {
                    map.set('boat', item);
                    firstBoat = (null == firstBoat) ? item._id : firstBoat;
                }
            });
            /* select the default boat */
            if (null != firstBoat) {
                map.select('boat', firstBoat);
            }
            response.mark.map( function(item) {
                if (item.owner == self.owner) {
                    map.set('mark', item);
                }
            });
            response.route.map( function(item) {
                if (item.owner == self.owner) {
                    map.set('route', item);
                }
            });
            response.trip.map( function(item) {
                if (item.owner == self.owner) {
                    map.set('trip', item);
                }
            });
            response.waypoint.map( function(item) {
                if (item.owner == self.owner) {
                    map.set('waypoint', item);
                }
            });
        });
    });

    /* startup code initialise objects from the server */
    request = $.ajax({
        url         : "api/all/own",
        type        : "get",
        contentType : "application/json",
    });

    /* callback handler that will be called on success */
    request.done(function (response, textStatus, jqXHR){
        response.person_info.map( function(item) {
            map.set('person', item);
        });
        /* select the default person */
        if (response.person_info.length) {
            map.select('person', response.person_info[0]._id);
        }
        /* trigger friend list */
        friendRequest();
        /* sset cylcic friend request every minute */
        setInterval(friendRequest, 6000);
    });

    /* callback handler that will be called on failure */
    request.fail(function (jqXHR, textStatus, errorThrown){
        console.log(jqXHR);
        console.log(textStatus);
        console.log(errorThrown);
        console.log("error");
    });

    /* callback for adding a crew member */
    menu.addCallback('leftclick', 'logbookCrewAdd', function (self) {
        menu.disableAutoClose();
        $('#modal-form_addCrewman').modal('show');
    });

    /* on click of button to sent the friend request */
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
			output.error("Friend request failed: "+textStatus);
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
                friendRequest();
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
                friendRequest();
            });
        });
    });

    $('#modal-form_confirmCrewRequest').on('hidden.bs.modal',
        function() {
            menu.enableAutoClose();
            $('#confirmCrewRequestInputForm').html("");
        }
    );

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
            type        : "delete"
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
            /* restore the object id and set the response object to the map storage (because the _rev and _id changed). */
			response.id = objectId;
            response.type = self.type;
            response.image_big = null;
			map.set(self.type, response);
            /* If we have uploaded an item with an image (mark, waypoint, ...) we have to upload the image file now */
            if (image_big) {
                var formData = new FormData();
                formData.append("picture", image_big);

                var xhr = new XMLHttpRequest();
                xhr.open("POST", "/api/photo/"+response._id);
                xhr.send(formData);
            }
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
