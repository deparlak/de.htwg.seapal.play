/**
 * isLoggedOut.js
 *
 * This javascript file will be used if a user is not logged in.
 * 
 */
 
$(document).ready(function() {    
    events = map.getEvents();
    var id = 0;
    var rev = 0;
    
    /* setup some example data entry's */
    tmp = map.getTemplate('person');
    tmp.firstname = 'Max';
    tmp.lastname = 'Mustermann';
    map.set('person', tmp);
    
    tmp = map.getTemplate('person');
    tmp.firstname = 'Friend';
    tmp.lastname = 'Account';
    map.set('person', tmp);
    
	menu.addCallback('leftclick', 'logbookCrewAdd', function (self) {
        output.warning("You are not logged in. Please log in to add a new crew member.");
    });
    
 	/* if a track was created and no user is logged in, we have to set an _id, to simulate that the trip was saved to the server. */
    map.addCallback([events.SERVER_CREATE], function (self) {
        if (null == self._id) {
            self._id = 'SIMULATED_SERVER_ID_'+id++;
            self._rev = 'SIMULATED_SERVER_REV_'+rev++;
        }
        map.set(self.type, self);
    });
    
 	/* this callback will be called if an object was updated by a user */
    map.addCallback([events.SWITCHED_PERSON], function (self) {
        $("#tracks").html("");
        $("#logbook-trips").html("");
        $("#routes").html("");
        $("#logbook-boats").html("");
        $("#marks").html("");
        
        if('Friend' == self.firstname) {
            tmp = map.getTemplate('boat');
            tmp.name = 'My Boat';
            map.set('boat', tmp);
            
            tmp = map.getTemplate('trip');
            tmp.name = 'My trip';
            tmp.startDate = 1393354215906;
            tmp.endDate = 1393354216906;
            map.set('trip', tmp); 
        }
    });
});