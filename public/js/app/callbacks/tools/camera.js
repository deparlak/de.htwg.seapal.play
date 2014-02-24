/**
 * camera.js
 *
 * Define the actions for the camera modal.
 *
 */

$(document).ready(function() {
    /**
      * Closes the connection to the camera when photo modal is closed
      */
    $('#modal-photo').on('hidden.bs.modal', function() {
        window.camera.disable_camera();
    });

    /**
      * Handles the take photo click event!
      */
    $('#photo-button').on('click', function() {
        var image = window.camera.captureImage();
        map.setImageMark(image);
    });

    events = map.getEvents();

    /* Opens a fancybox with the image */
    function openFancybox(picture, text) {
        var reader = new FileReader();

        reader.onloadend = function(event) {
            $.fancybox({
                'autoScale': true,
                'transitionIn': 'elastic',
                'transitionOut': 'elastic',
                'speedIn': 500,
                'speedOut': 300,
                'autoDimensions': true,
                'centerOnScroll': true,
                'title' : text,
                'helpers' : {
                    title : {
                        type : 'over'
                    }
                },
                'href' : event.target.result
            });
        };

        reader.readAsDataURL(picture);
    }

	/* this callback will be called if an object was loaded from the server */
    map.addCallback([events.SHOW_IMAGE], function (self) {
        /* is picture already there? */
        if (null != self.image_big) {
            console.log(self);
            openFancybox(self.image_big, new Date(self.date).toLocaleString());
            return;
        }

        /* get image from the server */
        request = $.ajax({
            url         : "api/photo/"+self._id+"/"+self.type,
            type        : "get"
        });

        /* callback handler that will be called on success */
        request.done(function (response, textStatus, jqXHR){
            console.log(response);
            self.image_big = response;
            map.set(self.type, self);
            openFancybox(self.image_big, new Date(self.date).toLocaleString());
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
