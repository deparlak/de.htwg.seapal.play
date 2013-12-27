/**
 * map.js
 *
 * Define the actions for the map interaction.
 * 
 */

$(document).ready(function() {    
    events = map.getEvents();
    
    var templateRoutes = Handlebars.compile($("#template-routes").html());
    var templateTracks = Handlebars.compile($("#template-tracks").html());
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

    map.addCallback(events.CREATED_TRACK, function (self) {
        $("#tracks li a").each(function() {
            /* de-select other routes */
            if ($(this).hasClass('icon-selectedTrack')) {
                $(this).removeClass('icon-selectedTrack').addClass('icon-notSelectedTrack');
            }
        });
        $("#tracks").append(templateTracks(self));
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
    
    map.addCallback(events.BOAT_POS_UPDATE, function (self) {
        $('#infoBar').html(self.html);
    });

    map.addCallback(events.DELETED_MARK, function (self) {
        $("#marks li a").each(function() {
            /* delete only the element with the specific id */
            if ($(this).data('id') == self.id ) {
                $(this).remove();
            }
        });
    });

    map.addCallback(events.TRACKING_ACTIVE, function (self) {
        output.warning(self.msg);
    });
    
    map.addCallback(events.LEFT_SECURITY_CIRCLE, function (self) {
        output.warning(self.msg);
    });
});