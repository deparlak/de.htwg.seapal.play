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
    var store = {};
    
    /* setup some example data. */
    tmp = map.getTemplate('person');
    tmp.firstname = 'Max';
    tmp.lastname = 'Mustermann';
    tmp.owner = 'ACCOUNT_1';
    tmp._id = 'SIMULATED_SERVER_ID_'+id++;
    tmp._rev = 'SIMULATED_SERVER_REV_'+rev++;
    map.set('person', tmp);
    
    tmp = map.getTemplate('person');
    tmp.firstname = 'Friend';
    tmp.lastname = 'Account';
    tmp.owner = 'ACCOUNT_2';
    tmp._id = 'SIMULATED_SERVER_ID_'+id++;
    tmp._rev = 'SIMULATED_SERVER_REV_'+rev++;
    map.set('person', tmp);
    
    store['ACCOUNT_1'] = {};
    store['ACCOUNT_2'] = {};
    
    tmp = map.getTemplate('boat');
    tmp.name = 'My Boat';
    tmp.owner = 'ACCOUNT_2';
    tmp._id = 'SIMULATED_SERVER_ID_'+id++;
    tmp._rev = 'SIMULATED_SERVER_REV_'+rev++;
    store['ACCOUNT_2'][tmp._id ] = tmp;
    
    tmp = map.getTemplate('trip');
    tmp.name = 'My trip';
    tmp.startDate = 1393354215906;
    tmp.endDate = 1393354216906;
    tmp.owner = 'ACCOUNT_2';
    tmp._id = 'SIMULATED_SERVER_ID_'+id++;
    tmp._rev = 'SIMULATED_SERVER_REV_'+rev++;
    store['ACCOUNT_2'][tmp._id ] = tmp;
   
    tmp = map.getTemplate('mark');
    tmp.name = 'Example mark 1';
    tmp.lat = 47.7;
    tmp.lng = 9.2;
    tmp.owner = 'ACCOUNT_2';
    tmp._id = 'SIMULATED_SERVER_ID_'+id++;
    tmp._rev = 'SIMULATED_SERVER_REV_'+rev++;
    store['ACCOUNT_2'][tmp._id ] = tmp;
    
    tmp = map.getTemplate('mark');
    tmp.name = 'Example mark 2';
    tmp.lat = 47.5;
    tmp.lng = 9.5;
    tmp.owner = 'ACCOUNT_2';
    tmp._id = 'SIMULATED_SERVER_ID_'+id++;
    tmp._rev = 'SIMULATED_SERVER_REV_'+rev++;
    store['ACCOUNT_2'][tmp._id ] = tmp; 
    
	menu.addCallback('leftclick', 'logbookCrewAdd', function (self) {
        output.warning("You are not logged in. Please log in to add a new crew member.");
    });
    
 	/* simulate object storage on server */
    map.addCallback([events.SERVER_CREATE], function (self) {
        if (null == self._id) {
            self._id = 'SIMULATED_SERVER_ID_'+id++;
            self._rev = 'SIMULATED_SERVER_REV_'+rev++;
        }
        map.set(self.type, self);
        self.id = null;
        store[self.owner][self._id] = self;
    });
    
 	/* simulate object deletion on server */
    map.addCallback([events.SERVER_REMOVE], function (self) {
        if (null != self._id && null != self.owner) {
            delete store[self.owner][self._id];
        }
    });
    
 	/* this callback will be called if an object was updated by a user */
    map.addCallback([events.SWITCHED_PERSON], function (self) {
        $("#tracks").html("");
        $("#logbook-trips").html("");
        $("#routes").html("");
        $("#logbook-boats").html("");
        $("#marks").html("");
        
		for (var tmp in store[self.owner]) {
            map.set(store[self.owner][tmp].type, store[self.owner][tmp]);
        }
    });
});