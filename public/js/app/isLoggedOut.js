/**
 * isLoggedOut.js
 *
 * This javascript file will be used if a user is not logged in.
 * 
 */
 
$(document).ready(function() {    
    events = map.getEvents();
    var id = 0;
    
	menu.addCallback('leftclick', 'logbookCrewAdd', function (self) {
        output.warning("You are not logged in!");
    });
    
 	/* if a track was created and no user is logged in, we have to set an _id, to simulate that the trip was saved to the server. */
    map.addCallback([events.CREATED_TRACK], function (self) {
        self._id = 'SIMULATED_TRACK_ID_'+id;
        id++;
        map.set('trip', self);
    });
});