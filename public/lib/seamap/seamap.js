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
        defaultRoute         : null,
        mode                 : "INTERACTIVE",
        startLat             : 47.655,
        startLong             : 9.205,
        zoom                 : 10,
        
        height : function() {
            return
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
    * The seamap object class
    * *************************************************************************************
    */
    $.seamap = function(element){    
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
        /* delete a mark with a specified id */
        this.deleteMark = function (id) {
        
        };
        /* hide the route by id */
        this.hideRoute = function (id) {
            hideActiveRoute();
        };
        /* visible the route by id */
        this.visibleRoute = function (id) {
            activateRoute(routes[id]);
        };
        /* hide the mark by id */
        this.hideMark = function (id) {
            marks[id].onMap.setVisible(false);
        };
        /* visible the mark by id */
        this.visibleMark = function (id) {
            marks[id].onMap.setVisible(true);
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
        };
        
        var options = $.seamap.options;
    
        // The states of the plugin
        var States = {
            "NORMAL"   : 0, 
            "ROUTE"    : 1, 
            "DISTANCE" : 2,
            "MARKER"   : 3
        },
        // The context menu types
        ContextMenuTypes = {
            "DEFAULT" : 0, 
            "DELETE_MARKER" : 1
        };

        // checks if message for no geolocation support was shown
        var noGeo_flag = false;

        // The current position of the ship (fake or real depends if browser supports geolocation and users permission)
        var currentPosition = null;
        
        // maps
        var map = null;

        // crosshair marker
        var crosshairMarker = null;

        // boat marker
        var boatMarker = null;
        
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
        var contextMenuType = ContextMenuTypes.DEFAULT,
            
            contextMenuVisible = false;
    
        // bind our jquery element
        var $this = $(element);
        
        // set as destination path
        var destpath = new google.maps.Polyline(options.polyOptions);

        init();

        /**
        * *********************************************************************************
        * Initializes the GoogleMaps with OpenSeaMaps overlay, the context menu, the
        * boat animation and the default route.
        * *********************************************************************************
        */
        function init() {
            initMap();
            initOpenSeaMaps();
            
            if ( options.mode !== "NOTINTERACTIVE" ) {
                initContextMenu();    
                initGoogleMapsListeners();
            }
            initCrosshairMarker();
        }

        /**
        * *********************************************************************************
        * Initialized the GoogleMaps (zoom level, center position, ...)
        * *********************************************************************************
        */
        function initMap() {
            if(typeof options.height == 'function') {
                $this.height(options.height());
                
                $(window).resize(function(){
                    $this.height(options.height());
                });
            } else {
                $this.height(options.height);
            }        
                        
            map = new google.maps.Map(element, {
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
                zoom: options.zoom,
                center: new google.maps.LatLng(options.startLat, options.startLong),
            });
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
                icon: options.crosshairOptions.markerOptions.image
            });
            
            // init left-click context menu listener
            google.maps.event.addListener(crosshairMarker, 'click', function(event) {
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
            handleBoatPositionUpdate(currentPosition);
        }
        /**
         * Handles the boat position with fake/generated geolocation data
         */
        function handleFakeBoatPositionUpdate() {
            //TODO: Get center of current view of map as boat position + a variation
            currentPosition = map.getCenter();
            handleBoatPositionUpdate(currentPosition);
        }
        /**
         * Updates the boat icon on the map 
         */
        function handleBoatPositionUpdate(position) {
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
            //$('#tooltip_helper').popover('hide'); <-- REMARK: this does cause problems!
            
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

            routes[route.id] = route;        
  
            activateRoute(route); 
            
            activate = function() {
                //FIXME : This code seems not to be required at all.
              //  removeDistanceRoute();
              //  activateRoute(route);
            }
            
            /* remove method will check if we remove all markers, which cause a deletion of the route */
            remove = function() {
                if (0 == activeRoute.onMap.markers.length) {
                    callbacks[events.DELETED_ROUTE].fire(activeRoute);
                    deleteActiveRoute();
                }
            }
            
            activeRoute.onMap.addEventListener("remove", remove);    
            activeRoute.onMap.addEventListener("drag", activate);    
            activeRoute.onMap.addEventListener("click", activate);
        

            position = crosshairMarker.getPosition();
            /* just add a route marker if a position was selected */
            if (null != position) {
                addRouteMarker(position);
            }
            routeCounter++;
            callbacks[events.CREATED_ROUTE].fire(route);
        }
                
        /**
        * *********************************************************************************
        * Activates the route, so that it is also visible in the sidebar.
        * *********************************************************************************
        */
        function activateRoute(route) {
            hideCrosshairMarker(crosshairMarker);
            hideContextMenu();
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
            hideContextMenu();
            hideCrosshairMarker();
            state = States.NORMAL;
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
            
            marks[marksCount.toString()] = mark;
            marksCount++;
            callbacks[events.ADDED_MARK].fire(mark);
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
            mark.detailed = getCurrentDateTime();
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
                openFancybox(picture, picture_detailed);
            });

            google.maps.event.addListener(mark.onMap, 'rightclick', function(event) {
                showContextMenu(event.latLng, ContextMenuTypes.DELETE_MARKER, mark);
            });
            
            marks[marksCount.toString()] = mark;
            marksCount++;
            callbacks[events.ADDED_MARK].fire(mark);
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
    
    $.seamap.options = options;

    // extend jquery with our new fancy seamap plugin
    $.fn.seamap = function( opts ) {
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