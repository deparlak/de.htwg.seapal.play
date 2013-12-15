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
});