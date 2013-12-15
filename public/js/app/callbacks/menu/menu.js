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

    menu.addCallback('leftclick', 'marksRoutesTracks', function (self) {
        self.button('toggle');
        $('.active-marksRoutesTracks').removeClass('active-marksRoutesTracks').addClass('inactive-marksRoutesTracks');
        $(self.data('name')).removeClass('inactive-marksRoutesTracks').addClass('active-marksRoutesTracks');
    });
    
    menu.addCallback('leftclick', 'logbook', function (self) {
        self.button('toggle');
        $('.active-logbook').removeClass('active-logbook').addClass('inactive-logbook');
        $(self.data('name')).removeClass('inactive-logbook').addClass('active-logbook');
    });
    
    menu.addCallback('leftclick', 'icon-selectedMark', function (self) {
        self.removeClass('icon-selectedMark').addClass('icon-notSelectedMark');
        map.hideMark(self.data('id'));
    });
    
    menu.addCallback('leftclick', 'icon-notSelectedMark', function (self) {
        self.removeClass('icon-notSelectedMark').addClass('icon-selectedMark');
        map.visibleMark(self.data('id'));
    });
    
    menu.addCallback('leftclick', 'icon-selectedRoute', function (self) {
        self.removeClass('icon-selectedRoute').addClass('icon-notSelectedRoute');
        map.hideRoute(self.data('id'));
    });
    
    menu.addCallback('leftclick', 'icon-notSelectedRoute', function (self) {
        $('.icon-selectedRoute').removeClass('icon-selectedRoute').addClass('icon-notSelectedRoute');
        self.removeClass('icon-notSelectedRoute').addClass('icon-selectedRoute');
        map.visibleRoute(self.data('id'));
    });
    
    menu.addCallback('leftclick', 'icon-selectedTrack', function (self) {
        self.removeClass('icon-selectedTrack').addClass('icon-notSelectedTrack');
        console.log(self.data('id'));
    });
    
    menu.addCallback('leftclick', 'icon-notSelectedTrack', function (self) {
        $('.icon-selectedTrack').removeClass('icon-selectedTrack').addClass('icon-notSelectedTrack');
        self.removeClass('icon-notSelectedTrack').addClass('icon-selectedTrack');
        console.log(self.data('id'));
    });
    
    menu.addCallback('leftclick', 'icon-signInSeapal', function (self) {
        menu.closeMenu();
        window.location = "/login";
    });
    
    menu.addCallback('leftclick', 'icon-signUpSeapal', function (self) {
        menu.closeMenu();
        window.location = "/signup";
    });
    
    menu.addCallback('leftclick', 'icon-notSelectedBoat', function (self) {
        $('.icon-selectedBoat').removeClass('icon-selectedBoat').addClass('icon-notSelectedBoat');
        self.removeClass('icon-notSelectedBoat').addClass('icon-selectedBoat');
        map.selectBoat(self.data('id'));
    });    
});