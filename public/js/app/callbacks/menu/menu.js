/**
 * menu.js
 *
 * Define the actions for the menu entry's.
 * 
 */

$(document).ready(function() {    
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
});