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
    
    map.addCallback(events.SELECTED_ROUTE, function (self) {
        console.log("route selected");
    });
    map.addCallback(events.ADDED_MARK, function (self) {
        console.log(self.label);
        console.log(self.detailed);
        $("#marks").append('<li><a class="menu-icon icon-selectedMark action" data-id='+self.id+'>'+self.label+'</a></li>');
    });
    map.addCallback(events.DELETED_MARK, function (self) {
        $("#marks li a").each(function() {
            /* delete only the element with the specific id */
            if ($(this).data('id') == self.id ) {
                $(this).remove();
            }
        });
    });
});