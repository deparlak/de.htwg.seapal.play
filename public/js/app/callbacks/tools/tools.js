/**
 * tools.js
 *
 * Define the actions for the tool entry's.
 * 
 */
 
$(document).ready(function() {    
    tools.addCallback('leftclick', 'icon-startLogging', function (self) {
        if(map.startTracking()) {
            self.text("Stop Logging");
            self.removeClass('icon-startLogging').addClass('icon-stopLogging');
        }
    });

    tools.addCallback('leftclick', 'icon-stopLogging', function (self) {
        self.text("Start Logging");
        self.removeClass('icon-stopLogging').addClass('icon-startLogging');
        map.stopTracking();
    });
    
    tools.addCallback('leftclick', 'icon-takePhoto', function (self) {
        menu.closeMenu();        
        window.camera.setup("photo-video", "photo-button");
        $('#modal-photo').modal('show');
    });
    
    tools.addCallback('leftclick', 'icon-setMark', function (self) {
        map.setMark();
        tools.closeMenu();
    });  
    
    tools.addCallback('leftclick', 'icon-setRoute', function (self) {
        map.setRoute();
        tools.closeMenu();
    });  
    
    tools.addCallback('leftclick', 'icon-GetDistance', function (self) {
        map.getDistance();
        tools.closeMenu();
    });  
    
    tools.addCallback('leftclick', 'icon-PersonOverBoard', function (self) {
        map.togglePersonOverboard();
    });  
    
    tools.addCallback('leftclick', 'icon-SecurityCircle', function (self) {
        map.toggleSecurityCircle();
    });  
    
    tools.addCallback('leftclick', 'icon-NorthUp', function (self) {
        output.info("This feature is helpfull if your are running Seapal on your mobile device and north should always be on top.");
    });  
 
    tools.addCallback('leftclick', 'icon-disableSleepMode', function (self) {
        output.info("You cannot disable sleep mode in the web app. This feature is helpfull to keep the screen of your mobile device on while the seapal app is running.");
    });

    tools.addCallback('leftclick', 'icon-discardTarget', function (self) {
        map.discardTarget();
    });
});