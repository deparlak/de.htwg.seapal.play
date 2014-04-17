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
            url         : "api/account",
            type        : "get",
            contentType : "application/json",
        });
        request.done(function (response, textStatus, jqXHR){
            /* check if friend_list changed */
            if (friend_list.length != response.friend_list.length) {
                request = $.ajax({
                    url         : "api/person/friends",
                    type        : "get",
                    contentType : "application/json"
                });

                request.done(function (friendResponse, textStatus, jqXHR){
                    for (var i in friendResponse) {
                        /* friend entries not exist, set the info about the new friend now. */
                        if (-1 == friend_list.indexOf(friendResponse[i]._id)) {
                            friend_list.push(friendResponse[i]._id);
                            map.set('person', friendResponse[i]);
                        }
                        /* delete the new friend from the receivedRequests if it was already stored there */
                        $("#friendRequests"+friendResponse[i].owner).remove();
                        delete receivedRequests[friendResponse[i].owner];
                        if (0 == Object.keys(receivedRequests).length) {
                            $("#logbook-friendRequests").hide();
                        } 
                    }
                });
            }
            /* check if a friend request occurred */
            if (Object.keys(receivedRequests).length != response.receivedRequests.length) {
                request = $.ajax({
                    url         : "api/names",
                    type        : "get",
                    contentType : "application/json"
                });

                request.done(function (personResponse, textStatus, jqXHR){
                    /* run through all requests and check if they will already be displayed. */
                    for (var i in personResponse) {
                        if (undefined === receivedRequests[personResponse[i].owner]) {
                            $("#friendRequests").append(templateFriendRequests(personResponse[i]));
                            receivedRequests[personResponse[i].owner] = personResponse[i];
                        }
                    }
                    /* there are no friend requests */
                    if (0 == Object.keys(receivedRequests).length) {
                        $("#logbook-friendRequests").hide();
                    } else {
                        $("#logbook-friendRequests").show();
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
            url         : "api/all/"+self.owner,
            type        : "get",
            contentType : "application/json",
        });

        /* callback handler that will be called on success */
        request.done(function (response, textStatus, jqXHR){
            ['boat', 'route', 'mark', 'trip', 'waypoint'].forEach(function(type) {
                response[type].map( function(item) {
                    map.set(type, item);
                });
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
        /* check if settings are available */
        if (response.setting_info.length) {
            map.initGlobalSettings(response.setting_info[0]);
        }
        /* trigger friend list */
        friendRequest();
        /* set cylcic friend request every minute */
        setInterval(friendRequest, 60000);
    });

    /* callback handler that will be called on failure */
    request.fail(function (jqXHR, textStatus, errorThrown){
        var res = JSON.parse(jqXHR.responseText);
        output.error(res.error);
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
            var res = JSON.parse(jqXHR.responseText);            
			output.error("Friend request failed: " + res.error);
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
                if (0 == Object.keys(receivedRequests).length) {
                    friendRequest();
                    $("#logbook-friendRequests").hide();
                }
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
                if (0 == Object.keys(receivedRequests).length) {
                    friendRequest();
                    $("#logbook-friendRequests").hide();
                }
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
        /* if there is no _id from the server, this object was not uploaded, so we do not send a server request. */
        if (null == self._id) return;

        /* post to server */
        request = $.ajax({
            url         : "api/"+self.type+"/"+self._id,
            type        : "delete"
        });

        /* callback handler that will be called on failure */
        request.fail(function (jqXHR, textStatus, errorThrown){
			var res = JSON.parse(jqXHR.responseText);
            output.error(res.error);
        });
    });

	/* this callback will be called if marks where loaded from the server */
    map.addCallback(events.SERVER_CREATE, function (self) {
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
			map.set(response.type, response);
            /* If we have uploaded an item with an image (mark, waypoint, ...) we have to upload the image file now */
            if (image_big) {
                var formData = new FormData();
                formData.append("picture", image_big);

                var xhr = new XMLHttpRequest();
                xhr.onreadystatechange = function () {
                    if (xhr.readyState == 4) {
                        var json = JSON.parse(xhr.responseText);
                        /* Adding an attachement changes the revision, so we have to set the revision */
                        response._rev = json._rev;
                        map.set(response.type, response);
                    }
                }
                xhr.open("POST", "/api/photo/"+response._id+"/"+self.type);
                xhr.send(formData);
            }
        });

        /* callback handler that will be called on failure */
        request.fail(function (jqXHR, textStatus, errorThrown){
            var res = JSON.parse(jqXHR.responseText);
            output.error(res.error);
        });
    });

    map.addCallback(events.UPDATED_SETTINGS, function (self) {
        request = $.ajax({
            url         : "/api/settings",
            type        : "post",
            contentType : "application/json",
            data        : JSON.stringify(self),
        });

        request.done(function (response, textStatus, jqXHR){
            /* set response from server back to settings, because the _id and _rev changed. */
            map.initGlobalSettings(response);
        });
    });
});
