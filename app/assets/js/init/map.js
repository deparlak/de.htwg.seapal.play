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
    
    map.addCallback(events.CREATED_ROUTE, function (self) {
        $("#routes li a").each(function() {
            /* de-select other routes */
            if ($(this).hasClass('icon-selectedRoute')) {
                $(this).removeClass('icon-selectedRoute').addClass('icon-notSelectedRoute');
            }
        });
        $("#routes").append('<li><a class="menu-icon icon-selectedRoute action" data-id='+self.id+'>'+self.label+'</a></li>');
    });
    
    map.addCallback(events.DELETED_ROUTE, function (self) {
        $("#routes li a").each(function() {
            /* delete only the element with the specific id */
            if ($(this).data('id') == self.id ) {
                $(this).remove();
            }
        });
    });

    map.addCallback(events.ADDED_MARK, function (self) {
        $("#marks").append('<li><a class="menu-icon icon-selectedMark action" data-id='+self.id+'>'+self.label+'</a></li>');
    });

    map.addCallback(events.NO_GEO_SUPPORT, function (self) {
        alert(self);
        console.log(self);
    });

    map.addCallback(events.DELETED_MARK, function (self) {
        $("#marks li a").each(function() {
            /* delete only the element with the specific id */
            if ($(this).data('id') == self.id ) {
                $(this).remove();
            }
        });
    });

    map.startBoatAnimation();
});