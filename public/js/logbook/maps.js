var bounds;
var markers = [];
var mark_connections;

function initialize_waypoints(map_waypoints) {
    clear_overlays();

    bounds = new google.maps.LatLngBounds();
    for (var i = 0; i < map_waypoints.length; i++) {
        bounds.extend(map_waypoints[i]);
    }

    map.panTo(bounds.getCenter());
    map.fitBounds(bounds);

    //drawing waypoints
    var circle = {
        path: google.maps.SymbolPath.CIRCLE,
        scale: 4,
        strokeColor: '#17bb00',
        strokeWeight:5
    };

    for (i = 0; i < map_waypoints.length; ++i) {
        //console.log(map_waypoints[i]);
        var marker = new google.maps.Marker({
            position: map_waypoints[i],
            icon: circle
        });
        markers.push(marker);
        marker.setMap(map);
    }

    //connecting waypoints
    mark_connections = new google.maps.Polyline({
        path: map_waypoints,
        strokeColor: '#17bb00'
    });

    mark_connections.setMap(map);
}

function clear_overlays() {
    for (var i = 0; i < markers.length; i++ ) {
        markers[i].setMap(null);
    }
    markers.length = 0;
    if (typeof(mark_connections) != "undefined"){
        mark_connections.setMap(null);
    }
}

function highlight_waypoint(lat_lng){
    //console.log(lat_lng);
    map.panTo(lat_lng);
    map.setZoom(13);
}

function reset_map_zoom(){
    if(typeof(bounds) != "undefined"){
        map.panTo(bounds.getCenter());
        map.fitBounds(bounds);
    }
}

function setMarkerClickFunction(click_function){
    for (var i = 0; i < markers.length; i++ ) {
        addListener(markers[i], click_function);
    }
}

function addListener(marker, click_function){
    google.maps.event.addListener(marker, 'click', function(){
        click_function(marker);
    });
}
