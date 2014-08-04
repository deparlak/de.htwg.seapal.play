/**
 * tools.js
 *
 * Define the actions for the tool entry's.
 * 
 */
 
$(document).ready(function() {
    events = map.getEvents();

    tools.addCallback('leftclick', 'icon-startLogging', function (self) {
        startTracking(self);
    });

    tools.addCallback('leftclick', 'icon-stopLogging', function (self) {
        self.text("Start Logging");
        self.removeClass('icon-stopLogging').addClass('icon-startLogging');
        $('.fa-stop').removeClass('fa-stop').addClass('fa-play');
        map.stopTracking();
    });
    
    tools.addCallback('leftclick', 'icon-takePhoto', function (self) {
        menu.closeMenu();        
        takePhoto();
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

    function startTracking(button) {
        if(map.startTracking()) {
            button.text("Stop Logging");
            button.removeClass('icon-startLogging').addClass('icon-stopLogging');
            $('.fa-play').removeClass('fa-play').addClass('fa-stop');
            return true;
        }
        return false;
    }

    function takePhoto() {
        window.camera.setup("photo-video", "photo-button");
        $('#modal-photo').modal('show');
    }

    map.addCallback([events.MAN_OVERBOARD], function(event) {
        startTracking($('.icon-startLogging'));
    });

    $('#positionIcon').click(function() {
        map.followPosition();
    });

    $('#photoIcon').click(function() {
        takePhoto();
    });

    $('#trackIcon').click(function() {
        if(!startTracking($('.icon-startLogging'))) {
            map.stopTracking();
            $('.fa-stop').removeClass('fa-stop').addClass('fa-play');
            $('.icon-stopLogging').removeClass('icon-stopLogging').addClass('icon-startLogging');
        }
    });
});