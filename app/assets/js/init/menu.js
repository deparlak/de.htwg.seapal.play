/**
 * menu.js
 *
 * Define the actions for the menu entry's.
 * 
 */

$(document).ready(function() {    
    menu = new menubar( 'menu' );

    menu.addCallback('icon-fullscreen', function (self) {
        menu.closeMenu();

        if (window.fullScreenApi.supportsFullScreen) {
            if (!window.fullScreenApi.isFullScreen()) {
                window.fullScreenApi.requestFullScreen(document.body);
                self.text("Normal");
            } else {
                window.fullScreenApi.cancelFullScreen(document.body);
                self.text("Fullscreen");
            }
        } else {
            window.alert("Your Browser does not support fullscreen mode! Sorry.");
        }
    });
    
    menu.addCallback('icon-map', function (self) {
        menu.closeMenu();
        self.text("Map + Charts");
        self.removeClass('icon-map').addClass('icon-satellite');
        map.satellite();
    });
    
    menu.addCallback('icon-satellite', function (self) {
        menu.closeMenu();
        self.text("Satellite");
        self.removeClass('icon-satellite').addClass('icon-map');
        map.roadmap();
    });
    
    menu.addCallback('icon-info', function (self) {
        menu.closeMenu();
        $('#modal-info').modal('show');
    });

    menu.addCallback('marks-routes-tracks', function (self) {
        self.button('toggle');
        $('.active-mrt').removeClass('active-mrt').addClass('inactive-mrt');
        $(self.data('name')).removeClass('inactive-mrt').addClass('active-mrt');
    });
    
    menu.addCallback('icon-selectedMark', function (self) {
        self.removeClass('icon-selectedMark').addClass('icon-notSelectedMark');
        map.hideMark(self.data('id'));
    });
    
    menu.addCallback('icon-notSelectedMark', function (self) {
        self.removeClass('icon-notSelectedMark').addClass('icon-selectedMark');
        map.visibleMark(self.data('id'));
    });
    
    menu.addCallback('icon-selectedRoute', function (self) {
        self.removeClass('icon-selectedRoute').addClass('icon-notSelectedRoute');
        map.hideRoute(self.data('id'));
    });
    
    menu.addCallback('icon-notSelectedRoute', function (self) {
        $('.icon-selectedRoute').removeClass('icon-selectedRoute').addClass('icon-notSelectedRoute');
        self.removeClass('icon-notSelectedRoute').addClass('icon-selectedRoute');
        map.visibleRoute(self.data('id'));
    });
    
    menu.addCallback('icon-selectedTrack', function (self) {
        self.removeClass('icon-selectedTrack').addClass('icon-notSelectedTrack');
        console.log(self.data('id'));
    });
    
    menu.addCallback('icon-notSelectedTrack', function (self) {
        $('.icon-selectedTrack').removeClass('icon-selectedTrack').addClass('icon-notSelectedTrack');
        self.removeClass('icon-notSelectedTrack').addClass('icon-selectedTrack');
        console.log(self.data('id'));
    });
  
    $("#search-mrt").keyup( function(ev) {
        ev.stopPropagation();
        ev.preventDefault();
        console.log("inpurt");
    });    
  
 //   menu.openMenu();
    
});