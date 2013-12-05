/**
 * menu.js
 *
 * Define the actions for the menu entry's.
 * 
 */

$(document).ready(function() {    
    menu = new menubar( 'menu' );
    
    menu.addCallback('icon-map', function (self) {
        menu.closeMenu();
        self.text("Satellite");
        self.removeClass('icon-map').addClass('icon-satellite');
        map.satellite();
    });
    
    menu.addCallback('icon-satellite', function (self) {
        menu.closeMenu();
        self.text("Map + Charts");
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
    
    menu.openMenu();
    
});