/**
 * global.js
 *
 * Initialise the global object handles.
 * 
 */

var dateFormat = "YYYY-MM-DD";
var timeFormat = "h:mm:ss a";

$(document).ready(function() {
    $(document).bind("contextmenu", function(e) {
        return false;
    });
    output = new modalOutput('modal', 'modal-title', 'modal-body');
    menu = new menubar( 'menu' );
    tools = new menubar( 'tools' );
    
    output.before(function() { menu.closeMenu() });
    output.before(function() { tools.closeMenu() });
    
    $("#map_canvas").seamap();
    map = $('#map_canvas').data('seamap');
});