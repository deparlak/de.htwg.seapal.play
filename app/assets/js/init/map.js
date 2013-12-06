/**
 * map.js
 *
 * Define the actions for the map interaction.
 * 
 */

$(document).ready(function() {    
    var i = 0;
    $("#map_canvas").seamap();
    map = $('#map_canvas').data('seamap');
    
    events = map.getEvents();
    
    map.addCallback(events.SELECTED_ROUTE, function (self) {
        console.log("route selected");
    });
    map.addCallback(events.ADDED_MARK, function (self) {
        console.log(self.label);
        console.log(self.detailed);
        $("#marks").append('<li><a class="menu-icon icon-selectedMark action" data-id='+i+'>Mark'+i+'</a></li>');
        i++;
    });
    map.addCallback(events.DELETED_MARK, function (self) {
        console.log("delete mark");
    });
});