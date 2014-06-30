//HTML templates - Handlebars lib
var tripTemplate;
var waypointTemplate;
var ajaxLoaderTemplate;
var loadMoreEntriesTemplate;
var entryDetailsTemplate;
var timelineTripTemplate;
var timelineWaypointTemplate;
var timelineTripHeaderTemplate;
var waypointEditorTemplate;

var map;

var dateFormatShort = "YYYY-MM-DD";
var timeFormat = "h:mm:ss a";

var isLoadingWaypoints = false;
var scrollToWaypointTimeout;

var boatId;

/**
 * Initialises the logbook
 * @param initialTripId - UUID of the initial trip
 * @param boatId - UUID of the boat
 */
function initialiseLogbook(initialTripId, boatId, expandImageURL, contractImageURL){
    this.boatId = boatId;

    // preloaded Images
    var expandImage = new Image();
    var contractImage = new Image();
    expandImage.src = expandImageURL;
    contractImage.src = contractImageURL;

    // compile the HTML templates with Handlebars lib
    tripTemplate = Handlebars.compile($('#tripTemplate').html());
    waypointTemplate = Handlebars.compile($('#waypointTemplate').html());
    ajaxLoaderTemplate = Handlebars.compile($('#ajaxLoaderTemplate').html());
    loadMoreEntriesTemplate = Handlebars.compile($('#loadMoreEntriesTemplate').html());
    entryDetailsTemplate = Handlebars.compile($('#entryDetailsTemplate').html());
    timelineTripTemplate = Handlebars.compile($('#timelineTripTemplate').html());
    timelineWaypointTemplate = Handlebars.compile($('#timelineWaypointTemplate').html());
    timelineTripHeaderTemplate = Handlebars.compile($('#timelineTripHeaderTemplate').html());
    waypointEditorTemplate = Handlebars.compile($('#waypointEditorTemplate').html());
    	
    // load the initial trip
    changeTripTo(initialTripId);

    // load the timeline
    logbook.getAllTripsOfBoat(boatId, onReceivedAllTrips);
    //logbook.getAllWaypointsOfTrip(initialTripId, onReceivedAllWaypointsByTrip);

    // click handlers for loading previous/next trip
    $('.NextPrevTripButton').click(function () { changeTripTo($(this).attr('data-trip')) });

    // toggle sections of the details panel
    $('.accordion .head').click(function () {
        // change expander image
        var headId = $(this).attr('id');
        var changeImage = document.getElementById(headId.substr(0, headId.lastIndexOf('_')) + '_img');

        if (changeImage.src == expandImage.src) {
            changeImage.src = contractImage.src;

            $(this).next().toggle("slow", function(){
                if(headId != 'details_map_head') {
                    initialiseCharts ( ) ;
                    var tripHeader = $('#trip_header_'+initialTripId);
                    initialiseDistributionCharts(tripHeader);
                }
            });

        } else {
            changeImage.src = expandImage.src;
            $(this).next().toggle("slow");
        }
        return true;
    });

    //add margin to entries column. Otherwise it's not posible to scroll to the last entry
    $('#entries_col').css('margin-bottom', $.waypoints('viewportHeight'));

    // add handlers for clicks on trips & waypoints in the timeline
    $('#timeline').on('click', 'div.timeline-panel.expandable', function () {     // click on trip header in timeline
        var tripId = $(this).attr("id");
        tripId = tripId.replace('timeline-trip_', '');

        // check if this is the active trip
        var tripContainer = $('#trip_' + tripId);
        if (tripContainer.length != 0) {
            $('#timeline-trip_container_' + tripId).toggle("slow");
            return true;
        } else {
            // this trip is currently not loaded -> get it
            $('#entries').html(ajaxLoaderTemplate({ loaderId: 'tripLoader' }));
            logbook.getTripData(tripId, onReceivedTrip);
        }

    });

    $('#timeline').on('click', 'div.timeline-panel.clickable', function () {    // click on waypoint item in timeline
        var waypointId = $(this).attr("id");
        waypointId = waypointId.replace ( 'timeline-', '' );
        var entry = $("#" + waypointId);
        scrollToWaypoint(entry);
        return true;
    });

    $('#details').dragscrollable({ dragSelector: '.dragscrollarea', acceptPropagatedEvent: true });
    $('#timeline').dragscrollable();

    //hotfix: hrefs didn't work anymore (click returns false anywere?!)
    $('.navbar .nav a').click(function (event) {
        var url = $(this).attr('href');
        //console.log(url);
        window.location = url;
        return true;
    });

    map = new google.maps.Map(document.getElementById('map_canvas'));

    // click handlers for entry filter buttons
    $('#chkOnlyWithImage, #chkOnlyWithNote').click(function () {
        $(this).toggleClass('active');
        applyEntryFilters();
    });

    $('#timeOffsetToggler').click(function () {
        var currentValue = parseInt($(this).html());
        var newValue = 0;
        if (currentValue == 0) {
            newValue = 5;
        } else if (currentValue == 5) {
            newValue = 15;
        } else if (currentValue == 15) {
            newValue = 30;
        } else if (currentValue == 30) {
            newValue = 60;
        } else {
            newValue = 0;
        }

        $(this).html(newValue);
        applyEntryFilters();
    });

    // click handlers for panel toggle buttons in menubar
    $('#timelineToggler').click(function () { $('#timeline_col').toggleClass('forceOpen'); $('#details_col').removeClass('forceOpen'); });
    $('#detailsToggler').click(function () { $('#details_col').toggleClass('forceOpen'); $('#timeline_col').removeClass('forceOpen'); });

    // hide side panels if mouse leaves them
    $('#entries_col').mouseenter(function () { $('#details_col, #timeline_col').removeClass('forceOpen'); })
    $('#entries_col').click(function () { $('#details_col, #timeline_col').removeClass('forceOpen'); })
    
    // click handler for edit-icon of waypoints
    $('#entries').on('click', '.waypointEditButton', function (element) {
        var dbObject = $(this).closest('.logbookEntry').data('waypointData');  // waypoint instance from DB
        if(dbObject.image_thumb != null) {                       
            dbObject.image = "/api/photo/" + dbObject._id + "/waypoint.jpg";
        } else {
        	dbObject.image = "/assets/images/no_image.png";
        }
        $('#waypointInputForm').html(waypointEditorTemplate(dbObject));
        $('#waypointInputForm').data('waypointObj', dbObject);
        $('#waypointEditorPopup').modal();
        $( "#tabs" ).tabs();
    });
    // click handler for postback of an edited waypoint
    $('#waypointInputForm').submit(postModifiedWaypoint);
};

/**
 * changes the currently displayed trip to another one
 * @param tripId - UUID of the trip
 */
function changeTripTo(tripId) {
    if (tripId && tripId.length > 0) {
        $('#entries').html(ajaxLoaderTemplate({ loaderId: 'tripLoader' }));
        $('#timeline').append(ajaxLoaderTemplate({ loaderId: 'tripLoaderTimeline' }));
        $('#details_map').append(ajaxLoaderTemplate({ loaderId: 'tripLoaderMap' }));
        $('#details_trip_weather_stats_content').hide();

        $('.NextPrevTripButton').hide();
        $('#entries').html(ajaxLoaderTemplate({ loaderId: 'tripLoader' }));
        logbook.getTripData(tripId, onReceivedTrip);
    }
}

/**
 * Initialises the waypoint entries.
 * Adds the function 'callback' as a handler when the users scrolls to the 'item'
 * @param item - waypoint entry, that triggers the callback
 * @param callback - function that should be called if the user scrolled to the item
 * @param last_entry_node - previous waypoint entry
 */
function initWaypoint(item, callback, last_entry_node) {
    var offset_up = 10;
    var offset_down = parseInt($('#menu_bar').css("height")) + parseInt($(last_entry_node).css('height')) ;

    if($(last_entry_node ).hasClass("tripHeader")){
        offset_down/=2;
    }

    item.waypoint(function (direction) {
        if (direction == "down") {
            callback(item);
        }
    }, { offset: offset_down });

    item.waypoint(function (direction) {
        if (direction == "up") {
            callback(item);
        }
    }, { offset: offset_up });
}

/**
 * Gets called if the previous trip has been loaded.
 * (callbacks from getTripsOfBoat())
 * @param trips
 */
function onReceivedPreviousTrip(trips) {
    // enables or disables the "Load previous Trip" button depending on whether the currently loaded trip has a predecessor or not.
    if (trips.length > 0) {
        $('#prevTripName').html(trips[0].name);
        $('#btnLoadPreviousTrip').attr('data-trip', trips[0]._id).css('display', 'block');
        var scrollOffset = $('.tripHeader').offset().top - $('#entries_col').css("margin-top").replace("px", "");
        //alert(scrollOffset);
        $('html,body').prop('scrollTop', scrollOffset);
        //$('.tripHeader')[0].scrollIntoView(true);
    } else {
        $('#btnLoadPreviousTrip').attr('data-trip', '').hide();
    }
}

/**
 * Gets called if the next trip has been loaded.
 * (callbacks from getTripsOfBoat())
 * @param trips
 */
function onReceivedNextTrip(trips) {
    //enables or disables the "Load next Trip" button depending on
    // whether the currently loaded trip has a successor or not.
    if (trips.length > 0) {
        $('#nextTripName').html(trips[0].name);
        $('#btnLoadNextTrip').attr('data-trip', trips[0]._id).css('display', 'block');
    } else {
        $('#btnLoadNextTrip').attr('data-trip', '').hide();
    }
}

/**
 * Gets called if all trips have been loaded.
 * (callback of logbook.getAllTripsOfBoat())
 * @param trips
 */
function onReceivedAllTrips(trips) {
    // Populate the inital timeline
    var timelineContainer = $('.timeline_header');
    $.each(trips, function (index, tripData) {
        tripData.startDate = moment(new Date(tripData.startDate)).format(dateFormatShort);
        timelineContainer.append(timelineTripTemplate(tripData));
    });
}

/**
 * Gets called if the trip has been loaded.
 * (callback of getTripData())
 * @param tripId - UUID of the trip
 * @param tripData - Trip data
 */
function onReceivedTrip(tripId, tripData) {
    // prepare formatted datetime strings (required in handlebars templates)
    tripData.formattedStartDate = moment(new Date(tripData.startDate)).format(dateFormatShort + " " + timeFormat);
    tripData.formattedEndDate = moment(new Date(tripData.endDate)).format(dateFormatShort + " " + timeFormat);

    // hide the loading animations
    $('#tripLoader').remove();
    $('#tripLoaderTimeline').remove();
    $('#tripLoaderMap').remove();

    // create the container for this trip
    $('#entries').append(tripTemplate(tripData));

    var trip_header = $('#trip_header_' + tripId);
    initWaypoint(trip_header, onScrolledToTripHeader, trip_header); // add scrolled-to handler
    trip_header.data("tripData", tripData);  // store the DB object in this DOM element

    // lookup previous and next trip
    logbook.getTripsOfBoat(boatId, tripData.startDate, 1, 1, 'true', onReceivedPreviousTrip);  // previous
    logbook.getTripsOfBoat(boatId, tripData.startDate, 1, 1, 'false', onReceivedNextTrip);  // next

    // get the waypoints of this trip
    loadMoreEntries(tripId, 0);  // 0 = all waypoints
}

/**
 * Gets called if waypoints have been loaded.
 * (callback of getTripWaypoints())
 * @param tripId - UUID of the trip that matches to the waypoints
 * @param waypoints - all waypoints of the trip
 */
function onReceivedWaypoints(tripId, waypoints) {
    var tripContainer = $('#trip_' + tripId);
    var timelineTripContainer = $('#timeline-trip_container_' + tripId);
    var trip_header = $('#trip_header_' + tripId);

    var tripData = trip_header.data("tripData");
    var speed_title = 'Speed - ' + tripData.name;
    var speed_description = tripData.from + " to " + tripData.to
    var waypoint_names = [];
    var waypoint_ids = [];
    var speed_data_y = [];
    var index_data_x = [];
    var air_pressure_data_y = [];
    var cloudage_data_y = [];
    var temperature_data_y = [];

    //N, NNO, NO, .... -->  16 keys
    var wind_data_map = {0:0, 1:0, 2:0, 3:0, 4:0, 5:0, 6:0, 7:0, 8:0, 9:0, 10:0, 11:0, 12:0, 13:0, 14:0, 15:0};
    var wave_data_map = {0:0, 1:0, 2:0, 3:0, 4:0, 5:0, 6:0, 7:0, 8:0, 9:0, 10:0, 11:0, 12:0, 13:0, 14:0, 15:0};
    var degree_step = 22.5; // 360:16

    var minTemp = 1000;
    var maxTemp = -1000;

    var last_entry_node = trip_header;

    // hide ajax loader in this trip container
    $('#entryLoader' + tripId).remove();

    tripData.formattedDate = moment(new Date(tripData.startDate)).format(dateFormatShort);
    timelineTripContainer.append(timelineTripHeaderTemplate(tripData));

    var map_waypoints = [];

    // iterate all received waypoints and append the template to the container of the trip & the timelime
    $.each(waypoints, function (index, waypointData) {
        // unix timestamp -> formatted time
        waypointData.formattedDate = moment(new Date(waypointData.date)).format(dateFormatShort);
        waypointData.formattedTime = moment(new Date(waypointData.date)).format(timeFormat);
        minTemp = (waypointData.tempCelsius < minTemp) ? waypointData.tempCelsius : minTemp;
        maxTemp = (waypointData.tempCelsius > maxTemp) ? waypointData.tempCelsius : maxTemp;
        // append to trip in timeline panel
        timelineTripContainer.append(timelineWaypointTemplate(waypointData));

        // append to trip in entries panel
        tripContainer.append(waypointTemplate(waypointData));
        var entryNode = $('#waypoint_' + waypointData._id);
        entryNode.data('waypointData', waypointData);
        initWaypoint(entryNode, onScrolledToWaypoint, last_entry_node);

        last_entry_node = entryNode;
        index_data_x.push(index + 1);
        speed_data_y.push(parseFloat(waypointData.sog));
        air_pressure_data_y.push(parseFloat(waypointData.atmosPressure));
        cloudage_data_y.push(parseFloat(waypointData.cloudage));
        temperature_data_y.push(parseFloat(waypointData.tempCelsius));
        waypoint_names.push(waypointData.name);
        waypoint_ids.push(waypointData._id);

        compassOrderdInsert(wind_data_map, degree_step, waypointData.windDirection, waypointData.windSpeedBeaufort);
        compassOrderdInsert(wave_data_map, degree_step, waypointData.windDirection, waypointData.wavesHeight);

        map_waypoints[index] = new google.maps.LatLng(waypointData.lat, waypointData.lng);
    });

    initialize_waypoints(map_waypoints);

    // add handler for click on a waypoint marker in the map (scroll to waypoint position in entries view)
    setMarkerClickFunction(clicked_on_marker);

    // click handler for the waypoints
    $('.logbookEntry').click(function (e) {
        if ($(e.target).is('img')) {
            e.preventDefault();
            return;
        }
        scrollToWaypoint($(this));
    });

    // set trip weather stats if available
    if (minTemp != 1000) {
        $('#tripMinTemp').html(Math.round(minTemp));
        $('#tripMaxTemp').html(Math.round(maxTemp));
        $('#details_trip_weather_stats_content').show();
    }

    var wind_data = [];
    var wave_data = [];
    mapToArray(wind_data_map, wind_data);
    mapToArray(wave_data_map, wave_data);

    // charts are not initialised here because the div they're going to be rendered in needs to be visible. (if user reloads page and tripHeader is not active)
    trip_header.data('wind_data', wind_data);
    trip_header.data('wave_data', wave_data);
    trip_header.data('index_data_x', index_data_x);
    trip_header.data('speed_data_y', speed_data_y);
    trip_header.data('waypoint_names', waypoint_names);
    trip_header.data('waypoint_ids', waypoint_ids);
    trip_header.data('speed_title', speed_title);
    trip_header.data('speed_description', speed_description);
    trip_header.data('air_pressure_data_y', air_pressure_data_y);
    trip_header.data('cloudage_data_y', cloudage_data_y);
    trip_header.data('temperature_data_y', temperature_data_y);

    if(trip_header.isOnScreen()) {
        initialiseDistributionCharts ( trip_header ) ;
    }

    // refresh waypoint handlers to new positions of elements
    window.setTimeout(function () { $.waypoints('refresh'); }, 200);

    isLoadingWaypoints = false;
}

/**
 * insert values in a map object.The keys represent the compass directions (here 16 keys à 22.5 degrees)
 * @param map - map the values should be inserted to
 * @param degree_step - degrees that should be represented by one key
 * @param degree - actual degree
 * @param value - value that should be inserted at the degree's key
 */
function compassOrderdInsert(map, degree_step, degree, value){
    var key = Math.floor(degree/degree_step);

    if(!(key in map) || map[key] < value){
        map[ key ] = value ;
    }
}

/**
 * pushes all values of a map into an array
 * @param map - map containing the values
 * @param array - array, the values should be pushed to
 */
function mapToArray(map, array){
    for (var key in map) {
        array.push(map[key]);
    }
}

/**
 * Loads or appends waypoint entries to a trip
 * @param tripId - UUID of the trip
 * @param count - amount of entries that should be loaded
 */
function loadMoreEntries(tripId, count) {
    if (isLoadingWaypoints) {
        return;
    }

    isLoadingWaypoints = true;
    var tripContainer = $('#trip_' + tripId);
    var loadedEntriesCount = tripContainer.children('.logbookEntry').length;

    // remove "load more" button
    tripContainer.children('.loadMoreSection').remove();
    // show loader for entries:
    tripContainer.append(ajaxLoaderTemplate({ loaderId: 'entryLoader' + tripId }));

    // get the next waypoints of this trip
    logbook.getTripWaypoints(tripId, loadedEntriesCount, count, onReceivedWaypoints);
}

/**
 * Gets called when the user scrolled to a waypoint
 * @param node - waypoint entry
 */
function onScrolledToWaypoint(node) {
    $('.logbookEntry').removeClass("active");
    node.addClass("active");

    // change details
    var waypointData = node.data('waypointData');
    if (typeof (waypointData) != "undefined") {
        var coordHelper = new coordinateHelpers();

        waypointData.latRounded = coordHelper.getLatAsString(waypointData.lat);
        waypointData.lngRounded = coordHelper.getLngAsString(waypointData.lng);
    }
    $('#details_text').html(entryDetailsTemplate(waypointData));

    if (typeof (scrollToWaypointTimeout) != undefined) {
        clearTimeout(scrollToWaypointTimeout);
    }

    scrollToWaypointTimeout = setTimeout(function () {
        // gets called if the user stayed on a waypoint for more than 500ms

        hideDistributionCharts();
        showCharts();
        initialiseCharts();

        // mark waypoint in Map
        if (typeof (map) != "undefined") {
            highlight_waypoint(new google.maps.LatLng(waypointData.lat, waypointData.lng));
        }

        if (typeof (window.sogChart) != "undefined") {     
        	hideShowOneChartById('speedometer_sog', waypointData.sog);   	
        	// change point
            var point = window.sogChart.series[0].points[0];
            var newVal = waypointData.sog.substr(0, waypointData.sog.lastIndexOf(' '));
            point.update(parseFloat(newVal));
            window.sogChart.redraw();
        }

        if (typeof (window.cogChart) != "undefined") {
        	hideShowOneChartById('compass_cog', waypointData.cog);
        	// change point
            var pointB = window.cogChart.series[0].points[0];
            var newValH = parseFloat(waypointData.cog.substr(0, waypointData.cog.length -1));
            var newValB = newValH - 180;
            if (newValB < 0) {
                newValB = 360 + newValB;
            }
            pointB.update(newValB);
            window.cogChart.redraw();
        }

        if (typeof (window.windCompassChart) != "undefined") {
			hideShowOneChartById('wind_compass', waypointData.windDirection, waypointData.windSpeedBeaufort);
			
            // change point
            if (typeof (waypointData.windDirection) != "undefined") {
                var windDirPoint = window.windCompassChart.series[0].points[0];
                var newDir = waypointData.windDirection - 180;
                if (newDir < 0) {
                    newDir = 360 + newVal;
                }
                windDirPoint.update(newDir);
            }

            // change yAxis title
            if (typeof (waypointData.windSpeedBeaufort) != "undefined") {
                $('#windCompassTitle').html(waypointData.windSpeedBeaufort.toFixed(2));
            } else {
                $('#windCompassTitle').html('');
            }

            window.windCompassChart.redraw();
        }

        if (typeof (window.waveCompassChart) != "undefined") {
        	hideShowOneChartById('wave_compass', waypointData.windDirection, waypointData.wavesHeight);
        	
            // change point
            if (typeof (waypointData.windDirection) != "undefined") {
                var waveDirPoint = window.waveCompassChart.series[0].points[0];
                var newWaveDir = waypointData.windDirection - 180;
                if (newWaveDir < 0) {
                    newWaveDir = 360 + newWaveDir;
                }
                waveDirPoint.update(newWaveDir);
            }

            // change yAxis title
            if (typeof (waypointData.wavesHeight) != "undefined") {
                $('#waveCompassTitle').html(waypointData.wavesHeight.toFixed(2));
            } else {
                $('#waveCompassTitle').html('');
            }
            window.waveCompassChart.redraw();
        }

        if (typeof (window.airPressureChart) != "undefined") {
        	hideShowOneChartById('air_pressure', waypointData.atmosPressure);
        	
            // change point
            var airPressPoint = window.airPressureChart.series[0].points[0];
            var newPressure = parseFloat(waypointData.atmosPressure);
            airPressPoint.update(newPressure);

            window.airPressureChart.redraw();
        }

        if (typeof (window.cloudsChart) != "undefined") {
        	hideShowOneChartById('clouds', waypointData.cloudage);
        	
            // change point
            var cloudPoint = window.cloudsChart.series[0].points[0];
            var newCloud = parseFloat(waypointData.cloudage);
            cloudPoint.update(newCloud);

            window.cloudsChart.redraw();
        }

        if (typeof (window.temperatureChart) != "undefined") {
        	hideShowOneChartById('temperature', waypointData.tempCelsius);
        	
            // change point
            var tempPoint = window.temperatureChart.series[0].points[0];
            var newTemp = parseFloat(waypointData.tempCelsius);
            tempPoint.update(newTemp);

            window.temperatureChart.redraw();
        }


    }, 500);
}

/**
 * Gets called if the trip header is active
 * @param node - tripHeader entry
 */
function onScrolledToTripHeader(node) {
    if (typeof (scrollToWaypointTimeout) != undefined) {
        clearTimeout(scrollToWaypointTimeout);
    }
    $('.logbookEntry').removeClass("active");

    $('#details_text').html("");
    //zoom out map
    reset_map_zoom();

    showDistributionCharts();
    hideCharts();

    if(typeof node.data('index_data_x') != 'undefined') {
        initialiseDistributionCharts(node);
    }
}

/**
 * Inits the charts which show the waypoint specific data.
 */
function initialiseCharts(){
    //only call init once if there's no html content inside the matching div and if the div is visible
    if( ($.trim($('#speedometer_sog' ).text()) == '' && ($('#details_info' ).css('display') == 'block') )){
        initSOGSpeedometer('speedometer_sog');
    }
    if($.trim($('#compass_cog' ).text()) == '' && ($('#details_info' ).css('display') == 'block') ){
        initCOGCompass('compass_cog');
    }
    if($.trim($('#wind_compass' ).text()) == '' && ($('#details_weather' ).css('display') == 'block') ){
        initWindCompassChart('wind_compass');
    }
    if($.trim($('#wave_compass').text()) == '' && ($('#details_weather' ).css('display') == 'block') ){
        initWaveCompassChart('wave_compass');
    }
    if($.trim($('#air_pressure' ).text()) == '' && ($('#details_weather' ).css('display') == 'block') ){
        initAirPressureChart('air_pressure');
    }
    if($.trim($('#clouds' ).text()) == '' && ($('#details_weather' ).css('display') == 'block') ){
        initCloudsChart('clouds');
    }
    if($.trim($('#temperature' ).text()) == '' && ($('#details_weather' ).css('display') == 'block') ){
        initTemperatureChart('temperature');
    }
}

/**
 * Inits the charts which show the overview of the whole trip.
 */
function initialiseDistributionCharts(tripData){
    // load speed table
    if ( $.trim ( $ ( '#details_charts_distribution' ).text() ) == '' && ($('#details_info' ).css('display') == 'block') ) {
        initSpeedChart ( $ ( '#details_charts_distribution' ), tripData.data ( 'index_data_x' ), tripData.data ( 'speed_data_y' ), tripData.data ( 'waypoint_names' ), tripData.data ( 'waypoint_ids' ), tripData.data ( 'speed_title' ), tripData.data ( 'speed_description' ) ) ;
    }
    // load wind table
    if ( $.trim ( $ ( '#wind_distribution' ).text() ) == '' && ($('#details_weather' ).css('display') == 'block') ) {
        initWindDirSpeedChart ( 'wind_distribution', tripData.data ( 'wind_data' )) ;
    }
    // load wind table
    if ( $.trim ( $ ( '#wave_distribution' ).text() ) == '' && ($('#details_weather' ).css('display') == 'block') ) {
        initWaveDirHeightChart ( 'wave_distribution', tripData.data ( 'wave_data' ) ) ;
    }
    // load air pressure/clouding/temperature table
    if ( $.trim ( $ ( '#air_pressure_cloudage_temperature_distribution' ).text() ) == '' && ($('#details_weather' ).css('display') == 'block') ) {
        initAirPressureCloudingTemperatureChart ( '#air_pressure_cloudage_temperature_distribution', tripData.data ( 'index_data_x' ), tripData.data ( 'air_pressure_data_y' ), tripData.data ( 'cloudage_data_y' ), tripData.data ( 'temperature_data_y' ), tripData.data ( 'waypoint_ids' ) ) ;
    }
}

/**
 * Shows or hides waypoints based on the current filter settings
 */
function applyEntryFilters() {
    var onlyImages = $('#chkOnlyWithImage').hasClass('active');
    var onlyNotes = $('#chkOnlyWithNote').hasClass('active');
    var minTimePeriod = parseInt($('#timeOffsetToggler').html()) * 60 * 1000;   // min to msec
    var lastTimestamp = -1;

    // iterate over all waypoints in entry view & timeline
    $('.logbookEntry').each(function (index, value) {
        var item = $(value);  // waypoint entry in entries view
        var waypointData = item.data('waypointData'); // DB object
        var timelineItem = $('#timeline-wp-container_' + waypointData._id);  // corresponding entry in timeline

        // skip item if not at least [minTimePeriod] minutes between this and the last item
        if (minTimePeriod > 0 && lastTimestamp > (parseInt(waypointData.date) - minTimePeriod)) {
            item.addClass('filtered');
            timelineItem.addClass('filtered');
            return;
        }
        lastTimestamp = parseInt(waypointData.date);

        if ((onlyImages && !$(item).hasClass('hasImage')) && (!onlyNotes || (onlyNotes && !$(item).hasClass('hasNote'))) ) {
            item.addClass('filtered');
            timelineItem.addClass('filtered');
        }else if ((onlyNotes && !$(item).hasClass('hasNote')) && (!onlyImages || (onlyImages && !$(item).hasClass('hasImage'))) ) {
            item.addClass('filtered');
            timelineItem.addClass('filtered');
        } else { // show item
            item.removeClass('filtered');
            timelineItem.removeClass('filtered');
        }

    });
    // refresh waypoint handlers to new positions of elements
    window.setTimeout(function () { $.waypoints('refresh'); }, 750);
}

/**
 * callback of waypoint.js (invoked when the user scrolls to a logbook entry or trip header)
 */
function scrollToWaypoint(waypoint) {
    $('.logbookEntry').waypoint('disable');
    var offset = $(waypoint).offset().top - parseInt($('#menu_bar').css('height')) -1;
    $('html, body').animate({
        scrollTop: offset
    }, {
        done: function () {
            if(waypoint.hasClass("TripHeader")){
                onScrolledToTripHeader(waypoint);
            }else if(waypoint.hasClass("logbookEntry")) {
                onScrolledToWaypoint ( waypoint ) ;
            }
            $('.logbookEntry').waypoint('enable');
        }
    }, 'slow');
}

/**
 * click handler for the markers on the map
 */
function clicked_on_marker(marker) {
    var lat = marker.getPosition().lat();
    var lng = marker.getPosition().lng();
    var waypoint = getWaypointFromPosition(lat, lng);
    if (typeof (waypoint) != "undefind") {
        scrollToWaypoint(waypoint);
    }
}

/**
 *  This method returns a waypoint depending on the lat lng
 */
function getWaypointFromPosition(lat, lng) {
    var waypoint;

    //hotfix: the longitude differs for some strange reasons... only after the 9th digit.
    //(object received with getTripData have different longitudes as objects received with getTripWaypoints?!)
    lng = lng.toFixed(9);
    $.each($(".logbookEntry"), function () {
        var waypointData = $(this).data().waypointData;
        var match = (waypointData.lat == lat) && (waypointData.lng.toFixed(9) == lng);
        //console.log("lat: "+waypointData.lat+" lng: "+waypointData.lng);
        //console.log(match);
        if (match) {
            waypoint = $(this);
            return false;
        }
    });
    return waypoint;
}

/**
 * Called when the waypoint editor form is submitted.
 */
function postModifiedWaypoint(e) {
    var form = $(this);
    var baseObject = form.data('waypointObj');
    var boundData = Handlebars.getBoundData(baseObject, '#waypointInputForm');
    $.ajax(form.attr('action'), { data: JSON.stringify(boundData), contentType: 'application/json', type: 'POST' })
        .success(function (data) {
            alert('updated:' + data);
        })
        .fail(function () {
            alert('ufailount');
        })
    $('#waypointEditorPopup').modal('hide');
    e.preventDefault();
    return false;
}

/**
 *  This method hides the Distribution charts
 */
function hideDistributionCharts() {
    $('#details_charts_distribution').css("display", "none");
    $('#details_weather_charts_distribution').css("display", "none");
    $('#details_trip_weather_stats').css("display", "none");
}

/**
 *  This method shows the Distribution charts
 */
function showDistributionCharts() {
    $('#details_charts_distribution').css("display", "block");
    $('#details_weather_charts_distribution').css("display", "block");
    $('#details_trip_weather_stats').css("display", "block");
}

/**
 *  This method shows the Normal Charts for details
 */
function showCharts(wayPoint) {
    $('#details_charts').css("display", "block");
    $('#details_weather_charts').css("display", "block");
    
    // hide charts with no data
}

/**
 *  This method hides the Normal Charts for details
 */
function hideCharts() {
    $('#details_charts').css("display", "none");
    $('#details_weather_charts').css("display", "none");
}


/**
 * Hides / shows the Chart if data is available
 * @param htmlId - chart id
 * @param data1 - chart value
 * @param data2 - chart value
 */
function hideShowOneChartById(htmlId, data1, data2) {
	// hide chart if there is no data	
	if (typeof (data1) == "undefined" && typeof (data2) == "undefined") {
		$('#'+ htmlId).css("display","none");
	} else {
		$('#'+ htmlId).css("display","inline");
	}
}

/**
 *  returns true if the element is in the viewport
 */
$.fn.isOnScreen = function(){
    var win = $(window);

    var viewport = {
        top : win.scrollTop(),
        left : win.scrollLeft()
    };
    viewport.right = viewport.left + win.width();
    viewport.bottom = viewport.top + win.height();

    var bounds = this.offset();
    bounds.right = bounds.left + this.outerWidth();
    bounds.bottom = bounds.top + this.outerHeight();

    return (!(viewport.right < bounds.left || viewport.left > bounds.right || viewport.bottom < bounds.top || viewport.top > bounds.bottom));
};
