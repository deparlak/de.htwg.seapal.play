/**
 * menu.js
 *
 * Define the actions for the menu entry's.
 * 
 */

$(document).ready(function() {

    var alreadySetGlobalSettingsFlag = false; // Checks whether the submit event is already captured by the specific method
    var alreadySetAlarmsSettingsFlag = false; // Checks whether the submit event is already captured by the specific method

    /* on close of the menu, hide all menu-footers which are possible open. */
    menu.on('close', function () {
        $('.menu-footer').removeClass('visible').addClass('hidden');
    });
    /* if we move in a menu back, than we also have to remove all menu-footers which are possible open. */
    menu.addCallback('leftclick', 'icon-menuBack', function (self) {
        $('.menu-footer').removeClass('visible').addClass('hidden');
    });

    menu.addCallback('leftclick', 'icon-fullscreen', function (self) {
        menu.closeMenu();

        if (window.fullScreen.supportsFullScreen) {
            if (!window.fullScreen.isFullScreen()) {
                window.fullScreen.requestFullScreen(document.body);
                self.text("Window");
            } else {
                window.fullScreen.cancelFullScreen(document.body);
                self.text("Fullscreen");
            }
        } else {
            output.info("Your Browser does not support fullscreen mode! Sorry.");
        }
    });
    
    menu.addCallback('leftclick', 'icon-map', function (self) {
        menu.closeMenu();
        self.text("Map + Charts");
        self.removeClass('icon-map').addClass('icon-satellite');
        map.satellite();
    });
    
    menu.addCallback('leftclick', 'icon-satellite', function (self) {
        menu.closeMenu();
        self.text("Satellite");
        self.removeClass('icon-satellite').addClass('icon-map');
        map.roadmap();
    });
    
    menu.addCallback('leftclick', 'icon-info', function (self) {
        output.info("Seapal is developed in a cooperation between IBN Verlag and the University of Applied Science Konstanz (HTWG).<br/>Further information and a user guide are available at seapal.info.<br/>For new, follow Seapal at Google+.<br/>Please support our project and rate Seapal in the App Store<br/>The weather layer is provided by openportguide.org");
    });
    
    menu.addCallback('leftclick', 'icon-addOns', function (self) {
        output.info("Add-ons are not supported in the web app. With Add-ons you can download for example offline maps to use the app without an internet connection.");
    });

    menu.addCallback('leftclick', 'icon-alarms', function (self) {
        var settings = map.getAlarmsSettings();
        var template = Handlebars.compile($("#alarms_Template").text());
        var html = template(settings);
        var state = settings.LEAVE_SECURITY_CIRCLE;
        $('#alarmsInputForm').html(html);
        $('#modal-form_alarms').modal('show');

        if(!alreadySetAlarmsSettingsFlag) {
            alreadySetAlarmsSettingsFlag = true;
            $('#modal-form_alarms').submit(function() {
                $('#modal-form_alarms').modal('hide');
                return false;
            });
        }        

        $('#alertSecurityCircle').click(function() {
            settings.LEAVE_SECURITY_CIRCLE = !state;
            map.setAlarmsSettings(map.getAlarmsSettings());
        });
    });    

    menu.addCallback('leftclick', 'icon-settings', function (self) {
        var settings = map.getGlobalSettings();
        var template = Handlebars.compile($("#globalSettings_Template").text());
        var html = template(settings);

        $('#globalSettingsInputForm').html(html);
        $('#modal-form_globalSettings').modal('show');

        if(!alreadySetGlobalSettingsFlag) {
            alreadySetGlobalSettingsFlag = true;
            $('#modal-form_globalSettings').submit(function() {
                var boundData = Handlebars.getBoundData(settings);                
                map.setGlobalSettings(boundData);
                $('#modal-form_globalSettings').modal('hide');
                return false;
            });
        }
    });
});