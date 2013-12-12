/**
 * menu.js
 *
 * Define the actions for the tool entry's.
 * 
 */
 
$(document).ready(function() {    
    tools = new menubar( 'tools' );

    tools.addCallback('icon-startLogging', function (self) {
        
        console.log('icon-startLogging');
    });
    
    tools.addCallback('icon-stopLogging', function (self) {
        
        console.log('icon-stopLogging');
    });
    
    tools.addCallback('icon-takePhoto', function (self) {
        menu.closeMenu();        
        window.cameraApi.setup("photo-video", "photo-button");
        $('#modal-photo').modal('show');
    });
    
    tools.addCallback('icon-setMark', function (self) {
        map.setMark();
        tools.closeMenu();
    });  
    
    tools.addCallback('icon-setRoute', function (self) {
        map.setRoute();
        tools.closeMenu();
    });  
    
    tools.addCallback('icon-GetDistance', function (self) {
        map.getDistance();
        tools.closeMenu();
    });  
    
    tools.addCallback('icon-PersonOverBoard', function (self) {
        console.log('icon-PersonOverBoard');
    });  
    
    tools.addCallback('icon-SecurityCircle', function (self) {
        
        console.log('icon-SecurityCircle');
    });  
    
    tools.addCallback('icon-NorthUp', function (self) {
        
        console.log('icon-NorthUp');
    });  
 
    tools.addCallback('icon-disableSleepMode', function (self) {
        
        console.log('icon-disableSleepMode');
    });

    tools.addCallback('icon-discardTarget', function (self) {
        
        console.log('icon-discardTarget');
    });

    /**
      * Closes the connection to the camera when photo modal is closed 
      */
    $('#modal-photo').on('hidden.bs.modal', function() {
        window.cameraApi.disable_camera();
    });

    /**
      * Handles the take photo click event!
      */
    $('#photo-button').on('click', function() {
        var image = window.cameraApi.captureImage();
        map.setImageMark(image);
    });
});