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
    var marker_image = {
        url: '/assets/images/ann_route.png',
        size: new google.maps.Size(36, 36),
        origin: new google.maps.Point(0,0),
        anchor: new google.maps.Point(6, 34)
    };

    for (i = 0; i < map_waypoints.length; ++i) {
        //console.log(map_waypoints[i]);
        var marker = new google.maps.Marker({
            position: map_waypoints[i],
            icon: marker_image
        });
        markers.push(marker);
        marker.setMap(map);
    }

    //connecting waypoints
    mark_connections = new google.maps.Polyline({
        path: map_waypoints,
        strokeColor: '#FF0000'
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
    map.panTo(bounds.getCenter());
    map.fitBounds(bounds);
}