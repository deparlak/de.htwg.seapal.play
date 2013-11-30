/**
 * menu.js
 *
 * Define the actions for the menu entry's.
 * 
 */

$(function() {

    //menu = new menubar( document.getElementById( 'menubar-menu' ), 'menu' );
    menu.addCallback('icon-map', function (self) {
        self.text("Satellite");
        self.removeClass('icon-map').addClass('icon-satellite');
    });
    
    menu.addCallback('icon-satellite', function (self) {
        self.text("Map + Charts");
        self.removeClass('icon-satellite').addClass('icon-map');
    });
    
    menu.addCallback('icon-info', function (self) {
        $('#modal-info').modal('show');
    });
    
});