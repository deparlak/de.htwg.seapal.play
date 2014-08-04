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
            'href' : picture
        });
    }

    /* Opens a fancybox with the image */
    function loadToFancybox(blob, text) {
        var reader = new FileReader();

        reader.onloadend = function(event) {
            openFancybox(event.target.result, text);
        };

        reader.readAsDataURL(blob);
    }

	/* this callback will be called if an object was loaded from the server */
    map.addCallback([events.SHOW_IMAGE], function (self) {
        /* is picture already there? */
        if (null != self.image_big) {
            loadToFancybox(self.image_big, new Date(self.date).toLocaleString());
        } else {
            var url = "api/photo/"+self._id+"/"+self.type+".jpg";
            openFancybox(url, new Date(self.date).toLocaleString());
        }
    });
});
