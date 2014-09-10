!( function( window ) {
    // number of milliseconds a document is valid
    const DOCUMENT_IS_VALID_TIME = 60000;

    // All available events where a callback will be fired.
    const event = 
    {
        'deleted' : 0
    };
    
    const defaultOptions = {
        cluster : {
            gridSize            : 200, 
            maxZoom             : 15, 
            minimumClusterSize  : 5
        },
        
        marker : {
            image   :  new google.maps.MarkerImage(
                        "/assets/images/boat.png",
                        new google.maps.Size(42, 42),
                        new google.maps.Point(0,0),
                        new google.maps.Point(8, 35)), 
            animation : google.maps.Animation.DROP
        }
    };
    
    // Constructor for BoatCluster
    function BoatCluster (options) {
        var self = this;
        if (!options) options = {};
        if (!options.map) throw new Error("options.map is required");
        // create object to store options
        self.options = {};
        // store the handle to the map
        self.options.map = options.map;
        // store options or initialise default one
        for (var i in defaultOptions) {
            if (undefined === options[i]) {
                self.options[i] = jQuery.extend(true, {}, defaultOptions[i]);
            } else {
                self.options[i] = options[i]
            }
        }

        // storage for the markers which are placed on the map for specific geohashes
        self.cache = {};
        self.cache.boats = {};
        // The callbacks list can be used to get notified about events.
        self.callbacks = {};
        /* initialise callback list */
		for(var key in event) {
			self.callbacks[key] = $.Callbacks();
		}
        // check if there are event listeners
        if (self.options.eventListener) {
            for(var key in self.options.eventListener) {
                self.addEventListener(key, self.options.eventListener[key]);
            }
        }
        
        // initialise the cluster
        self.cluster = new MarkerClusterer(self.options.map, [], self.options);
        
        // this is a cyclic method, which will check if markers are obsolete to remove them from the cluster
        self.cylicDocumentCheck = function () {
            // get time now.
            var now = new Date().getTime();
            
            for (var boat in self.cache.boats) {
                // is marker no more valid
                if (self.cache.boats[boat].created > now || (now - self.cache.boats[boat].created) > DOCUMENT_IS_VALID_TIME) {
                    // remove marker, and prevent redrawing (is the second parameter which is set to true)
                    self.cluster.removeMarker(self.cache.boats[boat].marker, true);
                }
            }    
            self.cluster.repaint();
            // call after a timeout again
            setTimeout(self.cylicDocumentCheck, DOCUMENT_IS_VALID_TIME); 
        }
        
        // call cyclicDocumetCheck first time
        self.cylicDocumentCheck();
    };
    
    /**
    * *********************************************************************************
    * add a event listener
    * *********************************************************************************
    */
    BoatCluster.prototype.addEventListener = function (e, method) {
        var self = this;
        if (Array.isArray(e)) {
            for (var i in e) {
                self.addEventListener(e[i], method);
            }
            return;
        }
        if (self.callbacks[e] === undefined) {
            throw("Cannot add EventListener for the event '"+e+"', because this event does not exist.");
        }
        self.callbacks[e].add(method);
    };

    /**
    * *********************************************************************************
    * Call this method if there is some data which has to be added to the cluster.
    * *********************************************************************************
    */
    BoatCluster.prototype.update = function (data) {
        var self = this;

        // check if required attributes are available.
        if (!data.date) throw new Error("data.date is required");
        if (!data.boats) throw new Error("data.boats is required");
        
        // if document is older than 60 seconds ignore it
        var now = new Date().getTime();
        var created = new Date(data.date).getTime();
        if (created > now || (now - created) > DOCUMENT_IS_VALID_TIME) return false;

        var last = data.boats.length;
        
        // run through input data
        // mapping is geohash : user
        for (var boat in data.boats) {
            // get the geohash
            var geohash = data.boats[boat];
            // get LatLng from geohash
            var coord = ngeohash.decode (geohash);
            // boat position not changed?
            var oldPos = self.cache.boats[boat];
            if (oldPos && geohash === oldPos.geohash) {
                oldPos.created = created;
                continue;
            }
            // get latLng
            var latLng = new google.maps.LatLng(coord.latitude, coord.longitude);
            // an old position exist
            if (oldPos) {
                console.log("position update");
                if ("trackSimulationBot1" == boat) console.log(latLng.toString());
                oldPos.marker.setPosition(latLng);
                oldPos.created = created;
                continue;
            }
            // add the boat to the cluster
            var newPos = self.cache.boats[boat] = {};
            newPos.geohash = geohash;
            newPos.marker = new google.maps.Marker({'position': latLng});
            newPos.created = created;
            
            newPos.marker = new google.maps.Marker({
                position    : latLng,
                icon        : self.options.marker.image,
                animation   : self.options.animation
            });
            
            self.cache.boats[boat] = newPos;
            // add marker, and prevent redrawing (is the second parameter which is set to true)
            self.cluster.addMarker(newPos.marker, true);
        }
        self.cluster.repaint();
        return true;
    }
    
    // add to global namespace
    window.BoatCluster = BoatCluster;

} )( window );