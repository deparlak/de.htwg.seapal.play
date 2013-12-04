/**
 * menu.js
 *
 * Define the actions for the menu entry's.
 * 
 */

$(document).ready(function() {	
    menu = new menubar( document.getElementById( 'menu' ), 'menu' );
    
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
    
});