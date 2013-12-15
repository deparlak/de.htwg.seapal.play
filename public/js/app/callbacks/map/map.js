/**
 * map.js
 *
 * Define the actions for the map interaction.
 * 
 */

$(document).ready(function() {
    $("#map_canvas").seamap({getInitialRoutes : function (self) {
            console.log(self);
    }});
    map = $('#map_canvas').data('seamap');
    

    
    events = map.getEvents();
    
    var templateRoutes = Handlebars.compile($("#template-routes").html());
    var templateMarks = Handlebars.compile($("#template-marks").html());
    
    map.addCallback(events.CREATED_ROUTE, function (self) {
        $("#routes li a").each(function() {
            /* de-select other routes */
            if ($(this).hasClass('icon-selectedRoute')) {
                $(this).removeClass('icon-selectedRoute').addClass('icon-notSelectedRoute');
            }
        });
        $("#routes").append(templateRoutes(self));
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
        $("#marks").append(templateMarks(self));
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