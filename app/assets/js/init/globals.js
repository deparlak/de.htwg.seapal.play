/**
 * global.js
 *
 * Initialise the global object handles.
 * 
 */

$(document).ready(function() {
    output = new modalOutput('modal', 'modal-title', 'modal-body');
    menu = new menubar( 'menu' );
    tools = new menubar( 'tools' );
    
    output.before(function() { menu.closeMenu() });
    output.before(function() { tools.closeMenu() });
});