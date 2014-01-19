/**
* Seamap JQuery Plugin
* @version ENGLISH
* @author Julian Mueller
*/
(function( $, window ){
    /**
    * *************************************************************************************
    * Default Options
    * *************************************************************************************
    */
    var options = {
        //default mode.
        mode                 : "INTERACTIVE",

        //map default options
        map : {
            mapTypeId : google.maps.MapTypeId.ROADMAP,
            disableDefaultUI: true,
            mapTypeControl: false,
            panControl: false,
            zoomControl: false,
            scaleControl: false,
            streetViewControl: false,
            rotateControl: false,
            rotateControlOptions: false,
            overviewMapControl: false,
            OverviewMapControlOptions: false,
            zoom: 10,
            center: new google.maps.LatLng(47.655, 9.205),
        },
        
        // Default options for the marker
        defaultOptions : {
            polyOptions : {
                strokeColor: '#000000',
                strokeOpacity: 0.5,
                strokeWeight: 3
            },
            markerOptions : {
                image : new google.maps.MarkerImage(
                    "/assets/images/pin_marker.png",
                    new google.maps.Size(42, 42),
                    new google.maps.Point(0,0),
                    new google.maps.Point(21, 36))
            },
            tmpMarkerOptions : {
                image : new google.maps.MarkerImage(
                    "/assets/images/pin_marker.png",
                    new google.maps.Size(42, 42),
                    new google.maps.Point(0,0),
                    new google.maps.Point(21, 36))
            }
        },

        // Default options for the marker
        personOverboardOptions : {
            polyOptions : {
                strokeColor: '#000000',
                strokeOpacity: 0.5,
                strokeWeight: 3
            },
            markerOptions : {
                image : new google.maps.MarkerImage(
                    "/assets/images/manoverboard.png",
                    new google.maps.Size(42, 42),
                    new google.maps.Point(0,0),
                    new google.maps.Point(21, 21))
            }
        },
        
        // Default options for a route
        route : {
            polyOptions : {
                strokeColor: 'blue',
                strokeOpacity: 0.5,
                strokeWeight: 3
            },
            markerOptions : {
                image : new google.maps.MarkerImage(
                    "/assets/images/circle.png",
                    new google.maps.Size(20, 20),
                    new google.maps.Point(0,0),
                    new google.maps.Point(10, 10))
            }
        },

        // Default options for a track
        track : {
            polyOptions : {
                strokeColor: 'green',
                strokeOpacity: 0.5,
                strokeWeight: 3
            },
            markerOptions : {
                image : new google.maps.MarkerImage(
                    "/assets/images/circle.png",
                    new google.maps.Size(1, 1),
                    new google.maps.Point(0,0),
                    new google.maps.Point(10, 10))
            }
        },
        
        // Default options for a distance measurement
        distance : {
            polyOptions : {
                strokeColor: 'grey',
                strokeOpacity: 0.5,
                strokeWeight: 2
            },
            markerOptions : {
                image : new google.maps.MarkerImage(
                    "/assets/images/circle.png",
                    new google.maps.Size(20, 20),
                    new google.maps.Point(0,0),
                    new google.maps.Point(10, 10))
            }
        },
        
        // Default options for the tracked boat
        boat : {
            markerOptions : {
                crosshairShape : {
                    coords:[0,0,0,0],
                    type:'rect'
                },
                image : new google.maps.MarkerImage(
                    '/assets/images/boat.png', 
                    new google.maps.Size(32,32),    
                    new google.maps.Point(0,0),    
                    new google.maps.Point(16,16))    
            }
        },
        
        // Default options for the crosshair.
        crosshairOptions : {
            markerOptions : {
                crosshairShape : {
                    coords:[0,20,20,20],
                    type:'rect'
                },
                image : new google.maps.MarkerImage(
                    '/assets/images/crosshair.png', 
                    new google.maps.Size(28,28),    
                    new google.maps.Point(0,0),    
                    new google.maps.Point(14,14))    
            }
        }
    };
	
    /**
    * *************************************************************************************
    * The seamap object class
    * *************************************************************************************
    */
    $.seamap = function(element){    
		function checkType(type) {
			/* check if the type exist */
            if (undefined === data[type]) {
				throw("Type "+type+" does not exist.");
			}
		};
		
		function checkId(type, id) {
			/* check if the id exist */
			if (undefined === data[type].list[id]) {
				throw("There is no "+type+" with the id "+id);
			}
		};
		
		function checkObject(type, obj) {
			for (var key in data[type].template) {
				/* the id do not have to be in the object, because a object with no id will be created new */
				if ('id' == key) continue;
				/* other keys should exist. */
				if (obj[key] === undefined) {
					throw("Object is not valid. Checkout the template for "+type);
				}
			}
		};
	
		function dataParameterCheck(type, id, obj) {
			checkType(type);
			checkId(type, id);
		};
	
        /* add a callback function to get notified about actions */
        this.addCallback = function (e, method) {
            if (Array.isArray(e)) {
                for (var i in e) {
                    this.addCallback(e[i], method);
                }
                return;
            }
            if (callbacks[e] === undefined) {
				throw("Cannot add Callback for the event '"+e+"', because this event does not exist.");
			}
            callbacks[e].add(method);
        };
        /* remove a route,mark,track,boat,... */
        this.remove = function(type, id) {
			dataParameterCheck(type, id, null);
			/* check if a remove method is defined which has to be called. 
               A remove method can be defined for example a mark which has to
               be removed from the map if it is still visible or a route.
            */
			if (undefined !== data[type].removeMethod) {
				data[type].removeMethod(id);
			}
			/* remove the element now from the list */
			dataCallback([event.SERVER_REMOVE], data[type].list[id]);
            delete data[type].list[data[type].list[id]["_id"]];
			delete data[type].list[id];
        };
		/* set a route,mark,track,boat,... */
        this.set = function(type, obj) {
			checkType(type);

            /* if there is no client id, but a server id the object just has to be added */
            if ((!obj.id || obj.id == null) && obj._id != null && obj._rev != null) {
                console.log("loaded from server");
                newObj = self.getTemplate(type);
                newObj.id = obj._id;
                data[type].list[newObj.id] = newObj;
                data[type].count++;
                copyObjAttr(type, newObj, obj);
                dataCallback([event.LOADED_FROM_SERVER], newObj);
            /* if the object already exist, go to the entry and update all entry's */
            } else if (obj.id != null){
                console.log("updated");
                checkId(type, obj.id);
                var modified = copyObjAttr(type, data[type].list[obj.id], obj);
                /* create another reference to the object, so that the object is accessible through the id and the _id.*/
                if (null != obj._id && obj.id != obj._id) {
                    data[type].list["_id"] = data[type].list[obj.id]["id"];
                }
                /* copyObjAttr check if the object was modified. if so we fire a callback to sync with the server and tell the client listeners */
                if (modified) {
                    /* check if more changed than the _id and _rev */
                    dataCallback([event.UPDATED_FROM_CLIENT, event.SERVER_CREATE], obj);
                }
            } else if (obj.id == null && obj._id == null && obj._rev == null) {
                console.log("added from client");
                newObj = self.getTemplate(type);
                newObj.id = data[type].count.toString();
                data[type].list[newObj.id] = newObj;
                data[type].count++;
                copyObjAttr(type, newObj, obj);
                dataCallback([event.ADDED_FROM_CLIENT, event.SERVER_CREATE], newObj);
            } else {
                throw("Not expected case in map.set(..)");
            }
        };
        
        /* helper method to copy only the elements to a obj */
        function copyObjAttr(type, dest, src) {
            var modified = false;
            for (var key in data[type].template) {
                /* check if the src has the key and if the src and dest attribute differ */
                if ((src[key] !== undefined && null != src[key])
                  &&(src[key] != dest[key])){
                    dest[key] = src[key];
                    /* if not _rev and _id was changed, the object was modified */
                    modified = (key != '_id' && key != '_rev' && key != 'owner') ? true : false;
                }
            }
            return modified;
        };
        
		/* return a copy of the obj with the given type and id */
        this.get = function(type, id) {
			dataParameterCheck(type, id, null);
            var copy = {};
            /* copy only the template fields */
            for (var key in data[type].template) {
                copy[key] = data[type].list[id][key];
            }
			return copy;
        };
		/* return a copy of the template for the given type */
        this.getTemplate = function(type) {
			checkType(type);
			/* check if a visible method is not defined which has to be called */
			if (undefined === data[type].template) {
				throw("There is no template available for the type "+type);
			}
			return jQuery.extend(true, {}, data[type].template);
        };
		/* visible the object with the given type and id */
        this.visible = function(type, id) {
			dataParameterCheck(type, id, null);
			/* check if a visible method is not defined which has to be called */
			if (undefined === data[type].visibleMethod) {
				throw("Cannot call visible for objects of the type "+type);
			}
			data[type].visibleMethod(id);
        };
		/* hide the object with the given type and id */
        this.hide = function(type, id) {
			dataParameterCheck(type, id, null);
			/* check if a hide method is not defined which has to be called */
			if (undefined === data[type].hideMethod) {
				throw("Cannot call hide for objects of the type "+type);
			}
			data[type].hideMethod(id);
        };
        /* get the handle of the google map */
        this.getGoogleMapsHandle = function () {
            return map;
        };
        /* get the actual boat position*/
        this.getCurrentBoatInformation = function () {
            return getCurrentBoatInformation();
        };
        /* get the events list */
        this.getEvents = function () {
            return jQuery.extend(true, {}, event);
        };
        /* set new route */
        this.setRoute = function () {            
            handleAddNewRoute();
        };
        /* set new mark */
        this.setMark = function () {
            if (isTracking) {
                addNewWaypoint();
            } else {
                /* set state to marker to set the marker on the next map action */
                state = States.MARKER;
            }
        };
        this.setImageMark = function(image) {
            if (isTracking) {
                addNewWaypoint(image);
            } else {
                addNewMark(currentPosition, image);
            }
        };
        /* set a temporary mark */
        this.setTemporaryMark = function(position) {
            handleSetTemporaryMark(position);
        };
        /* Checks if the tracking is enabled and displays a message when it is */
        this.checkTracking = function() {
            if(isTracking) {
                callbacks[event.ERROR].fire({msg : "This option is disabled because you are currently tracking!"});
                return false;
            }
            return true;
        }
        /* get distance */
        this.getDistance = function () {
            handleAddNewDistanceRoute();
        };
        /* set map type to satellite */
        this.satellite = function () {
            map.overlayMapTypes.clear();
            map.setMapTypeId(google.maps.MapTypeId.SATELLITE);
        };
        /* set map type to roamap + charts */
        this.roadmap = function () {
            map.setMapTypeId(google.maps.MapTypeId.ROADMAP);
            initOpenSeaMaps();
        };
        /* select a boat */
        this.selectBoat = function(id) {
			dataParameterCheck('boat', id, null);
			data.boat.active = data.boat.list[id];
            console.log("Selected boat "+id);
        };
        /* get a list with all waypoints from a specific track */
        this.getWaypoints = function (trackId) {
            dataParameterCheck('track', trackId, null);
            var list = [];
            /* copy only the template fields */
            for (var wp in data.waypoint.list) {
                list[list.length] = self.get('waypoint', wp.id);
            }
			return list;
        };
        
        /* Toggles the security circle */
        this.toggleSecurityCircle = function() {            
            if (activeSecurityCircle == null) {
                showSecurityCircle();
            } else {
                hideSecurityCircle();
            }
        }

        /* Gets the global settings */
        this.getGlobalSettings = function() {
            return globalSettings;
        }

        /* Sets the global settings */
        this.setGlobalSettings = function(settings) {
            globalSettings = settings;
        }

        /* Gets the settings for the alarms */
        this.getAlarmsSettings = function() {
            return alarmsSettings;
        }

        /* Sets the settings for the alarms */
        this.setAlarmsSettings = function(settings) {
            alarmsSettings = settings;
        }

        /* The security circle on the map */
        var activeSecurityCircle = null;

        /* THe global settings object */
        var globalSettings = {
            DISTANCE_UNIT       : "globalSettings_km",
            TEMPERATURE_UNIT    : "globalSettings_celsius",
            TRACKING_DELAY      : 5,
            HISTORY_TREND       : 1,
            CIRCLE_RADIUS       : 250

        };

        /* The settings for the alarms */
        var alarmsSettings = {
            LEAVE_SECURITY_CIRCLE : false
        }
        
        /* The callbacks list can be used to get notified about events. */
        var callbacks = {};
        /* All available events where a callback will be fired. */
        var event = 
        {
            //TODO
			LOADED_FROM_SERVER      : 0,
            ADDED_FROM_CLIENT       : 1,
            UPDATED_FROM_CLIENT     : 2,
            CREATED_ROUTE           : 3,
            DELETED_ROUTE           : 4,
            CREATED_MARK            : 5,
            DELETED_MARK            : 6,
            NO_GEO_SUPPORT          : 7,
            BOAT_POS_UPDATE         : 8,
            CREATED_TRACK           : 9,
            
            ERROR                   : 10,
            WARNING                 : 11,
            INFO                    : 12,
            
            LEFT_SECURITY_CIRCLE    : 13,
			SERVER_CREATE			: 14,
			SERVER_REMOVE			: 15,
            CREATED_WAYPOINT        : 16,
            EDIT_MARK               : 17,
            
            
        };
		        
        var options = $.seamap.options;
    
        // The states of the plugin
        var States = {
            "NORMAL"   : 0, 
            "ROUTE"    : 1, 
            "DISTANCE" : 2,
            "MARKER"   : 3,
            "TRACK"    : 4
        },
        // The context menu types
        ContextMenuTypes = {
            "DEFAULT" : 0, 
            "DELETE_MARKER" : 1
        };

        /* Array pointer at the default route */
        var fakeRoutePointer = 0;

        /* The default route the boat would follow when geolocation API is forbidden by user */
        var defaultRoute = [
            [47.662862243806494, 9.206426935195955],
            [47.66290559848635, 9.204967813491853],
            [47.66275385695047, 9.204248981475862],
            [47.6622552745126, 9.203111724853548],
            [47.66181449476839, 9.202360706329378],
            [47.66126532135546, 9.201716976165804],
            [47.66063665522542, 9.200729923248323],
            [47.65961054022222, 9.20257528305057],
            [47.66016695719919, 9.205396966934236],
            [47.66090401990831, 9.20829375267032],
            [47.66159771648151, 9.20878727912906],
            [47.66213966051584, 9.207853870391878],
            [47.66255876004476, 9.206448392868074],
            [47.662782760137446, 9.205708103179964]
        ];

        // The tracking route generated from the activeRoute 
        var generatedTrackingRoute = null;

        // Checks whether the position simulation is active (when user denies geolocation) 
        var isSimulating = false;

        // Checks if the app is currently tracking
        var isTracking = false;

        // Factor to calc kmh to knots
        var KMH_TO_KNOTS = 0.539;

        // checks if message for no geolocation support was shown
        var noGeo_flag = false;

        // The current position of the ship (fake or real depends if browser supports geolocation and users permission)
        var currentPosition = null;

        // The current speed of the ship (fake or real depends if browser supports geolocation and users permission)
        var currentSpeed = null;

        // The current course of the ship (fake or real depends if browser supports geolocation and users permission)
        var currentCourse = null;

        // Supresses the click event when longtouch is used
        var supressClick = false;
        
        // maps
        var map = null;

        // crosshair marker
        var crosshairMarker = null;

        // boat marker
        var boatMarker = null;
        
        // The id of the manoverboard marker
        var manoverboardMark = null;
		
        
        var templateAccount =
        {
            "type"                : "account",
            "id"                  : null,
            "birth"               : null,
            "city"                : null,
            "country"             : null,
            "email"               : null,
            "first_name"          : null,
            "friend_list"         : [],
            "last_name"           : null,
            "mobile"              : null,
            "nationality"         : null,
            "postcode"            : null,
            "received_requests"   : [],
            "registration"        : null,
            "sent_requests"       : null,
            "street"              : null,
            "telephone"           : null,
        };
        
        
		var templateMark = 
		{
			"type"			: "mark",
			"id"			: null,
			"name" 			: null,
			"date" 			: null,
			"lat"			: null,
			"lng"			: null,
			"image_big" 	: null,
			"image_thumb" 	: null,
			"_id"			: null,
			"_rev" 			: null,
			"owner" 		: null
		};
		
		var templateWaypoint = 
		{
			"type"			: "waypoint",
			"id"			: null,
			"name" 			: null,
			"note" 			: null,
			"date" 			: null,
			"lat"			: null,
			"lng"			: null,
			"image_big" 	: null,
			"image_thumb" 	: null,
            "btm"           : null,
            "dtm"           : null,
            "cog"           : null,
            "sog"           : null,
            "headedFor"     : null,
            "maneuver"      : null,
            "foresail"      : null,
            "mainsail"      : null,
            "trip"          : null,
            "boat"          : null,
			"_id"			: null,
			"_rev" 			: null,
			"owner" 		: null
		};
        
		var templateRoute =
		{
			"type"			: "route",
			"id"			: null,
			"name" 			: null,
			"date" 			: null,
			"marks" 		: [],
			"distance" 		: null,
			"_id" 			: null,
			"_rev" 			: null,
			"owner" 		: null
		};
        
        var templateTrack =
		{
			"type"			: "track",
			"id"			: null,
			"name" 			: null,
			"date" 			: null,
			"marks" 		: [],
			"distance" 		: null,
			"_id" 			: null,
			"_rev" 			: null,
			"owner" 		: null
		};
        
        var templateBoat =
		{
			"type"			        : "boat",
			"id"			        : null,
            "boatName"              : "",
            "registerNr"            : "",
            "sailSign"              : "",
            "homePort"              : "",
            "yachtclub"             : "",
            "insurance"             : "",
            "callSign"              : "",
            "boatType"              : "",
            "boatConstructor"       : "",
            "boatOwner"             : "",
            "length"                : 0,
            "width"                 : 0,
            "draft"                 : 0,
            "mastHeight"            : 0,
            "displacement"          : 0,
            "rigging"               : "",
            "yearOfConstruction"    : 1900,
            "motor"                 : "",
            "tankSize"              : 0,
            "wasteWaterTankSize"    : 0,
            "freshWaterTankSize"    : 0,
            "mainSailSize"          : 0,
            "genuaSize"             : 0,
            "spiSize"               : 0,
            "_id"                   : null,
            "_rev"                  : null,
            "owner"                 : null
		};

        /* save the self reference, because this cannot used in each context for the seamap */
		var self = this;
		
		/* 
		   return a copy of a obj with the specified type and id to all event listeners.
		   There will be no type and id check, because this method will be
		   used only internally where the type/id should be valid used.
		   Using the dataCallback make sure that the user cannot change the object, because
		   sending the original object would make it possible for the user.
		*/
		var dataCallback = function(events, obj) {		
			/* 
				send copy to all event listeners.
				Each listener get its own copy
			*/
			for (var e in events) {
				callbacks[events[e]].fire(self.get(obj.type, obj.id));
			}
		};		
		
		var data = {
            account : {
                template : templateAccount,
				active : null
			},	
			boat : {
                template : templateBoat,
				list : {},
				count : 1,
				active : null
			},		
			mark : {
				template : templateMark,
				list : {},
				count : 1,
				active : null
			},
			waypoint : {
				template : templateWaypoint,
				list : {},
				count : 1,
				active : null
			},
			route : {
				template : templateRoute,
				list : {},
				count : 1,
				active : null
			},
			track : {
                template : templateTrack,
				list : {},
				count : 1,
				active : null
			}
		};
		
		/* define the remove method for the mark */
		data.mark.removeMethod = function(id) {
			/* check if this marker is active */
			if (data.mark.active && data.mark.active.id == id) {
				data.mark.active = null;
			}
			/* check if the marker is visible on the map */
			if (data.mark.list[id].onMap) {
				data.mark.list[id].onMap.setMap(null);
			}
			dataCallback([event.DELETED_MARK], data.mark.list[id]);
		};		
		
		/* define the remove method for the route */
		data.route.removeMethod = function(id) {
			/* check if the route is active */
			if (data.route.active && data.route.active.id == id) {
				data.route.active = null;
				if (state == States.ROUTE) {
					state = States.NORMAL;
				}
			}
			/* check if the route is visible on the map. The route can
			   be not the active route but still have a reference on the map (so it's only hidden)
			   Because of this we have to check here if the route is "onMap" 
			*/
			if (data.route.list[id].onMap) {
				data.route.list[id].onMap.remove();
			}
			dataCallback([event.DELETED_ROUTE], data.route.list[id]);
		};
		
		/* define the remove method for the track */
		data.track.removeMethod = function(id) {
			/* check if the track is active */
			if (data.track.active && data.track.active.id == id) {
				data.track.active = null;
				if (state == States.TRACK) {
					state = States.NORMAL;
				}
			}
			/* check if the track is visible on the map. The track can
			   be not the active track but still have a reference on the map (so it's only hidden)
			   Because of this we have to check here if the track is "onMap" 
			*/
			if (data.track.list[id].onMap) {
				data.track.list[id].onMap.remove();
			}
            dataCallback([event.DELETED_TRACK], data.track.list[id]);
		};
		
		/* define the visible method for a route */
		data.route.visibleMethod = activateRoute;
		
		/* define the visible method for a route */
		data.route.hideMethod = function(id) {
			if (!data.route.active || data.route.active.id != id) {
				throw("Illegal call of data.route.hideMethod, beacause only the active route can be hidden.");
			}
			/* hide the active route now */
			hideActiveRoute();
		};
		
		/* define the visible method for a track */
		data.track.visibleMethod = activateTrack;
		
		/* define the visible method for a track */
		data.track.hideMethod = function(id) {
			if (!data.track.active || data.track.active.id != id) {
				throw("Illegal call of data.track.hideMethod, beacause only the active track can be hidden.");
			}
			/* hide the active route now */
			hideActiveTrack();
		};	

		/* define the visible method for a mark */
		data.mark.visibleMethod	 = function(id){
			if (!data.mark.list[id].onMap) {
				data.mark.list[id].onMap = getOnMapMark(data.mark.list[id]);
			}
		};
		
		/* define a hide method for a mark */
		data.mark.hideMethod = function(id){
			if (null != data.mark.list[id].onMap) {
				data.mark.list[id].onMap.setMap(null);
				data.mark.list[id].onMap = null;
			}
		};
		
        // distance
        var distanceroute = null;
        
        //temporary marker
        var temporaryMarker = null;
        
        // editing states
        var state = States.NORMAL;
		// prevState will be used by distance tool to restore previous state after distance tool will be closed.
		var prevState = state;
		
        // context-menu/selection
        var contextMenuType = ContextMenuTypes.DEFAULT;
        var contextMenuVisible = false;
    
        // bind our jquery element
        var $this = $(element);
        
        // set as destination path
        var destpath = new google.maps.Polyline(options.polyOptions);

        init();
		
		/* init callback list */
		for(var key in event) {
			callbacks[event[key]] = $.Callbacks();
		}

        startBoatAnimation();
        
        /**
        * *********************************************************************************
        * Displays/Hides the security circle
        * *********************************************************************************
        */
        function showSecurityCircle() {
            createSecurityCircle();
        }
        /* Hides the security circle */
        function hideSecurityCircle() {
            activeSecurityCircle.setMap(null);
            activeSecurityCircle = null;            
        }
        /* Creates the security circle */
        function createSecurityCircle() {            
            var circleOptions = {
                strokeColor: '#FF0000',
                strokeOpacity: 0.8,
                strokeWeight: 2,
                fillColor: '#FF0000',
                fillOpacity: 0.35,
                map: map,
                center: currentPosition,
                radius: globalSettings.CIRCLE_RADIUS
            };
            activeSecurityCircle = new google.maps.Circle(circleOptions);
        }
        /* calculates the distance from the center of the circle to the current position */
        function getDistanceFromCircle() {
            return calculateDistance(activeSecurityCircle.center.lat(), activeSecurityCircle.center.lng(),
                                     currentPosition.lat(), currentPosition.lng());
        }
        /* calculates the distance between two positions. Coordinates needed in decimal form! */
        function calculateDistance(lat1, lon1, lat2, lon2) {
            var R = 6371; // km (change this constant to get miles)
            var dLat = (lat2-lat1) * Math.PI / 180;
            var dLon = (lon2-lon1) * Math.PI / 180; 
            var a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                Math.cos(lat1 * Math.PI / 180 ) * Math.cos(lat2 * Math.PI / 180 ) * 
                Math.sin(dLon/2) * Math.sin(dLon/2); 
            var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
            var d = R * c;
            return Math.round(d*1000); // in meters
        }

        /**
        * *********************************************************************************
        * Calculates the distance in the unit given by the options between two coordinates.
        * *********************************************************************************
        */
        this.distance = function(lat1,lon1,lat2,lon2) {
            var R = null;

            switch(globalSettings.DISTANCE_UNIT)
            {
                case "globalSettings_mil":
                    R = 3958.8;
                    break;
                case "globalSettings_nautmil":
                    R = 3440.04622;
                    break;
                default:                
                    R = 6371;
            }

            var dLat = (lat2-lat1) * Math.PI / 180;
            var dLon = (lon2-lon1) * Math.PI / 180; 
            var a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                Math.cos(lat1 * Math.PI / 180 ) * Math.cos(lat2 * Math.PI / 180 ) * 
                Math.sin(dLon/2) * Math.sin(dLon/2); 
            var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
            var d = R * c;

            var result = Math.round(d * 1);

            switch(globalSettings.DISTANCE_UNIT)
            {
                case "globalSettings_mil":
                    return (Math.round(d * 1760) / 1760);
                case "globalSettings_nautmil":
                    return (Math.round(d * 2025.38276) / 2025.38276);
                default:                
                    return (Math.round(d * 1000) / 1000);
            }
        }
        
        /**
        * *********************************************************************************
        * Initializes the GoogleMaps with OpenSeaMaps overlay, the context menu, the
        * boat animation and the default route.
        * *********************************************************************************
        */
        function init() {
            map = new google.maps.Map(element, options.map);
            initOpenSeaMaps();
            
            if ( options.mode !== "NOTINTERACTIVE" ) {
                initContextMenu();    
                initGoogleMapsListeners();
            }
            initCrosshairMarker();
        }

        /**
        * *********************************************************************************
        * Initializes the OpenSeamaps overlay.
        * *********************************************************************************
        */
        function initOpenSeaMaps() {
            map.overlayMapTypes.push(new google.maps.ImageMapType({
                getTileUrl: function(coord, zoom) {
                    return "http://tiles.openseamap.org/seamark/" + zoom + "/" + coord.x + "/" + coord.y + ".png";
                },
                tileSize: new google.maps.Size(256, 256),
                name: "OpenSeaMap",
                maxZoom: 18
            }));
        }

        /**
        * *********************************************************************************
        * Initializes the context menus.
        * *********************************************************************************
        */
        function initContextMenu() {
            $this.append('<div id="tooltip_helper"></div>');

            $this.on("click", "#addMark", handleAddMark);
            $this.on("click", "#deleteMark", handleDeleteMark);
            $this.on("click", "#editMark", handleEditMark);
            $this.on("click", "#addNewRoute", handleAddNewRoute);
            $this.on("click", "#exitRouteCreation", handleExitRouteCreation);
            $this.on("click", "#setAsDestination", handleSetAsDestination);
            $this.on("click", "#addNewDistanceRoute", handleAddNewDistanceRoute);
            $this.on("click", "#hideContextMenu", handleHideContextMenu);
        }
                
        /**
        * *********************************************************************************
        * Initializes the GoogleMaps listeners (left/right click, move, ...) and defines
        * the actions in each state of the plugin.
        * *********************************************************************************
        */
        function initGoogleMapsListeners() {
            // move
            google.maps.event.addListener(map, 'bounds_changed', function() {
                if (crosshairMarker != null && contextMenuVisible) {
                    updateContextMenuPosition(crosshairMarker.getPosition());
                }
            });
            // right-click
            google.maps.event.addListener(map, 'rightclick', function(event) {

                switch(state) {
                    case States.NORMAL: 
                        hideContextMenu();
                        hideCrosshairMarker(crosshairMarker);
                        showCrosshairMarker(event.latLng);
                        break;
                        
                    case States.ROUTE:
                        hideCrosshairMarker(crosshairMarker);
                        showCrosshairMarker(event.latLng);
                        showContextMenu(event.latLng, ContextMenuTypes.DEFAULT, crosshairMarker);
                        break;
                        
                    case States.DISTANCE:
                        handleExitDistanceRouteCreation();
                        break;
                }
            });
            //long press
            new LongPress(map, 500);
            google.maps.event.addListener(map, 'longpress', function(event) {
                switch(state) {
                    case States.NORMAL: 
                        hideContextMenu();
                        hideCrosshairMarker(crosshairMarker);
                        showCrosshairMarker(event.latLng);
                        break;
                        
                    case States.ROUTE:
                        hideCrosshairMarker(crosshairMarker);
                        showCrosshairMarker(event.latLng);
                        showContextMenu(event.latLng, ContextMenuTypes.DEFAULT, crosshairMarker);
                        break;
                        
                    case States.DISTANCE:
                        handleExitDistanceRouteCreation();
                        break;
                }
            });
            // left click
            google.maps.event.addListener(map, 'click', function(event) {
                hideCrosshairMarker(crosshairMarker);
                hideContextMenu();
                
                switch(state) {
                    case States.NORMAL:
                        // nothing special
                        break;
                        
                    case States.ROUTE:
                        addRouteMarker(event.latLng);
                        break;
                        
                    case States.DISTANCE:
                        addDistanceMarker(event.latLng);
                        break;
                        
                    case States.MARKER:
                        addNewMark(event.latLng);
                        state = States.NORMAL;
                        break;
                }
            });
        }
        
        /**
        * *********************************************************************************
        * Inits the crosshair marker (as invisible)
        * Note: Only one crosshair can be displayed at the same time.
        * *********************************************************************************
        */
        function initCrosshairMarker() {
            crosshairMarker = new google.maps.Marker({
                map: map,
                position: null,
                title:"crosshair",
                icon: options.crosshairOptions.markerOptions.image,
                draggable: true
            });
            
            // init left-click context menu listener
            google.maps.event.addListener(crosshairMarker, 'click', function(event) {
                showContextMenu(event.latLng, ContextMenuTypes.DEFAULT, crosshairMarker);
            });
            
            google.maps.event.addListener(crosshairMarker, 'drag', function(event) { 
                showContextMenu(event.latLng, ContextMenuTypes.DEFAULT, crosshairMarker);
            });
            
            hideCrosshairMarker();
        }
                
        /**
        * *********************************************************************************
        * Starts long polling to animate the boat on the maps via Geolocation API in HTML5.
        * *********************************************************************************
        */
        function startBoatAnimation(){
            get_location();
            handleLeaveSecurityCircle();
            setTimeout(function(){startBoatAnimation();}, 5000);
        }
        /**
         * Gets the current location of the device (via HTML5)
         */
        function get_location() {
            if (Modernizr.geolocation) {
                isSimulating = false;
                navigator.geolocation.getCurrentPosition(handleBoatPosition, error_handling);
            } else {
                if(!noGeo_flag) {
                   callbacks[event.NO_GEO_SUPPORT].fire({msg : "Your PC doesn't support geolocation!"});
                   noGeo_flag = true;
                }
                handleFakeBoatPositionUpdate();
            }
        }
        /**
         * Error handling if user denies access to the geolocation data
         */
        function error_handling(errNo) {
            isSimulating = true;
            if(errNo.code == 1) {
                handleFakeBoatPositionUpdate();   
            }
        }

        /**
         * Handles what happens when security circle is left
         */
        function handleLeaveSecurityCircle() {
            if(alarmsSettings.LEAVE_SECURITY_CIRCLE && activeSecurityCircle) {
                var dist = getDistanceFromCircle();
                if(dist > globalSettings.CIRCLE_RADIUS) {
                    callbacks[event.LEFT_SECURITY_CIRCLE].fire({msg : "You have left the security circle!"});
                }
            }
        }

        /**
        * *********************************************************************************
        * Handles the boat position update.
        * *********************************************************************************
        */
        function handleBoatPosition(position){
            currentPosition = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
            currentSpeed = position.coords.speed;
            currentCourse = position.coords.heading;
            handleBoatPositionUpdate(currentPosition);           
        }
        /**
         * Handles the boat position with fake/generated geolocation data
         */
        function handleFakeBoatPositionUpdate() {
            if(isTracking && data.route.active != null) {
                fakeTrackingRoutePositionUpdate(generatedTrackingRoute);
            } else {
                fakeTrackingRoutePositionUpdate(defaultRoute);
            }
        }
        /**
         * Handles the boat position with fake/generated geolocation data
         */
        function generateFakeTrackingRoute(route) {            
            var len = 5;
            var result = new Array();
            var tmp = new Array();
            var j = 0;         
            for (var i = 1; i <= route.onMap.markers.length; i++) {
                tmp[0] = route.onMap.markers[i - 1].getPosition().lat();
                tmp[1] = route.onMap.markers[i - 1].getPosition().lng();
                result[j] = tmp;
                tmp = new Array();
                j++;

                if (i == route.onMap.markers.length) {
                    generatedTrackingRoute = result;
                    return;
                }
                var lngKoeff = (route.onMap.markers[i].getPosition().lat() - route.onMap.markers[i - 1].getPosition().lat()) / len;
                var latKoeff = (route.onMap.markers[i].getPosition().lng() - route.onMap.markers[i - 1].getPosition().lng()) / len;

                for (var k = 1; k < len; k++) {
                    tmp[0] = route.onMap.markers[i - 1].getPosition().lat() + (k * lngKoeff);
                    tmp[1] = route.onMap.markers[i - 1].getPosition().lng() + (k * latKoeff);
                    result[j] = tmp;
                    tmp = new Array();
                    j++;
                };
            };            
        }
        /**
         * Handles the boat position tracking a route with fake/generated geolocation data
         */
        function fakeTrackingRoutePositionUpdate(routeArray) {
            if(fakeRoutePointer >= routeArray.length) {
                fakeRoutePointer = 0;
            }
            currentPosition = new google.maps.LatLng(routeArray[fakeRoutePointer][0],
                                                     routeArray[fakeRoutePointer][1]);
            
            currentSpeed = (Math.random() * 15);
            currentCourse = Math.floor(Math.random() * 360);
            fakeRoutePointer++;
            handleBoatPositionUpdate(currentPosition);
        }

        /**
         * Updates the boat icon on the map 
         */
        function handleBoatPositionUpdate(position) {            
            callbacks[event.BOAT_POS_UPDATE].fire(getCurrentBoatInformation());
            if(boatMarker == null){
                boatMarker = new google.maps.Marker({
                    position: position,
                    map: map,
                    title:"boat",
                    shape: options.boat.markerOptions.crosshairShape,
                    icon:  options.boat.markerOptions.image
                });
            }else{
                boatMarker.setPosition(position);
            }
        }
        
        /**
        * *********************************************************************************
        * Handles the tracking (simulated or real)
        * *********************************************************************************
        */
        this.startTracking = function() {
            if (data.route.active == null) {
                callbacks[event.WARNING].fire({msg : "No Route for tracking selected! Please select a Route."});
                return false;
            }
            
            if (data.boat.active == null) {
                callbacks[event.WARNING].fire({msg : "No Boat for tracking selected! Please select a Boat from the logbook."});
                return false;
            }

            if(isSimulating) {
                fakeRoutePointer = 0;
                generateFakeTrackingRoute(data.route.active);
            }

            isTracking = true;
            handleAddNewTrack();
            handleTracking();
            return true;
        }
        /* stops the tracking */
        this.stopTracking = function() {
            handleExitTrackCreation();
            isTracking = false;
        }
        /* Handles the tracking itself */
        function handleTracking() {
            if(!isTracking) { 
                return;
            }
            var timeout = globalSettings.TRACKING_DELAY * 1000;
            setTimeout(function(){handleTracking();}, timeout);

            addTrackMarker(currentPosition);
        }
        /**
        * *********************************************************************************
        * Handles the person overboard
        * *********************************************************************************
        */
        this.togglePersonOverboard = function() {
            if(manoverboardMark == null) {
                addManOverboardMark();
            } else {
                removeManOverboardMark();
            }
        }
        /* Adds the person overboard mark */
        function addManOverboardMark() {
            var mark = {}
            var position = currentPosition;
            mark.id = "POB";
            mark.onMap = new google.maps.Marker({
                map: map,
                position: position,
                icon: options.personOverboardOptions.markerOptions.image,
                draggable: false
            });
            manoverboardMark = mark;
        }
        /* Removes the person overboard mark */
        function removeManOverboardMark() {
            if (null != manoverboardMark) {
                manoverboardMark.onMap.setMap(null);
                manoverboardMark = null;
            }
        }

        /**
        * *********************************************************************************
        * Hides the crosshair marker.
        * *********************************************************************************
        */
        function showCrosshairMarker(position) {
            crosshairMarker.setMap(map);
            crosshairMarker.setPosition(position);
        }
        
        /**
        * *********************************************************************************
        * Hides the crosshair marker.
        * *********************************************************************************
        */
        function hideCrosshairMarker() {
            if (crosshairMarker != null) {
                crosshairMarker.setMap(null);
            }
        }

        /**
        * *********************************************************************************
        * Display the contxt menu at the given position, with the given type for the
        * selected marker.
        * *********************************************************************************
        */
        function showContextMenu(latLng, type, marker) {
            contextMenuVisible = true;
            data.mark.active = marker;
            showContextMenuInternal(latLng, type, marker);
        }
        
        /**
        * *********************************************************************************
        * Hides the context menu.
        * *********************************************************************************
        */
        function hideContextMenu() { 
            $('.popover').css({'display':'none'});
            contextMenuVisible = false;
        }

        /**
        * *********************************************************************************
        * Shows the context menu at the given position.
        * *********************************************************************************
        */
        function showContextMenuInternal(latLng, ctxMenuType, markerToShowOn) {
            contextMenuType = ctxMenuType;

            marker = markerToShowOn;
            $('#tooltip_helper').popover({title: function() {
                    if (contextMenuType == ContextMenuTypes.DELETE_MARKER) {
                        var lat = marker.onMap.getPosition().lat();
                        var lng = marker.onMap.getPosition().lng();
                    } else {
                        var lat = marker.getPosition().lat();
                        var lng = marker.getPosition().lng();
                    }

                    return '<span><b>Lat</b> ' + toGeoString(lat, "N", "S", 2) + ' <b>Lon</b> ' + toGeoString(lng, "E", "W", 3) + '</span>';
                },
                html : true,
                content: getContextMenuContent,
                placement: function(){
                    var leftDist = $('#tooltip_helper').position().left;
                    var width = $this.width();
        
                    return (leftDist > width / 2 ? "left" : "right");
                }
            });
            
            $('#tooltip_helper').popover('show');
            
            $this.css("overflow","visible"); // bugfix > menu overlaps!
            
            updateContextMenuPosition(latLng);    
        }

        /**
        * *********************************************************************************
        * Updates the context menu position.
        * *********************************************************************************
        */
        function updateContextMenuPosition(latLng){
            var pos = getCanvasXY(latLng);

            var xPos = pos.x;
            var yPos = pos.y + 10;
            var width = $this.width();
            var height = $this.height();

            $('#tooltip_helper').css({top: yPos, left: xPos});

            // check whether the popup is displayed outside of the maps container
            if (xPos > 5 && xPos < width - 5 && yPos > 5 && yPos < height - 5) {
                $('#tooltip_helper').popover('show');
            } else {
                $('#tooltip_helper').popover('hide');
            }
            
            contextMenuVisible = true;
        }

        /**
        * *********************************************************************************
        * Gets the context menu content buttons, considering the global context menu type
        * *********************************************************************************
        */
        function getContextMenuContent() {
            var ctx = '<div id="contextmenu">'
            switch(contextMenuType) {
                case ContextMenuTypes.DEFAULT:
                    ctx += '<button id="addMark" type="button" class="btn"><i class="icon-map-marker"></i> Set Mark</button>';
                    if (state != States.ROUTE) {
                        ctx += '<button id="addNewRoute" type="button" class="btn"><i class="icon-flag"></i> Start new Route</button>';
                    } else {
                        ctx += '<button id="exitRouteCreation" type="button" class="btn"><i class="icon-flag"></i> Finish Route Recording</button>';
                    }
                    ctx += '<button id="addNewDistanceRoute" type="button" class="btn"><i class="icon-resize-full"></i> Distance from here</button>'
                        + '<button id="setAsDestination" type="button" class="btn"><i class="icon-star"></i> Set as Target</button>'
                        + '<button id="hideContextMenu" type="button" class="btn"><i class="icon-remove"></i> Close</button>'; 
                    break;
                case ContextMenuTypes.DELETE_MARKER:
                    ctx += '<button id="deleteMark" type="button" class="btn"><i class="icon-map-marker"></i> Delete Mark</button>';
                    ctx += '<button id="editMark" type="button" class="btn"><i class="icon-map-marker"></i> Edit Mark</button>';
                    break;
            }
            ctx += '</div>'
            return ctx;
        }
        
        /**
        * *********************************************************************************
        * Hides the context menu and the crosshair.
        * *********************************************************************************
        */        
        function handleHideContextMenu() {
            hideContextMenu();
            hideCrosshairMarker();
        }
        
        /**
        * *********************************************************************************
        * Starts the distance tool and hides the context menu and crosshair.
        * *********************************************************************************
        */
        function handleAddNewDistanceRoute() {
            hideContextMenu();
            hideCrosshairMarker();
            
            var obj = {}
			obj.type = 'distance';
            obj.marks = [];
            obj.onMap = new $.seamap.route(obj, map);
            distanceroute = obj;            
            position = crosshairMarker.getPosition();
            /* just add a route marker if a position was selected */
            if (null != position) {
                distanceroute.onMap.addMarker(position);
            }
            prevState = state;
            state = States.DISTANCE;
        }
        
        /**
        * *********************************************************************************
        * Stops the distance tool and hides the context menu and crosshair.
        * *********************************************************************************
        */
        function handleExitDistanceRouteCreation() {
            hideContextMenu();
            hideCrosshairMarker();
            state = prevState;
            removeDistanceRoute();
        }
        
        /**
        * *********************************************************************************
        * Removes the distance route from the map.
        * *********************************************************************************
        */
        function removeDistanceRoute() {
            if (distanceroute != null) {
                distanceroute.onMap.remove();
                distanceroute = null;
            }
        }
        
        /**
        * *********************************************************************************
        * Handles the creation of a new route, activates it and bind the mouse-events.
        * Also hides the context menu and the marker.
        * *********************************************************************************
        */
        function handleAddNewRoute() {
            if(isTracking) {
                callbacks[event.ERROR].fire({msg : "This options is disabled because tracking is active!"});
                return;
            }
            
            hideContextMenu();
            hideCrosshairMarker();

            var obj = self.getTemplate('route');
			obj.date = new Date().getTime();
            obj.id = data.route.count.toString();
            obj.name = "Route "+data.route.count;
            obj.update = true;
			obj.onMap = getOnMapRoute(obj);
			
            data.route.list[obj.id] = obj;        
            activateRoute(obj.id); 
  
            position = crosshairMarker.getPosition();
            /* just add a route marker if a position was selected */
            if (null != position) {
                addRouteMarker(position);
            }
            data.route.count++;
            dataCallback([event.CREATED_ROUTE], obj);
        }

        /**
        * *********************************************************************************
        * Place an existing mark on the map and return the handle
        * *********************************************************************************
        */
		function getOnMapRoute(route) {
			var onMap = new $.seamap.route(route, map);
		            
            /* activate the route if a markers will be clicked when the route is not selected. */
            activate = function() {
                removeDistanceRoute();
                activateRoute(route.id);
            }
            
            /* remove method will check if we remove all markers, which cause a deletion of the route */
            remove = function() {
                if (0 == onMap.markers.length) {
                    deleteActiveRoute();
                } else {
                    update();
                }
            }
			
            /* if the route was updated, the updated flag will be set to sync the route with the server */
            update = function() {
                removeDistanceRoute();
                activateRoute(route.id);
                route.update = true;
            }
            
            onMap.addEventListener("remove", remove);      
            onMap.addEventListener("click", activate);
            onMap.addEventListener("add", update);
            onMap.addEventListener("drag", update);  
			
			return onMap;
		}
                
        /**
        * *********************************************************************************
        * Activates the route, so that it is also visible in the sidebar.
        * *********************************************************************************
        */
        function activateRoute(id) {
			/* if this route is already active we do not have to hide the route */
            if (data.route.active && data.route.active.id != data.route.list[id].id) {
				hideActiveRoute();
			}
            /* important that state will be set here, because hideActiveRoute() will set the state to NORMAL */
            state = States.ROUTE;
            data.route.active = data.route.list[id];
            if (!data.route.active.onMap || null == data.route.active.onMap) {
                data.route.active.onMap = getOnMapRoute(data.route.active);
            }
            data.route.active.onMap.visible();
        }
        /**
        * *********************************************************************************
        * Hide the active route
        * *********************************************************************************
        */ 
        function hideActiveRoute(){
            if (data.route.active != null) {
                uploadRouteUpdate();
                state = States.NORMAL;
                data.route.active.onMap.hide();
                data.route.active = null;
            }
        }
        /**
        * *********************************************************************************
        * Delete the active route
        * *********************************************************************************
        */ 
        function deleteActiveRoute(){
            if (data.route.active != null) {
                self.remove('route', data.route.active.id);
            }
        }
        
        /**
        * *********************************************************************************
        * Handles the quit of the route creation.
        * Also closes the context menu, sidebar the hides the crosshair.
        * *********************************************************************************
        */
        function handleExitRouteCreation() {
            uploadRouteUpdate();
            hideContextMenu();
            hideCrosshairMarker();
            state = States.NORMAL;
        }   

        /**
        * *********************************************************************************
        * Check if the active route has some changes which should be uploaded.
        * *********************************************************************************
        */
        function uploadRouteUpdate() {
            if (data.route.active != null && data.route.active.update) {
				dataCallback([event.SERVER_CREATE], data.route.active);
                data.route.active.update = false;
            }         
        }
        
        /**
        * *********************************************************************************
        * Adds a new route marker to the active route.
        * *********************************************************************************
        */
        function addRouteMarker(latLng) {
            hideContextMenu();
            hideCrosshairMarker();
            data.route.active.onMap.addMarker(latLng);
        }

        /**
        * *********************************************************************************
        * Adds a new route marker to the active route.
        * *********************************************************************************
        */
        function addDistanceMarker(latLng) {
            hideContextMenu();
            hideCrosshairMarker();
            distanceroute.onMap.addMarker(latLng);
        }

        /**
        * *********************************************************************************
        * Handles the creation of a new route, activates it and bind the mouse-events.
        * Also hides the context menu and the marker.
        * *********************************************************************************
        */
        function handleAddNewTrack() {
            var obj = self.getTemplate('track');;
            obj.id = data.track.count.toString();
			obj.startDate = new Date().getTime();
            obj.name = "Track " + data.track.count;
            obj.onMap = getOnMapTrack(obj);
            obj.update = true;
            data.track.list[obj.id] = obj;        
            activateTrack(obj.id); 
            data.track.count++;
            dataCallback([event.CREATED_TRACK], obj);
        }
		
        /**
        * *********************************************************************************
        * Place an existing track on the map and return the handle
        * *********************************************************************************
        */
		function getOnMapTrack(track) {
			var onMap = new $.seamap.route(track, map);
			return onMap;
		}
                
        /**
        * *********************************************************************************
        * Activates the track, so that it is also visible in the sidebar.
        * *********************************************************************************
        */
        function activateTrack(id) {
            hideActiveTrack();
            /* important that state will be set here, because hideActiveRoute() will set the state to NORMAL */
            state = States.TRACK;
            data.track.active = data.track.list[id];
            if (!data.track.active.onMap || null == data.track.active.onMap) {
                data.track.active.onMap = getOnMapTrack(data.track.active);
            } 
            data.track.active.onMap.visible();
        }
        /**
        * *********************************************************************************
        * Hide the active track
        * *********************************************************************************
        */ 
        function hideActiveTrack() {
            if (data.track.active != null) {
                uploadTrackUpdate();
                state = States.NORMAL;
                data.track.active.onMap.hide();
                data.track.active = null;
            }
        }
        /**
        * *********************************************************************************
        * Delete the active track
        * *********************************************************************************
        */ 
        function deleteActiveTrack(){
            if (data.track.active != null) {
                self.remove('track', data.track.active.id);
            }
        }
        
        /**
        * *********************************************************************************
        * Handles the quit of the route creation.
        * Also closes the context menu, sidebar the hides the crosshair.
        * *********************************************************************************
        */
        function handleExitTrackCreation() {
            uploadTrackUpdate();
            state = States.NORMAL;
        }

        /**
        * *********************************************************************************
        * Check if the active track has some changes which should be uploaded.
        * *********************************************************************************
        */
        function uploadTrackUpdate() {
            if (data.track.active != null && data.track.active.update) {
				dataCallback([event.SERVER_CREATE], data.track.active);
                data.track.active.update = false;
            }         
        }
        
        /**
        * *********************************************************************************
        * Adds a new route marker to the active route.
        * *********************************************************************************
        */
        function addTrackMarker(latLng) {            
            data.track.active.onMap.addMarker(latLng);
        }
        
        /**
        * *********************************************************************************
        * Handler function for adding a new mark to the map.
        * Also hides the context menu and the crosshair.
        * *********************************************************************************
        */
        function handleAddMark() {
            hideContextMenu();
            hideCrosshairMarker();
            addNewMark(crosshairMarker.getPosition());
        }

        /**
        * *********************************************************************************
        * Handler function for deleting a mark. Also hides the context menu.
        * *********************************************************************************
        */
        function handleDeleteMark() {
            deleteSelectedMark();
            hideContextMenu();
        }

        /**
        * *********************************************************************************
        * Handler function for editing a mark. Also hides the context menu.
        * *********************************************************************************
        */
        function handleEditMark() {
            dataCallback([event.EDIT_MARK], data.mark.active);
            hideContextMenu();
        }
        
        /**
        * *********************************************************************************
        * Handler function for setting a target.
        * Also closes the context menu and hides the crosshair.
        * *********************************************************************************
        */
        function handleSetAsDestination() {
            hideContextMenu();
            hideCrosshairMarker();

            destpath.setMap(map);
            destpath.setPath([boatMarker.getPosition(), crosshairMarker.getPosition()]);
        }
        
        /**
        * *********************************************************************************
        * set a temporary marker to the screen, which will be overwritten if the method will be called again.
        * *********************************************************************************
        */
        function handleSetTemporaryMark(position) {
            if (null != temporaryMarker) {
                temporaryMarker.setMap(null); 
            }
            temporaryMarker = new google.maps.Marker({
                map: map,
                position: position,
                icon: options.defaultOptions.tmpMarkerOptions.image,
                draggable: false
            });
            map.setCenter(position);
        }
        
        /**
        * *********************************************************************************
        * Adds a simple marker to the given position and
        * bind the click-events to open its context menu.
		* The marker can also have an image.
        * *********************************************************************************
        */
        function addNewMark(position, image) {
            var obj = self.getTemplate('mark');
            obj.id = data.mark.count.toString();
            obj.name = "Mark "+data.mark.count;
			obj.lat = position.lat();
			obj.lng = position.lng();
			obj.date = new Date().getTime();
			if (image) {
				obj.image_thumb = image[0];
				obj.image_big = image[1];
			}
            obj.onMap = getOnMapMark(obj);
			
            data.mark.list[obj.id] = obj;
            data.mark.count++;
            dataCallback([event.SERVER_CREATE, event.CREATED_MARK], obj);
        }
        
        /**
        * *********************************************************************************
        * Adds a waypoint to the given position and
        * bind the click-events to open its context menu.
		* The waypoint can also have an image.
        * *********************************************************************************
        */
        function addNewWaypoint(image) {
            var boat = getCurrentBoatInformation();
            var obj = self.getTemplate('waypoint');
            obj.id = data.waypoint.count.toString();
            obj.name = "Waypoint "+data.waypoint.count;
			obj.lat = position.lat();
			obj.lng = position.lng();
            obj.cog = boat.course;
            obj.sog = boat.speed;
			obj.date = new Date().getTime();
			if (image) {
				obj.image_thumb = image[0];
				obj.image_big = image[1];
			}
            obj.onMap = getOnMapMark(obj);
			
            data.waypoint.list[obj.id] = obj;
            data.waypoint.count++;
            dataCallback([event.SERVER_CREATE, event.CREATED_WAYPOINT], obj);
        }

        /**
        * *********************************************************************************
        * Place an existing mark on the map and return the handle
        * *********************************************************************************
        */
		function getOnMapMark(marker) {
			var onMap = new google.maps.Marker({
                map: map,
                position: new google.maps.LatLng(marker.lat, marker.lng),
                icon: (marker.image_thumb) ? marker.image_thumb : options.defaultOptions.markerOptions.image,
                draggable: (marker.image_thumb || marker.type == 'waypoint') ? false : true
            });
			/* check if the marker has a image */
			if (marker.image_thumb) {
				google.maps.event.addListener(onMap, 'click', function(event) {
					if(!supressClick) {
						openFancybox(marker.image_big, new Date(marker.date).toLocaleString() + " / " + getCoordinatesAsString(marker.lat, marker.lng));
					}
				});
			}
			/* marker get dragged */
            google.maps.event.addListener(onMap, 'dragend', function(e) {
				marker.lat = e.latLng.lat();
				marker.lng = e.latLng.lng();
				/* update mark on server */
				dataCallback([event.SERVER_CREATE], marker);
            });
			/* show menu on rightclick to marker */
            google.maps.event.addListener(onMap, 'rightclick', function(event) {
                showContextMenu(event.latLng, ContextMenuTypes.DELETE_MARKER, marker);
            });
			/* show menu on longpress (rightclick not available on mobile devices) */
            new LongPress(onMap, 500);
            google.maps.event.addListener(onMap, 'longpress', function(event) {
                supressClick = true;
                showContextMenu(event.latLng, ContextMenuTypes.DELETE_MARKER, marker);
                setTimeout(function() {
                    supressClick = false;
                }, 1000);
            });
			return onMap;
		}
		
        /* Opens a fancybox with the image */
        function openFancybox(picture, text) {
            $.fancybox({
                'autoScale': true,
                'transitionIn': 'elastic',
                'transitionOut': 'elastic',
                'speedIn': 500,
                'speedOut': 300,
                'autoDimensions': true,
                'centerOnScroll': true,
                'title' : text,
                'helpers' : {
                    title : {
                        type : 'over'
                    }   
                },
                'href' : picture
            });
        }
        /* Gets the current date and time in a string */
        function getCurrentDateTime() {
            var currentdate = new Date(); 
            var datetime = currentdate.getDate() + "/"
                + (currentdate.getMonth()+1)  + "/" 
                + currentdate.getFullYear() + " "  
                + currentdate.getHours() + ":"  
                + currentdate.getMinutes() + ":" 
                + currentdate.getSeconds();
            return datetime;
        }
        /* Gets the current boat information (speed course position) */
        function getCurrentBoatInformation() {
            var obj = {};
            obj.speed = currentSpeed != null ? kmhToKn(currentSpeed) : "-";
            obj.course = currentCourse != null ? currentCourse.toFixed(2) : "-";
            obj.pos = currentPosition;
            obj.latStr = toLatLngString(obj.pos.lat(), "lat");
            obj.lngStr = toLatLngString(obj.pos.lng(), "lng");
            obj.html = "COG " + obj.course + "° SOG " + obj.speed + "kn <br/>" + getCoordinatesAsString(obj.pos.lat(), obj.pos.lng());
            return obj;
        }
        /* Converts kmh to knots */
        function kmhToKn(speed) {
            return (speed * KMH_TO_KNOTS).toFixed(4);
        }        
        /* Gets the current coordinates in a human readable format */
        function getCoordinatesAsString(lat, lng) {
            return toLatLngString(lat, "lat") + " " + toLatLngString(lng, "lng");
        }
        /* Gets the current coordinates in a human readable format array for use in the specific forms */
        function toLatLngArray(dms, type) {
            var sign = 1, Abs=0;
            var days, minutes, direction;
            var result = new Array();

            if(dms < 0) {
                sign = -1;
            }

            Abs = Math.abs( Math.round(dms * 1000000.));
            days = Math.floor(Abs / 1000000);
            minutes = (((Abs/1000000) - days) * 60).toFixed(2);
            days = days * sign;

            if(type == 'lat') {
                direction = days<0 ? 'S' : 'N';
            }

            if(type == 'lng') {
                direction = days<0 ? 'W' : 'E';
            }

            result[0] = (days * sign);
            result[1] = minutes;
            result[2] = direction;
            
            return result;
        }
        /* Gets the current coordinates in a human readable format in a complete string*/
        function toLatLngString(dms, type) {
            var tmp = toLatLngArray(dms, type);
            var deg = tmp[0].toString();

            if(type == 'lat') {
                if(deg.length == 1) {
                    deg = "0" + deg;
                }
            } else if(type == 'lng') {
                if(deg.length == 1) {
                    deg = "00" + deg;
                } else if(deg.length == 2) {
                    deg = "0" + deg;
                }
            }

            return deg + '°' + tmp[1] +"' " + tmp[2];
        }

        /**
        * *********************************************************************************
        * Deletes the selected mark.
        * *********************************************************************************
        */
        function deleteSelectedMark() {
            if(data.mark.active != null) {
                self.remove('mark', data.mark.active.id);
            }
        }

        /**
        * *********************************************************************************
        * Converts the position to a GEO-String in the Format: XX.XX°XX.XXN/S'
        * *********************************************************************************
        */
        function toGeoString(value, posChar, negChar, degLength) {
            var direction;

            if (value >= 0) {
                direction = posChar;
                
            } else {
                direction = negChar;
                value = -value;
            }

            var deg = Math.floor(value);
            var min = (value - deg) * 60;
            var min_pre = Math.floor(min);
            return leadingZero(deg, degLength) + "°" + leadingZero(min.toFixed(2), 2) + "'" + direction;
        }

        /**
        * *********************************************************************************
        * Converts the number to a string with leading zero.
        * *********************************************************************************
        */
        function leadingZero(num, size) {
            var string = num+"";
            var length = (Math.floor(num) + "").length;
                for (var i = length; i < size; i++) {
                    string = "0" + string;
                }

            return string;
        }

        /**
        * *********************************************************************************
        * Converts the lat/lng-cooridnate to the x/y-value of the canvas.
        * *********************************************************************************
        */
        function getCanvasXY(currentLatLng){
            var scale = Math.pow(2, map.getZoom());
            var nw = new google.maps.LatLng(
              map.getBounds().getNorthEast().lat(),
              map.getBounds().getSouthWest().lng()
          );
          var worldCoordinateNW = map.getProjection().fromLatLngToPoint(nw);
          var worldCoordinate = map.getProjection().fromLatLngToPoint(currentLatLng);
          var currentLatLngOffset = new google.maps.Point(
              Math.floor((worldCoordinate.x - worldCoordinateNW.x) * scale),
              Math.floor((worldCoordinate.y - worldCoordinateNW.y) * scale)
          );
          return currentLatLngOffset;
        }
    };
    
    /**
    * *************************************************************************************
    * The route object class 
    * *************************************************************************************
    */
    $.seamap.route = function(obj, newgooglemaps){
        this.googlemaps = newgooglemaps;
        this.path = null;
        this.markers = [];
        this.label = null;
        this.notinteractive = (obj.type == 'track') ? true : false;
		options = $.seamap.options[obj.type];
        init = false;
        		
        // internal data
        var eventListener = {
            add : [],
            remove : [],
            drag : [],
            click : []
        };
        	
        this.path = new google.maps.Polyline(options.polyOptions);
        this.path.setMap(this.googlemaps);
        
        /**
        * *********************************************************************************
        * remove the route
        * *********************************************************************************
        */        
        this.remove = function () {
            if(this.label != null) {
                this.label.setMap(null);
                this.label = null;
            }
            if(this.path != null) {
                this.path.setMap(null);
                this.path = null;
            }
            $.each(this.markers, function(){
                this.setMap(null);
            });
            if (this.markers) {
                delete this.markers;
                this.markers = [];
            }
        }
        /**
        * *********************************************************************************
        * hide the route
        * *********************************************************************************
        */        
        this.hide = function () {
            this.remove();
            return;
            if(this.label != null) this.label.setMap(null);
            this.path.setVisible(false);
            $.each(this.markers, function(){
                this.setVisible(false);
            });
        }
        /**
        * *********************************************************************************
        * visible the route
        * *********************************************************************************
        */        
        this.visible = function () {
            /* check if no elements are on the map, so we have to set them back to map */
            if (0 == this.markers.length && 0 < obj.marks.length) {
                if(this.path == null) {
                    this.path = new google.maps.Polyline(options.polyOptions);
                    this.path.setMap(this.googlemaps);
                }
                tmp = obj.marks.splice(0, obj.marks.length);
                init = true;
                for (var i=0, l=tmp.length; i<l; i+=2) {
                    this.addMarker(new google.maps.LatLng(tmp[i], tmp[i + 1]));
                }
                init = false;
            } else {
                $.each(this.markers, function(){
                    this.setVisible(true);
                });
            }
            this.updateLabel();
            this.path.setVisible(true);
        }
        
        /**
        * *********************************************************************************
        * Adds a new route marker to the given position.
        * *********************************************************************************
        */
        this.addMarker = function(position) {
            var $this = this;
            // check if the position did not changed, so we do not safe this position.
            if (1 < obj.marks.length && position.lat() == obj.marks[obj.marks.length - 2] && position.lng() == obj.marks[obj.marks.length - 1]) {
                return null;
            }
            
            // create marker
            var marker = new google.maps.Marker({
                map: this.googlemaps,
                position: position,
                icon: options.markerOptions.image,
                shadow: options.markerOptions.shadow,
                animation: google.maps.Animation.DROP,
                draggable: !this.notinteractive,
                id: this.markers.length 
            });
            this.markers[this.markers.length] = marker;
            /* save lat and after that lng coordinate */
			obj.marks[obj.marks.length] = position.lat();
            obj.marks[obj.marks.length] = position.lng();
            
            // adds or updates the label
            if(this.label == null) {
                this.addLabel();
            } else {
                this.updateLabel();
            }

            // Add event listeners for the interactive mode
            if(!this.notinteractive) {
                google.maps.event.addListener(marker, 'drag', function(event) {
                    /* add the coordinates to the marks array. Marks and coordinates will be together in one array */
					obj.marks[marker.id * 2] = event.latLng.lat()
                    obj.marks[(marker.id * 2) + 1] = event.latLng.lng();
                    $this.drawPath();
                    $this.updateLabel();
                    $this.notify("drag");
                });
    
                google.maps.event.addListener(marker, 'rightclick', function(event) {
					obj.marks.splice(marker.id * 2, 2);
                    $this.removeMarker(marker);
                });
                
                new LongPress(marker, 500);
                google.maps.event.addListener(marker, 'longpress', function(event) {
                    $this.removeMarker(marker);
                });

                google.maps.event.addListener(marker, 'click', function(event) {
                    $this.notify("click");
                });
            }
            if (!init) {
                this.notify("add");
            }
			$this.drawPath();
			
            return marker;
        }
        
        /**
        * *********************************************************************************
        * Removes a marker from the route.
        * *********************************************************************************
        */
        this.removeMarker = function($marker) {
            $marker.setMap(null);
            this.markers = $.grep(this.markers, function(mark) {
                return mark != $marker;
            });
            
            var i = 0;
            $.each(this.markers, function(){
                this.id = i++;
            });
            this.drawPath();
            this.updateLabel();
            
            this.notify("remove");
        }
        
        /**
        * *********************************************************************************
        * Adds a label to the last marker.
        * *********************************************************************************
        */
        this.addLabel = function() {        
            this.label = new Label({map: this.googlemaps });
            this.label.bindTo('position', this.markers[this.markers.length-1], 'position');
            $(this.label.span_).css({"margin-left":"15px","padding":"7px","box-shadow":"0px 0px 3px #666","z-index":99999,"color":this.color});
            this.label.set('text', this.getTotalDistanceText());
        }
        
        /**
        * *********************************************************************************
        * Updates the the label (removes the old and adds a new one).
        * *********************************************************************************
        */
        this.updateLabel = function() {
            if(this.label != null) this.label.setMap(null);
            if(this.markers.length != 0) this.addLabel();
        }

        /**
        * *********************************************************************************
        * Draws a route by conntecting all route markers in the given order.
        * *********************************************************************************
        */
        this.drawPath = function() {
            var newPath = new Array();
            for (var i = 0; i < this.markers.length; ++i) {
                newPath[i] = this.markers[i].getPosition();
            }

            this.path.setPath(newPath);
        }
        
        /**
        * *********************************************************************************
        * Gets the total distance text of the route. Format example: 1234m
        * *********************************************************************************
        */
        this.getTotalDistanceText = function() {
            var dist = 0;

            if( this.markers.length > 1 ) {
                for( var i = 0; i < this.markers.length - 1; ++i ) {
                    dist += map.distance(this.markers[i].getPosition().lat(),
                                     this.markers[i].getPosition().lng(),
                                     this.markers[i + 1].getPosition().lat(),
                                     this.markers[i + 1].getPosition().lng())
                }
            }

            switch(map.getGlobalSettings().DISTANCE_UNIT)
            {
                case "globalSettings_mil":
                    return dist.toFixed(2) + "mi";
                case "globalSettings_nautmil":
                    return dist.toFixed(2) + "nm";
                default:                
                    return dist.toFixed(2) + "km";             
            }
        }
        
        /**
        * *********************************************************************************
        * Adds an event listener with the given type and function.
        * *********************************************************************************
        */
        this.addEventListener = function(type, fn) {
            eventListener[type][ eventListener[type].length ] = fn;
        }
                
        /**
        * *********************************************************************************
        * Calls the event listener functions, to notify the observers.
        * *********************************************************************************
        */
        this.notify = function(type) {
            var that = this;
            $.each(eventListener[type], function(){
                this.call(that, 0);
            });
        }
    };
    
    $.seamap.options = options;
	
    /**
    * *********************************************************************************
    * Recognizes a long click / long touch
    * *********************************************************************************
    */
    function LongPress(map, length) {
        this.length_ = length;
        var me = this;
        me.map_ = map;
        me.timeoutId_ = null;
        google.maps.event.addListener(map, 'mousedown', function(e) {
            me.onMouseDown_(e);
        });
        google.maps.event.addListener(map, 'mouseup', function(e) {
            me.onMouseUp_(e);
        });
        google.maps.event.addListener(map, 'drag', function(e) {
            me.onMapDrag_(e);
        });
    };

    LongPress.prototype.onMouseUp_ = function(e) {
        clearTimeout(this.timeoutId_);
    };

    LongPress.prototype.onMouseDown_ = function(e) {
        clearTimeout(this.timeoutId_);
        var map = this.map_;
        var event = e;
        this.timeoutId_ = setTimeout(function() {
            google.maps.event.trigger(map, 'longpress', event);
        }, this.length_);
    };

    LongPress.prototype.onMapDrag_ = function(e) {
        clearTimeout(this.timeoutId_);
    };

    // extend jquery with our new fancy seamap plugin
    $.fn.seamap = function( opts ) {        
        //extend options
        if( typeof opts === 'object') {
            $.extend(options, opts);
        }  
        return this.each(function () {
            $this = $(this);
        
            if($this.data('seamap') === undefined) {
                $this.data('seamap:original', $this.clone());
                var seamap = new $.seamap(this);
                $this.data('seamap', seamap);
            } else {
                $.error("Another initialization of the seamap plugin is not possible!");
            }
        });
  
    };    
})( jQuery, window );