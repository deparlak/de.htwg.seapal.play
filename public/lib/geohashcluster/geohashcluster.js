/**
 * Display markers as styled markers. The idea is based on MarkerClustererPlus for Google Maps V3. But the
 * difference is that the clustering should already be done, before setting the data to the map. The
 * Clustering therefore run on the server.
 * This configuration is based on the "MarkerClustererPlus for Google Maps V3 version 2.1.1 [November 4, 2013]".
 */

/**
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
 
!( function( window ) {
    // maximum and minum geohash resolution
    const MIN_GEOHASH_RESOLUTION = 1;
    const MAX_GEOHASH_RESOLUTION = 6;
    
     /* All available events where a callback will be fired. */
    const event = 
    {
        'updateBounds' : 0
    };
    
    // helper function to compare arrays.
    function arrayCompare(a, b) {
        if (a === b) return true;
        if (a == null || b == null) return false;
        if (a.length != b.length) return false;
        
        for (var i = 0; i < a.length; ++i) {
            if (a[i] !== b[i]) return false;
        }
        return true;
    }

    // Constructor for GeohashCluster
    function GeohashCluster(options) {    
        var self = this;
        if (!options) return new Error("Options are required. e.g. GeohashCluster({...})");
        if (!options.map) return new Error("options.map required! This should be the handle to google map.");
        // store the options
        self.options = options;
        // handle for the timer, which calls the updateGeohashCluster after the map is a specified time in idle
        self.updateTimer = null;
        // store geohashs which are visible at actual map bounds
        self.geohash = [];
        // storage for the markers which are placed on the map for specific geohashes
        self.cache = {};
        // The callbacks list can be used to get notified about events.
        self.callbacks = {};
        /* init callback list */
		for(var key in event) {
			self.callbacks[key] = $.Callbacks();
		}
        // check if there are event listeners
        if (self.options.eventListener) {
            for(var key in self.options.eventListener) {
                self.addEventListener(key, self.options.eventListener[key]);
            }
        }
        // add event listener, to check if the bounds of the geohash cluster has to be updated.
        google.maps.event.addListener(self.options.map, 'idle', function() {
            // start a timer, which will be triggered for the geohash cluster calculation
            // The timer make sure, that we wait a moment so that we not updateBounds all the time if the user
            // is swiping on the map.
            clearTimeout(self.updateTimer);
                console.log("hier");
            self.updateTimer = setTimeout(self.updateBounds, 1000);
        });
    
    
        /**
        * *********************************************************************************
        * Call this method if the bounds of the map changed and the visible geohashs has to be calculated.
        * Note : This method get automatically called by the map idle listener.
        * *********************************************************************************
        */
        GeohashCluster.prototype.updateBounds = function () {
            console.log(self.options);
            // get bounds
            var bounds;
            if (self.options.map.getZoom() <= 3) {
                bounds = new google.maps.LatLngBounds(new google.maps.LatLng(-85.08136444384544, -178.48388434375), new google.maps.LatLng(85.02070771743472, 178.00048865625));
            } else {
                bounds = self.options.map.getBounds();
            }
            // calculate corners of bounds
            var spherical = google.maps.geometry.spherical, 
            topright = bounds.getNorthEast(), 
            bottomleft = bounds.getSouthWest(), 
            bottomright = new google.maps.LatLng(bottomleft.lat(), topright.lng()), 
            topleft = new google.maps.LatLng(topright.lat(), bottomleft.lng());
            
            // get best fit resolution for actual borders
            var resolution = MIN_GEOHASH_RESOLUTION;
            var hashs = ngeohash.bboxes (bottomleft.lat(), bottomleft.lng(), topright.lat(), topright.lng(), precision=resolution);
        
            for (resolution = MIN_GEOHASH_RESOLUTION + 1; resolution <= MAX_GEOHASH_RESOLUTION; resolution++) {
                tmp = ngeohash.bboxes (bottomleft.lat(), bottomleft.lng(), topright.lat(), topright.lng(), precision=resolution);

                if (tmp.length <= 100) {
                    hashs = tmp;
                } else {
                    break;
                }
            }
            console.log(self.geohash);
            console.log(hashs);
                
            // compare new hashs and previous ones
            if (arrayCompare(hashs, self.geohash)) return;
            // we have to clear the markers, because we are at a new position and the old markers are no longer under observation
            self.clear();
            // copy the geohashs
            self.geohash = hashs.slice();
            // call callbacks
            self.callbacks['updateBounds'].fire(self.geohash.slice());
        }
    };
    
    /**
    * *********************************************************************************
    * add a event listener
    * *********************************************************************************
    */
    GeohashCluster.prototype.addEventListener = function (e, method) {
        self = this;
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
    GeohashCluster.prototype.update = function (data) {
        self = this;
        // check if required attributes are available.
        if (!data.geohash) return new Error("geohash is a required attribute on calling GeohashCluster.update");
        // save the index to access the cache.
        var index = data.geohash;
    
        // are there markers on the map, which has to be updated.
        if (undefined !== self.cache[index]) {
            // clear the timeout, when this marker will be discarded
            clearTimeout(self.cache[index].timeout);
            // check if there was a sumMarker
            if (self.cache[index].sumMarker) {
                // update the sumMarker
                self.cache[index].sumMarker.update(data);
            }
            // check if there where markers
            if (self.cache[index].marker) {
                // clear the marker.
                for (var i = 0; i < self.cache[index].marker.length; i++) {
                    this.cache[index].marker[i].remove();
                }
                // add the new marker.
                for (var i = 0; i < data.marker.length; i++) {
                    marker = new GeohashLabel({
                        LatLng      : new google.maps.LatLng(data.marker[i].lat, data.marker[i].lng),
                        count       : 1,
                        map         : self.options.map
                    });
                    this.cache[index].marker.push(marker);
                }
            }
            // return, to not draw the marker twice.
            return;
        } else {
            // create a new entry in the cache
            self.cache[index] = {};
            // nothing to update, there are new values.
            // if there is only a count value provided, and no markers, we have to set a sumMarker
            if (!data.marker && data.count > 0) {
                // decode the LatLng position with the provided geohash
                pos = ngeohash.decode(data.geohash);
                // create a marker
                sumMarker = new GeohashLabel({
                    LatLng      : new google.maps.LatLng(pos.latitude, pos.longitude),
                    count       : data.count,
                    map         : self.options.map
                });
                // add the summary marker to the cache
                self.cache[index].sumMarker = sumMarker;    
            }  

        }
        // create a timeout, after which the data has to be removed from the cache, if
        // no update of the data will be received
        // The timout occurr after 60 seconds.
        self.cache[index].timeout = setTimeout(function(){
            self.remove(index);
        }, 6000); 
    }
    
    /**
    * *********************************************************************************
    * Call this method if the cluster should be cleared. This method remove all visible markers.
    * *********************************************************************************
    */
    GeohashCluster.prototype.remove = function (index) {
        // NOTE : Do not use self here. remove() method of the marker will override self with the 
        // reference to the marker.
        // self = this;

        if (!this.cache[index]) return;
        
        if (this.cache[index] && this.cache[index].sumMarker) {
            this.cache[index].sumMarker.remove();
        }
        // delete from the storage
        delete this.cache[index];
    }
    
    /**
    * *********************************************************************************
    * Call this method if the cluster should be cleared. This method remove all visible markers.
    * *********************************************************************************
    */
    GeohashCluster.prototype.clear = function () {
        console.log("cluster clear");
    }

    // add to global namespace
    window.GeohashCluster = GeohashCluster;

} )( window );