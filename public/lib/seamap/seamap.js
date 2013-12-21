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
        
        // Stroke colors: [0] is used for the distance tool, [1..] are used for the routes
        strokeColors : ['grey','red','blue','green','yellow','blueviolet','darkorange','magenta','black'],
        
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
                strokeColor: '#000000',
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
                strokeColor: '#000000',
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
                strokeColor: '#550000',
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
    * Methods which should be extended into this jequery plugin for synchronisation purpose.
    * Look at the variable "syncRequiredMethods" which holds all required methods.
    * *************************************************************************************
    */
    var sync = { };

    /**
    * *************************************************************************************
    * The seamap object class
    * *************************************************************************************
    */
    $.seamap = function(element){    
        /* the required list holds all names of the methods which has to be defined. */
        var syncRequiredMethods = 
        [
        'downloadBoats',         //trigger download of boats
        'downloadTracks',        //trigger download of tracks
        'downloadRoutes',        //trigger download of routes
        'downloadMarks',         //trigger download of marks
        
        'uploadBoat',           //trigger upload of boat
        'uploadTrack',          //trigger upload of track
        'uploadRoute',          //trigger upload of route
        'uploadMark',           //trigger upload of mark
        ];
    
        /* add a callback function to get notified about actions */
        this.addCallback = function (event, method) {
            for(var actual in events) {
                if(events[actual] === event) {
                    if (!callbacks[event]) {
                        callbacks[event] = $.Callbacks();
                    }
                    callbacks[event].add(method);
                    return;
                }
            }
            throw("Cannot add Callback for the event '"+event+"', because this event does not exist.");
        };

        this.startBoatAnimation = function() {
            startBoatAnimation();
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
            return jQuery.extend(true, {}, events);
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
            addImageMark(image);
        }
        /* hide the route by id */
        this.hideRoute = function (id) {
            hideActiveRoute();
        };
        /* visible the route by id */
        this.visibleRoute = function (id) {
            activateRoute(routes[id]);
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
            activateTrack(tracks[id]);
        };
        /* remove a track with a specified id */
        this.removeTrack = function (id) {
            console.log("TODO: remove track");
        };
        /* hide the mark by id */
        this.hideMark = function (id) {
            marks[id].onMap.setVisible(false);
        };
        /* visible the mark by id */
        this.visibleMark = function (id) {
            marks[id].onMap.setVisible(true);
        };
        /* remove a mark with a specified id */
        this.removeMark = function (id) {
            console.log("TODO: remove mark");
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
        
        
        /* The callbacks list can be used to get notified about events. */
        var callbacks = {};
        /* All available events where a callback will be fired. */
        var events = 
        {
            //TODO
            CREATED_ROUTE   :  "CreatedRoute",
            DELETED_ROUTE   :  "DeletedRoute",
            FINISH_ROUTE    :  "FinishRouteRecording",
            ADDED_MARK      :  "AddedMark",
            DELETED_MARK    :  "DeletedMark",
            NO_GEO_SUPPORT  :  "GeolocationNotSupported",
            BOAT_POS_UPDATE :  "Boat position uodated",
            CREATED_TRACK   :  "CreatedTrack"
        };
        
        var options = $.seamap.options;
        var sync = $.seamap.sync;
    
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

        // The delay when tracking points are set 
        var TRACKING_DELAY = 5000;

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

        // tracks
        var tracks = {};
        var trackCounter = 1;
        var activeTrack = null;

        // routes
        var routes = {};
        var routeCounter = 1;
        var activeRoute = null;

        // distance
        var distanceroute = null;
        
        // marks
        var marks = {};
        var marksCount = 1;
        var selectedMark = null;
        
        // editing states
        var state = States.NORMAL;

        // context-menu/selection
        var contextMenuType = ContextMenuTypes.DEFAULT;
        var contextMenuVisible = false;
    
        // bind our jquery element
        var $this = $(element);
        
        // set as destination path
        var destpath = new google.maps.Polyline(options.polyOptions);

        //check if all required methods are defined.
        for (var i in syncRequiredMethods) {
            if (undefined === sync[syncRequiredMethods[i]]) {
                throw("The plugin has to be extended with a method called: '"+syncRequiredMethods[i]+"'."); 
            }
        }
        init();
        
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
                        addDefaultMark(event.latLng);
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
                   callbacks[events.NO_GEO_SUPPORT].fire("Your PC doesn't support geolocation!");
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
            if(isTracking && activeRoute != null) {
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
            callbacks[events.BOAT_POS_UPDATE].fire(getCurrentBoatInformation());
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
            if(activeRoute == null) {
                return false;
            }

            if(isSimulating) {
                fakeRoutePointer = 0;
                generateFakeTrackingRoute(activeRoute);
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
            setTimeout(function(){handleTracking();}, TRACKING_DELAY);

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
            selectedMark = manoverboardMark;
            deleteSelectedMark();
            selectedMark = null;
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
            selectedMark = marker;
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
            activeRoute = distance;  
            distanceroute = distance;            
            position = crosshairMarker.getPosition();
            /* just add a route marker if a position was selected */
            if (null != position) {
                activeRoute.onMap.addMarker(position);
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
            hideContextMenu();
            hideCrosshairMarker();

            var route = {}
            route.id = routeCounter.toString();
            route.label = "Route "+routeCounter;
            route.detailed = "created on blabla..";
            route.onMap = new $.seamap.route(route.id, map, "ROUTE");
            route.updated = true;

            routes[route.id] = route;        
  
            activateRoute(route); 
            
            /* activate the route if a markers will be clicked when the route is not selected. */
            activate = function() {
                removeDistanceRoute();
                activateRoute(route);
            }
            
            /* remove method will check if we remove all markers, which cause a deletion of the route */
            remove = function() {
                if (0 == activeRoute.onMap.markers.length) {
                    callbacks[events.DELETED_ROUTE].fire(activeRoute);
                    deleteActiveRoute();
                } else {
                    activate();
                }
            }
            
            update = function() {
                route.updated = true;
            }
            
            activeRoute.onMap.addEventListener("remove", remove);      
            activeRoute.onMap.addEventListener("click", activate);
            activeRoute.onMap.addEventListener("add", update);
            activeRoute.onMap.addEventListener("drag", update);  
            activeRoute.onMap.addEventListener("remove", update);  

            position = crosshairMarker.getPosition();
            /* just add a route marker if a position was selected */
            if (null != position) {
                addRouteMarker(position);
            }
            routeCounter++;
            callbacks[events.CREATED_ROUTE].fire([route]);
        }
                
        /**
        * *********************************************************************************
        * Activates the route, so that it is also visible in the sidebar.
        * *********************************************************************************
        */
        function activateRoute(route) {
            hideActiveRoute();
            /* important that state will be set here, because hideActiveRoute() will set the state to NORMAL */
            state = States.ROUTE;
            activeRoute = route;
            activeRoute.onMap.visible();
        }
        /**
        * *********************************************************************************
        * Hide the active route
        * *********************************************************************************
        */ 
        function hideActiveRoute(){
            if (activeRoute != null) {
                uploadRouteUpdate();
                state = States.NORMAL;
                activeRoute.onMap.hide();
                activeRoute = null;
            }
        }
        /**
        * *********************************************************************************
        * Delete the active route
        * *********************************************************************************
        */ 
        function deleteActiveRoute(){
            if (activeRoute != null) {
                uploadRouteDeletion();
                state = States.NORMAL;
                activeRoute.onMap.hide();
                delete routes[activeRoute.id];
                activeRoute = null;
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
            if (activeRoute != null && activeRoute.updated) {
                sync.uploadRoute(activeRoute);
                activeRoute.updated = false;
            }         
        }
        
        /**
        * *********************************************************************************
        * Check if the active route has ever been uploaded and so has to be deleted on the server.
        * *********************************************************************************
        */
        function uploadRouteDeletion() {
            sync.uploadRoute("delete");      
        } 
        
        /**
        * *********************************************************************************
        * Adds a new route marker to the active route.
        * *********************************************************************************
        */
        function addRouteMarker(latLng) {
            hideContextMenu();
            hideCrosshairMarker();
            
            var newmarker = activeRoute.onMap.addMarker(latLng);
            activeRoute.onMap.drawPath();
        }


        /**
        * *********************************************************************************
        * Handles the creation of a new route, activates it and bind the mouse-events.
        * Also hides the context menu and the marker.
        * *********************************************************************************
        */
        function handleAddNewTrack() {
            var track = {}
            track.id = trackCounter.toString();
            track.label = "Track " + trackCounter;
            track.detailed = "created on blabla..";
            track.onMap = new $.seamap.track(track.id, map, "TRACK");
            track.updated = true;

            tracks[track.id] = track;        
  
            activateTrack(track); 
            
            trackCounter++;
            callbacks[events.CREATED_TRACK].fire([track]);
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
        * Hide the active route
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
        * Delete the active route
        * *********************************************************************************
        */ 
        function deleteActiveTrack(){
            if (activeTrack != null) {
                uploadTrackDeletion();
                state = States.NORMAL;
                activeTrack.onMap.hide();
                delete routes[activeTrack.id];
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
        * Check if the active route has some changes which should be uploaded.
        * *********************************************************************************
        */
        function uploadTrackUpdate() {
            if (activeTrack != null && activeTrack.updated) {
                sync.uploadTrack(activeTrack);
                activeTrack.updated = false;
            }         
        }
        
        /**
        * *********************************************************************************
        * Check if the active route has ever been uploaded and so has to be deleted on the server.
        * *********************************************************************************
        */
        function uploadTrackDeletion() {
            sync.uploadTrack("delete");      
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
            addDefaultMark(crosshairMarker.getPosition());
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
        * Adds a simple marker to the given position and
        * bind the click-events to open its context menu.
        * *********************************************************************************
        */
        function addDefaultMark(position) {
            var mark = {}
            mark.id = marksCount.toString();
            mark.label = "Mark "+marksCount;
            mark.detailed = "created on blabla..";
            mark.onMap = new google.maps.Marker({
                map: map,
                position: position,
                icon: options.defaultOptions.markerOptions.image,
                draggable: true
            });

            google.maps.event.addListener(mark.onMap, 'rightclick', function(event) {
                showContextMenu(event.latLng, ContextMenuTypes.DELETE_MARKER, mark);
            });

            new LongPress(mark.onMap, 500);
            google.maps.event.addListener(mark.onMap, 'longpress', function(event) {
                supressClick = true;
                showContextMenu(event.latLng, ContextMenuTypes.DELETE_MARKER, mark);
                setTimeout(function() {
                    supressClick = false;
                }, 1000);
            });
            
            marks[marksCount.toString()] = mark;
            marksCount++;
            callbacks[events.ADDED_MARK].fire([mark]);
        }

        /**
        * *********************************************************************************
        * Adds a image marker to the given position and
        * bind the click-events to open its context menu.
        * *********************************************************************************
        */
        function addImageMark(image) {
            var mark = {}
            mark.id = marksCount.toString();
            mark.label = "Mark "+marksCount;
            mark.detailed = getCurrentDateTime() + " / " + getCurrentCoordinatesAsString();
            var position = currentPosition;
            var thnail = image[0];
            var picture = image[1];
            var picture_detailed = mark.detailed;
            mark.onMap = new google.maps.Marker({
                map: map,
                position: position,
                icon: thnail,
                draggable: false
            });

            google.maps.event.addListener(mark.onMap, 'click', function(event) {
                if(!supressClick) {
                    openFancybox(picture, picture_detailed);
                }
            });

            google.maps.event.addListener(mark.onMap, 'rightclick', function(event) {
                showContextMenu(event.latLng, ContextMenuTypes.DELETE_MARKER, mark);
            });

            new LongPress(mark.onMap, 500);
            google.maps.event.addListener(mark.onMap, 'longpress', function(event) {
                supressClick = true;
                showContextMenu(event.latLng, ContextMenuTypes.DELETE_MARKER, mark);
                setTimeout(function() {
                    supressClick = false;
                }, 1000);
            });
            
            marks[marksCount.toString()] = mark;
            marksCount++;
            callbacks[events.ADDED_MARK].fire([mark]);
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
            obj.latStr = toLatLngString(obj.pos.nb, "lat");
            obj.lngStr = toLatLngString(obj.pos.ob, "lng");
            obj.html = "COG " + obj.course + "° SOG " + obj.speed + "kn <br/>" + getCurrentCoordinatesAsString();
            return obj;
        }
        /* Converts kmh to knots */
        function kmhToKn(speed) {
            return (speed * KMH_TO_KNOTS).toFixed(4);
        }        
        /* Gets the current coordinates in a human readable format */
        function getCurrentCoordinatesAsString() {
            var north = currentPosition.nb;
            var east = currentPosition.ob;
            return toLatLngString(north, "lat") + " " + toLatLngString(east, "lng");
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
            if(selectedMark != null) {
                selectedMark.onMap.setMap(null);
                delete marks[selectedMark.id];
                callbacks[events.DELETED_MARK].fire(selectedMark);
                console.log(marks);
            }
        }

        /**
        * *********************************************************************************
        * Edit the selected mark.
        * *********************************************************************************
        */
        function editSelectedMark() {
            if(selectedMark != null) {
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
        this.color = $.seamap.options.strokeColors[this.id % ($.seamap.options.strokeColors.length-1)];
        
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
        
        // edit color
        options.polyOptions.strokeColor = this.color;
            
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
                    dist += this.distance(    this.markers[i].getPosition().lat(),
                                             this.markers[i].getPosition().lng(),
                                             this.markers[i + 1].getPosition().lat(),
                                             this.markers[i + 1].getPosition().lng())
                }
            }

            return dist + "m";
        }

        /**
        * *********************************************************************************
        * Calculates the distance in meters between two GEO-coordinates (lat/lng).
        * *********************************************************************************
        */
        this.distance = function(lat1,lon1,lat2,lon2) {
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
        this.color = $.seamap.options.strokeColors[this.id % ($.seamap.options.strokeColors.length-1)];
        
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
        
        // edit color
        options.polyOptions.strokeColor = this.color;
            
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
                    dist += this.distance(    this.markers[i].getPosition().lat(),
                                             this.markers[i].getPosition().lng(),
                                             this.markers[i + 1].getPosition().lat(),
                                             this.markers[i + 1].getPosition().lng())
                }
            }

            return dist + "m";
        }

        /**
        * *********************************************************************************
        * Calculates the distance in meters between two GEO-coordinates (lat/lng).
        * *********************************************************************************
        */
        this.distance = function(lat1,lon1,lat2,lon2) {
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
    $.seamap.sync = sync;
    
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
    $.fn.seamap = function( syncMethods, opts ) {        
        //extend sync methods
        if( typeof syncMethods === 'object') {
            $.extend(sync, syncMethods);
        }
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