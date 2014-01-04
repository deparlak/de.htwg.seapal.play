/**
 * map.js
 *
 * Define the actions for the map interaction.
 * 
 */

$(document).ready(function() {    
    events = map.getEvents();
    
    var templateLoadedRoute = Handlebars.compile($("#template-loadedRoute").html());
    var templateLoadedTrack = Handlebars.compile($("#template-loadedTrack").html());
    var templateLoadedMark = Handlebars.compile($("#template-loadedMark").html());
    
	var templateCreatedRoute = Handlebars.compile($("#template-createdRoute").html());
    var templateCreatedTrack = Handlebars.compile($("#template-createdTrack").html());
    var templateCreatedMark = Handlebars.compile($("#template-createdMark").html());
	
	/* this callback will be called if routes where loaded from the server */
    map.addCallback(events.LOADED_ROUTE, function (self) {
        $("#routes").append(templateLoadedRoute(self));
    });
	
	/* this callback will be called if tracks where loaded from the server */
    map.addCallback(events.LOADED_TRACK, function (self) {
        $("#tracks").append(templateLoadedTrack(self));
    });
	
	/* this callback will be called if marks where loaded from the server */
    map.addCallback(events.LOADED_MARK, function (self) {
        $("#marks").append(templateLoadedMark(self));
    });
	
	/* this callback will be called when a new route was created */
    map.addCallback(events.CREATED_ROUTE, function (self) {
        $("#routes li a").each(function() {
            /* de-select other routes */
            if ($(this).hasClass('icon-selectedRoute')) {
                $(this).removeClass('icon-selectedRoute').addClass('icon-notSelectedRoute');
            }
        });
        $("#routes").append(templateCreatedRoute(self));
    });

	/* this callback will be called when a new track was created */
    map.addCallback(events.CREATED_TRACK, function (self) {
        $("#tracks li a").each(function() {
            /* de-select other routes */
            if ($(this).hasClass('icon-selectedTrack')) {
                $(this).removeClass('icon-selectedTrack').addClass('icon-notSelectedTrack');
            }
        });
        $("#tracks").append(templateCreatedTrack(self));
    });

	/* this callback will be called when a route was deleted */
    map.addCallback(events.DELETED_ROUTE, function (self) {
        $("#routes li a").each(function() {
            /* delete only the element with the specific id */
            if ($(this).data('id') == self.id ) {
                $(this).remove();
            }
        });
    });
	/* this callback will be called when a mark was added */
    map.addCallback(events.ADDED_MARK, function (self) {
        $("#marks").append(templateCreatedMark(self));
    });
	
	/* this callback will be called if GEO location is not supported */
    map.addCallback(events.NO_GEO_SUPPORT, function (self) {
        alert(self);
        console.log(self);
    });
	
    /* this callback will be called when the boat position changed */
    map.addCallback(events.BOAT_POS_UPDATE, function (self) {
        $('#infoBar').html(self.html);
    });

	/* this callback will be called when a mark was deleted */
    map.addCallback(events.DELETED_MARK, function (self) {
        $("#marks li a").each(function() {
            /* delete only the element with the specific id */
            if ($(this).data('id') == self.id ) {
                $(this).remove();
            }
        });
    });
	
	/* this callback will be called if an action was executed which is not allowed on active tracking */
    map.addCallback(events.TRACKING_ACTIVE, function (self) {
        output.warning(self.msg);
    });
	
	/* this callback will be called if the security circle was left and a alarm was active */
    map.addCallback(events.LEFT_SECURITY_CIRCLE, function (self) {
        output.warning(self.msg);
    });
});