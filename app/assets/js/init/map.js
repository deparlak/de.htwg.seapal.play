/**
 * map.js
 *
 * Define the actions for the map interaction.
 * 
 */

$(document).ready(function() {    
    $("#map_canvas").seamap();
    map = $('#map_canvas').data('seamap');
    
    events = map.getEvents();
    
    map.addCallback(events.SELECT_ROUTE, function (self) {
        console.log("route selected");
    });
});