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
    var geohash = [];
    var geohashTimer = null;
    
    /* setup some example data. */
    tmp = map.getTemplate('person');
    tmp.firstname = 'Max';
    tmp.lastname = 'Mustermann';
    tmp.email = 'max@mustermann.de';
    tmp.owner = 'ACCOUNT_1';
    tmp._id = 'SIMULATED_SERVER_ID_'+id++;
    tmp._rev = 'SIMULATED_SERVER_REV_'+rev++;
    map.set('person', tmp);
    
    tmp = map.getTemplate('person');
    tmp.firstname = 'Friend';
    tmp.lastname = 'Account';
    tmp.email = 'friend@account.de';
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
    
    /* this callback will be called if the cluster of geohashs was updated and has to be set to the server. */
    map.addCallback(events.SWITCHED_GEOHASH_CLUSTER, function (self) {
        clearTimeout(geohashTimer);
        geohash = self;
        geohashTimer=setTimeout(simulateGeohashUpdate, 1000);
    });
    
    function random (min, max) {
        return Math.floor(Math.random() * ( max - min + 1) + min);
    }
    
    function simulateGeohashUpdate() {
        index = random(0, geohash.length - 1);
        data = {};
        data.hash = geohash[index];
        data.marker = [];
        
        // get bbox of hash
        console.log("Decode : "+data.hash);
        console.log(geohash.length);
        console.log(index);
        console.log(geohash);
        bbox = ngeohash.decode_bbox(data.hash);
        
        // calculate the total number of markers
        data.count = random(0, 100);
        
        // get random number for number of markers.
        if (data.count > 50) {
            markers = 50;
        } else {
            markers = data.count;
        }
        data.marker = undefined;
        markers = 0;
        for (var i = 0; i < markers; i++) {
            // create random number of markers.
            data.marker[i] = {lat : bbox[0] + 1 / i, lng : bbox[1] + 1 / i};
        }

        // send a update to the map
        map.updateGeohash(data);
        
        clearTimeout(geohashTimer);
        geohashTimer=setTimeout(simulateGeohashUpdate, 100000);
    }
});