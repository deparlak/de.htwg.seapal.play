/**
 * map.js
 *
 * Define the actions for the map interaction.
 * 
 */

$(document).ready(function() {    
    events = map.getEvents();
    
    var templateLoadedRoute = Handlebars.compile($("#template-loadedRoute").html());
    var templateLoadedTrip = Handlebars.compile($("#template-loadedTrip").html());
    var templateLoadedMark = Handlebars.compile($("#template-loadedMark").html());
    var templateLoadedBoat = Handlebars.compile($("#template-loadedBoat").html());
    var templatePerson = Handlebars.compile($("#template-person").html());
    
	var templateCreatedRoute = Handlebars.compile($("#template-createdRoute").html());
    var templateCreatedTrip = Handlebars.compile($("#template-createdTrip").html());
    var templateCreatedMark = Handlebars.compile($("#template-createdMark").html());
	
	/* this callback will be called if an object was loaded from the server */
    map.addCallback([events.LOADED_FROM_SERVER, events.ADDED_FROM_CLIENT], function (self) {
        if (self.type == 'route') {
            $("#routes").append(templateLoadedRoute(self));
        } else if (self.type == 'trip') {
            $("#tracks").append(templateLoadedTrip(self));
            $("#logbook-trips").append(templateLoadedTrip(self));
        } else if (self.type == 'mark') {
            $("#marks").append(templateLoadedMark(self));
        } else if (self.type == 'boat') {
            $("#logbook-boats").append(templateLoadedBoat(self));
        } else if (self.type == 'person') {
            $("#logbook-crews").append(templatePerson(self));
        }
    });
    
	/* this callback will be called if an object was removed by a user */
    map.addCallback([events.SERVER_REMOVE], function (self) {
        $('.'+self.type+self.id).remove();
    });
    
	/* this callback will be called if an object was selected by a user */
    map.addCallback([events.SELECTED], function (self) {
        /* remove other selection not if a mark was selected */
        if ('mark' != self.type) {
            $('.icon-selected-'+self.type).removeClass('icon-selected-'+self.type).addClass('icon-notSelected-'+self.type);
        }
        $('.'+self.type+self.id).removeClass('icon-notSelected-'+self.type).addClass('icon-selected-'+self.type);
    });
    
	/* this callback will be called if an object was deselected by a user */
    map.addCallback([events.DESELECTED], function (self) {
        $('.'+self.type+self.id).removeClass('icon-selected-'+self.type).addClass('icon-notSelected-'+self.type);
    });
	
	/* this callback will be called if an object was updated by a user */
    map.addCallback([events.UPDATED_FROM_CLIENT], function (self) {
        $("#"+self.type+self.id).text(self.name);
    });
    
	/* this callback will be called when a new route was created */
    map.addCallback(events.CREATED_ROUTE, function (self) {
        $('.icon-selected-'+self.type).removeClass('icon-selected-'+self.type).addClass('icon-notSelected-'+self.type);
        $("#routes").append(templateCreatedRoute(self));
    });

	/* this callback will be called when a new track was created */
    map.addCallback(events.CREATED_TRACK, function (self) {
        $('.icon-selected-'+self.type).removeClass('icon-selected-'+self.type).addClass('icon-notSelected-'+self.type);
        $("#tracks").append(templateCreatedTrip(self));
    });

	/* this callback will be called when a mark was added */
    map.addCallback(events.CREATED_MARK, function (self) {
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
		
	/* this callback will be called if the security circle was left and a alarm was active */
    map.addCallback(events.LEFT_SECURITY_CIRCLE, function (self) {
        output.warning(self.msg);
    });
    
	/* this callback will be called if an warning occurred */
    map.addCallback(events.WARNING, function (self) {
        output.warning(self.msg);
    });
    
	/* this callback will be called if an error occurred */
    map.addCallback(events.ERROR, function (self) {
        output.error(self.msg);
    });
    
	/* this callback will be called if an info occurred */
    map.addCallback(events.INFO, function (self) {
        output.info(self.msg);
    });
});