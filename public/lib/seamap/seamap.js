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
        
        // Default options for the routing tool
        routeOptions : {
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

        // Default options for the tracking tool
        trackOptions : {
            polyOptions : {
                strokeColor: 'green',
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
        
        // Default options for the distance tool
        distanceOptions : {
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
        boatOptions : {
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
		function dataParameterCheck(type, id, obj) {
			/* check if the type exist */
            if (undefined === data[type]) {
				throw("Type "+type+" does not exist.");
			}
			/* check if the id exist */
			if (undefined === data[type].list[id]) {
				throw("There is no "+type+" with the id "+id);
			}
		}
	
        /* add a callback function to get notified about actions */
        this.addCallback = function (e, method) {
            if (callbacks[e] === undefined) {
				throw("Cannot add Callback for the event '"+e+"', because this event does not exist.");
			}
            callbacks[e].add(method);
        };
        /* remove a route,mark,track,boat,... */
        this.remove = function(type, id) {
			dataParameterCheck(type, id, null);
		
			/* check if a remove method is defined which has to be called */
			if (undefined !== data[type].removeMethod) {
				data[type].removeMethod(id);
			}
			/* remove the element now from the list */
			callbacks[event.SERVER_REMOVE].fire(data[type].list[id]);
			delete data[type].list[id];
        };
        this.add = function(type, obj) {
            console.log("TODO add "+type+" "+obj);
        };
        this.update = function(type, id, obj) {
            console.log("TODO update "+type+" "+id+" "+obj);
        };
        this.get = function(type, id) {
			dataParameterCheck(type, id, null);
			return data[type].list[id];
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
            /* set state to marker to set the marker on the next map action */
            state = States.MARKER;
        };
        this.setImageMark = function(image) {
            addNewMark(currentPosition, image);
        };
        /* set a temporary mark */
        this.setTemporaryMark = function(position) {
            handleSetTemporaryMark(position);
        };
        /* hide the route by id */
        this.hideRoute = function (id) {
            hideActiveRoute();
        };
        /* visible the route by id */
        this.visibleRoute = function (id) {
            activateRoute(data.route.list[id]);
        };
        /* remove a route with a specified id */
        this.removeRoute = function (id) {
            console.log("TODO: remove route");
        };
        /* hide the track by id */
        this.hideTrack = function (id) {
            hideActiveTrack();
        };
        /* visible the track by id */
        this.visibleTrack = function (id) {
            activateTrack(track[id]);
        };
        /* remove a track with a specified id */
        this.removeTrack = function (id) {
            console.log("TODO: remove track");
        };
        /* Checks if the tracking is enabled and displays a message when it is */
        this.checkTracking = function() {
            if(isTracking) {
                callbacks[event.TRACKING_ACTIVE].fire({msg : "This option is disabled because you are currently tracking!"});
                return false;
            }
            return true;
        }
        /* hide the mark by id */
        this.hideMark = function (id) {
            data.mark.list[id].onMap.setMap(null);
			data.mark.list[id].onMap = null;
        };
        /* visible the mark by id */
        this.visibleMark = function (id) {
            data.mark.list[id].onMap = getOnMapMark(data.mark.list[id]);
        };
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
            console.log("Selected boat "+id);
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
            LEAVE_SECURITY_CIRCLE : true
        }
        
        /* The callbacks list can be used to get notified about events. */
        var callbacks = {};
        /* All available events where a callback will be fired. */
        var event = 
        {
            //TODO
			LOADED_ROUTE			: 0,
			LOADED_MARK				: 1,
			LOADED_TRACK			: 2,
            CREATED_ROUTE           : 3,
            DELETED_ROUTE           : 4,
            CREATED_MARK            : 5,
            DELETED_MARK            : 6,
            NO_GEO_SUPPORT          : 7,
            BOAT_POS_UPDATE         : 8,
            CREATED_TRACK           : 9,
            TRACKING_ACTIVE         : 10,
            LEFT_SECURITY_CIRCLE    : 11,
			SERVER_CREATE			: 12,
			SERVER_REMOVE			: 13,
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

		var types = ['mark'];
		
		var data = {
			mark : {
				list : {},
				count : 1,
				active : null
			},
			route : {
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
		};

		
        // track
        var track = {};
        var trackCount = 1;
        var activeTrack = null;

        // distance
        var distanceroute = null;
        
        //temporary marker
        var temporaryMarker = null;
        
        // editing states
        var state = States.NORMAL;

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
            return calculateDistance(activeSecurityCircle.center.nb, activeSecurityCircle.center.ob,
                                     currentPosition.nb, currentPosition.ob);
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
                        addRouteMarker(event.latLng);
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
                tmp[0] = route.onMap.markers[i - 1].position.nb;
                tmp[1] = route.onMap.markers[i - 1].position.ob;
                result[j] = tmp;
                tmp = new Array();
                j++;

                if (i == route.onMap.markers.length) {
                    generatedTrackingRoute = result;
                    return;
                }
                var lngKoeff = (route.onMap.markers[i].position.nb - route.onMap.markers[i - 1].position.nb) / len;
                var latKoeff = (route.onMap.markers[i].position.ob - route.onMap.markers[i - 1].position.ob) / len;

                for (var k = 1; k < len; k++) {
                    tmp[0] = route.onMap.markers[i - 1].position.nb + (k * lngKoeff);
                    tmp[1] = route.onMap.markers[i - 1].position.ob + (k * latKoeff);
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
                    shape: options.boatOptions.markerOptions.crosshairShape,
                    icon:  options.boatOptions.markerOptions.image
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
            if(data.route.active == null) {
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
            mark.label = "Person overboard";
            mark.detailed = "created on blabla..";
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
            data.mark.active = manoverboardMark;
            deleteSelectedMark();
            data.mark.active = null;
            manoverboardMark = null;
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
            
            var distance = {}
            distance.id = "-1";
            distance.onMap = new $.seamap.route("-1", map, "DISTANCE");
            data.route.active = distance;  
            distanceroute = distance;            
            position = crosshairMarker.getPosition();
            /* just add a route marker if a position was selected */
            if (null != position) {
                data.route.active.onMap.addMarker(position);
            }
            
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
            
            state = States.NORMAL;
            
            removeDistanceRoute();
        }
        
        /**
        * *********************************************************************************
        * Removes the distance route from the map.
        * *********************************************************************************
        */
        function removeDistanceRoute() {
            if (distanceroute != null) {
                distanceroute.onMap.removeFromMap();
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
                callbacks[event.TRACKING_ACTIVE].fire({msg : "This options is disabled because tracking is active!"});
                return;
            }
            
            hideContextMenu();
            hideCrosshairMarker();

            var newRoute = {}
			newRoute.type = 'route';
            newRoute.id = data.route.count.toString();
            newRoute.name = "Route "+data.route.count;
            newRoute.updated = true;

			newRoute.onMap = getOnMapRoute(newRoute);
            data.route.list[newRoute.id] = newRoute;        
            activateRoute(newRoute); 
  
            position = crosshairMarker.getPosition();
            /* just add a route marker if a position was selected */
            if (null != position) {
                addRouteMarker(position);
            }
            data.route.count++;
            callbacks[event.CREATED_ROUTE].fire(newRoute);
        }

        /**
        * *********************************************************************************
        * Place an existing mark on the map and return the handle
        * *********************************************************************************
        */
		function getOnMapRoute(route) {
			var onMap = new $.seamap.route(route.id, map, "ROUTE");
		            
            /* activate the route if a markers will be clicked when the route is not selected. */
            activate = function() {
                removeDistanceRoute();
                activateRoute(route);
            }
            
            /* remove method will check if we remove all markers, which cause a deletion of the route */
            remove = function() {
                if (0 == onMap.markers.length) {
                    deleteActiveRoute();
                } else {
                    activate();
                }
            }
			
            /* if the route was updated, the updated flag will be set to sync the route with the server */
            update = function() {
                removeDistanceRoute();
                activateRoute(route);
                route.updated = true;
            }
            
            onMap.addEventListener("remove", remove);      
            onMap.addEventListener("click", activate);
            onMap.addEventListener("add", update);
            onMap.addEventListener("drag", update);  
            onMap.addEventListener("remove", update);  
			
			return onMap;
		}
                
        /**
        * *********************************************************************************
        * Activates the route, so that it is also visible in the sidebar.
        * *********************************************************************************
        */
        function activateRoute(route) {
			/* if this route is already active we do not have to hide the route */
            if (data.route.active && data.route.active.id != route.id) {
				hideActiveRoute();
			}
            /* important that state will be set here, because hideActiveRoute() will set the state to NORMAL */
            state = States.ROUTE;
            data.route.active = route;
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
                callbacks[event.DELETED_ROUTE].fire(data.route.active);
				callbacks[event.SERVER_REMOVE].fire(data.route.active);
                uploadRouteDeletion();
                state = States.NORMAL;
                data.route.active.onMap.hide();
                delete data.route.list[data.route.active.id];
                data.route.active = null;
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
            if (data.route.active != null && data.route.active.updated) {
				callbacks[event.SERVER_CREATE].fire(data.route.active);
                data.route.active.updated = false;
            }         
        }
        
        /**
        * *********************************************************************************
        * Check if the active route has ever been uploaded and so has to be deleted on the server.
        * *********************************************************************************
        */
        function uploadRouteDeletion() {
			callbacks[event.SERVER_REMOVE].fire(data.route.active);
        } 
        
        /**
        * *********************************************************************************
        * Adds a new route marker to the active route.
        * *********************************************************************************
        */
        function addRouteMarker(latLng) {
            hideContextMenu();
            hideCrosshairMarker();
            
            var newmarker = data.route.active.onMap.addMarker(latLng);
            data.route.active.onMap.drawPath();
        }


        /**
        * *********************************************************************************
        * Handles the creation of a new route, activates it and bind the mouse-events.
        * Also hides the context menu and the marker.
        * *********************************************************************************
        */
        function handleAddNewTrack() {
            var newTrack = {};
            newTrack.id = trackCount.toString();
            newTrack.name = "Track " + trackCount;
            newTrack.onMap = getOnMapTrack(newTrack);
            newTrack.updated = true;
            track[newTrack.id] = newTrack;        
            activateTrack(newTrack); 
            trackCount++;
            callbacks[event.CREATED_TRACK].fire(newTrack);
        }
		
        /**
        * *********************************************************************************
        * Place an existing track on the map and return the handle
        * *********************************************************************************
        */
		function getOnMapTrack(track) {
			var onMap = new $.seamap.track(track.id, map, "TRACK");
			return onMap;
		}
                
        /**
        * *********************************************************************************
        * Activates the route, so that it is also visible in the sidebar.
        * *********************************************************************************
        */
        function activateTrack(track) {
            hideActiveTrack();
            /* important that state will be set here, because hideActiveRoute() will set the state to NORMAL */
            state = States.TRACK;
            activeTrack = track;
            activeTrack.onMap.visible();
        }
        /**
        * *********************************************************************************
        * Hide the active track
        * *********************************************************************************
        */ 
        function hideActiveTrack() {
            if (activeTrack != null) {
                uploadTrackUpdate();
                state = States.NORMAL;
                activeTrack.onMap.hide();
                activeTrack = null;
            }
        }
        /**
        * *********************************************************************************
        * Delete the active track
        * *********************************************************************************
        */ 
        function deleteActiveTrack(){
            if (activeTrack != null) {
                uploadTrackDeletion();
                state = States.NORMAL;
                activeTrack.onMap.hide();
                delete track[activeTrack.id];
                activeTrack = null;
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
            if (activeTrack != null && activeTrack.updated) {
				callbacks[event.SERVER_CREATE].fire(activeTrack);
                activeTrack.updated = false;
            }         
        }
        
        /**
        * *********************************************************************************
        * Check if the active route has ever been uploaded and so has to be deleted on the server.
        * *********************************************************************************
        */
        function uploadTrackDeletion() {
			callbacks[event.SERVER_REMOVE].fire(activeTrack);
        } 
        
        /**
        * *********************************************************************************
        * Adds a new route marker to the active route.
        * *********************************************************************************
        */
        function addTrackMarker(latLng) {            
            var newmarker = activeTrack.onMap.addMarker(latLng);
            activeTrack.onMap.drawPath();
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
            editSelectedMark();
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
            var newMark = {}
			newMark.type = 'mark';
            newMark.id = data.mark.count.toString();
            newMark.name = "Mark "+data.mark.count;
			newMark.lat = position.lat();
			newMark.lng = position.lng();
			newMark.date = new Date().getTime();
			if (image) {
				newMark.image_thumb = image[0];
				newMark.image_big = image[1];
			}
            newMark.onMap = getOnMapMark(newMark);
			
            data.mark.list[data.mark.count.toString()] = newMark;
            data.mark.count++;
            callbacks[event.SERVER_CREATE].fire(newMark);
            callbacks[event.CREATED_MARK].fire(newMark);
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
                draggable: (marker.image_thumb) ? false : true
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
				callbacks[event.SERVER_CREATE].fire(marker);
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
                data.mark.active.onMap.setMap(null);
                callbacks[event.SERVER_REMOVE].fire(data.mark.active);
				callbacks[event.DELETED_MARK].fire(data.mark.active);
                delete data.mark.list[data.mark.active.id];
				data.mark.active = null;
            }
        }

        /**
        * *********************************************************************************
        * Edit the selected mark.
        * *********************************************************************************
        */
        function editSelectedMark() {
            if(data.mark.active != null) {
                $('#modal-form_marker').modal('show');
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
    $.seamap.route = function(newrouteid, newgooglemaps, type){
        this.id = newrouteid;
        this.googlemaps = newgooglemaps;
        
        this.path = null;
        this.markers = [];
        this.label = null;
        this.notinteractive = false;
        
        // internal data
        var eventListener = {
            add : [],
            remove : [],
            drag : [],
            click : []
        };
        
        if(type === "DISTANCE") {
            options = $.seamap.options.distanceOptions;
        } else {
            options = $.seamap.options.routeOptions;
        }
            
        this.path = new google.maps.Polyline(options.polyOptions);
        this.path.setMap(this.googlemaps);
        
        /**
        * *********************************************************************************
        * Sets the route as not interactive.
        * *********************************************************************************
        */        
        this.setNotInteractive = function() {
            this.notinteractive = true;
        }
        /**
        * *********************************************************************************
        * remove the route
        * *********************************************************************************
        */        
        this.remove = function () {
            if(this.label != null) this.label.setMap(null);
            this.path.setMap(null);
            $.each(this.markers, function(){
                this.setMap(null);
            });
        }
        /**
        * *********************************************************************************
        * hide the route
        * *********************************************************************************
        */        
        this.hide = function () {
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
            this.updateLabel();
            this.path.setVisible(true);
            $.each(this.markers, function(){
                this.setVisible(true);
            });
        }
        
        /**
        * *********************************************************************************
        * Adds a new route marker to the given position.
        * *********************************************************************************
        */
        this.addMarker = function(position) {
            var $this = this;

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
            
            // adds or updates the label
            if(this.label == null) {
                if (!this.notinteractive) {
                    this.addLabel();
                }
            } else {
                this.updateLabel();
            }

            // Add event listeners for the interactive mode
            if(!this.notinteractive) {
                google.maps.event.addListener(marker, 'drag', function() {
                    $this.drawPath();
                    $this.updateLabel();
                    $this.notify("drag");
                });
    
                google.maps.event.addListener(marker, 'rightclick', function(event) {
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
            
            this.notify("add");
            
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
        * Removes a whole route from the map (with its paths, labels and markers).
        * *********************************************************************************
        */
        this.removeFromMap = function() {
            this.path.setMap(null);
            this.label.setMap(null);
            $.each(this.markers, function() {
                this.setMap(null);
            });
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

    /**
    * *************************************************************************************
    * The track object class 
    * *************************************************************************************
    */
    $.seamap.track = function(newtrackid, newgooglemaps, type){
        this.id = newtrackid;
        this.googlemaps = newgooglemaps;
        
        this.path = null;
        this.markers = [];
        this.label = null;
        this.notinteractive = false;
        
        // internal data
        var eventListener = {
            add : [],
            remove : []
        };
        
        options = $.seamap.options.trackOptions;

        this.path = new google.maps.Polyline(options.polyOptions);
        this.path.setMap(this.googlemaps);
        
        /**
        * *********************************************************************************
        * hide the track
        * *********************************************************************************
        */        
        this.hide = function () {
            if(this.label != null) this.label.setMap(null);
            this.path.setVisible(false);
            $.each(this.markers, function(){
                this.setVisible(false);
            });
        }
        /**
        * *********************************************************************************
        * visible the track
        * *********************************************************************************
        */        
        this.visible = function () {
            this.updateLabel();
            this.path.setVisible(true);
            $.each(this.markers, function(){
                this.setVisible(true);
            });
        }
        
        /**
        * *********************************************************************************
        * Adds a new track marker to the given position.
        * *********************************************************************************
        */
        this.addMarker = function(position) {
            var $this = this;

            // create marker
            var marker = new google.maps.Marker({
                map: this.googlemaps,
                position: position,
                icon: options.markerOptions.image,
                shadow: options.markerOptions.shadow,
                animation: google.maps.Animation.DROP,
                draggable: false,
                id: this.markers.length 
            });
            this.markers[this.markers.length] = marker;
            
            // adds or updates the label
            if(this.label == null) {
                this.addLabel();
            } else {
                this.updateLabel();
            }
            
            this.notify("add");
            
            return marker;
        }

        /**
        * *********************************************************************************
        * Removes a marker from the track.
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
        * Removes a whole track from the map (with its paths, labels and markers).
        * *********************************************************************************
        */
        this.removeFromMap = function() {
            this.path.setMap(null);
            this.label.setMap(null);
            $.each(this.markers, function() {
                this.setMap(null);
            });
        }

        /**
        * *********************************************************************************
        * Draws a track by conntecting all track markers in the given order.
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
        * Gets the total distance text of the track. Format example: 1234m
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