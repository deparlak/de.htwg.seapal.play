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
    
	menu.addCallback('leftclick', 'logbookCrewAdd', function (self) {
        output.warning("You are not logged in. Please log in to add a new crew member.");
    });
    
 	/* if a track was created and no user is logged in, we have to set an _id, to simulate that the trip was saved to the server. */
    map.addCallback([events.SERVER_CREATE], function (self) {
        self._id = 'SIMULATED_SERVER_ID_'+id++;
        self._rev = 'SIMULATED_SERVER_REV_'+rev++;
        map.set(self.type, self);
    });
});