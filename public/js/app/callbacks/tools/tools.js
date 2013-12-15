/**
 * tools.js
 *
 * Define the actions for the tool entry's.
 * 
 */
 
$(document).ready(function() {    
    tools.addCallback('icon-startLogging', function (self) {
        self.text("Stop Logging");
        self.removeClass('icon-startLogging').addClass('icon-stopLogging');
    });
    
    tools.addCallback('icon-stopLogging', function (self) {
        self.text("Start Logging");
        self.removeClass('icon-stopLogging').addClass('icon-startLogging');
    });
    
    tools.addCallback('icon-takePhoto', function (self) {
        menu.closeMenu();        
        window.camera.setup("photo-video", "photo-button");
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
        output.info("This feature is helpfull if your are running Seapal on your mobile device and north should always be on top.");
    });  
 
    tools.addCallback('icon-disableSleepMode', function (self) {
        output.info("You cannot disable sleep mode in the web app. This feature is helpfull to keep the screen of your mobile device on while the seapal app is running.");
    });

    tools.addCallback('icon-discardTarget', function (self) {
        console.log('icon-discardTarget');
    });
});