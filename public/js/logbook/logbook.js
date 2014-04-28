/**
 * Connector object to the logbook API.
 * @author Lukas
 */

var logbook = {};
var ajaxErrorMsg = "Error loading data!";

/**
 * Gets a range of pictures of a trip.
 * Passes the specified tripId and an array 'pictures' of (waypointId, thumbPicture) objects
 * to a callback function of the form f(tripId, pictures).
 * thumbPicture can be assigned as src of <img> tags directly.
 */	
logbook.getTripPhotos = function(tripId, startIndex, count, callback) {
	$.getJSON('logbook/tripPhotos/' + tripId + '/' + startIndex + '/' + count)
	.done(function (result) {
		callback(tripId, result);
	})
	.fail(function () { window.alert(ajaxErrorMsg);	});
};

/**
 * Returns the URL to the full-size picture of the specified waypoint.
 */
logbook.getPhotoOfWaypoint = function(waypointId) {
	return 'api/photo/' + waypointId + '/waypoint.jpg';
};

/**
 * Gets a trip object from the database and passes it to a
 * callback function of the form f(tripId, tripData).
 */
logbook.getTripData = function(tripId, callback) {
	$.getJSON('api/trip/' + tripId)
	.done(function (result) {
		callback(tripId, result);
	})
	.fail(function () { window.alert(ajaxErrorMsg);	});
};

/**
 * Gets a range of waypoint objects of a trip.
 * Passes the used trip ID and the waypoint array to a callback function f(tripId, waypoints).
 */
logbook.getTripWaypoints = function(tripId, startIndex, count, callback) {
	$.getJSON('logbook/tripWaypoints/' + tripId + '/' + startIndex + '/' + count)
	.done(function (result) {
		callback(tripId, result);
	})
	.fail(function () { window.alert(ajaxErrorMsg);	});
};

/**
 * Gets a waypoint object from the database and passes it
 * to a callback function f(waypointId, waypointData).
 */
logbook.getWaypointData = function(waypointId, callback) {
	$.getJSON('api/waypoint/' + waypointId)
	.done(function (result) {
		callback(waypointId, result);
	})
	.fail(function () { window.alert(ajaxErrorMsg);	});
};