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
logbook.getTripPhotos = function (tripId, startIndex, count, callback) {
    $.getJSON('/logbook/tripPhotos/' + tripId + '/' + startIndex + '/' + count)
	.done(function (result) {
	    callback(tripId, result);
	})
	.fail(handleAjaxError);
};

/**
 * Returns the URL to the full-size picture of the specified waypoint.
 */
logbook.getPhotoOfWaypoint = function (waypointId) {
    return '/api/photo/' + waypointId + '/waypoint.jpg';
};

/**
 * Gets a trip object from the database and passes it to a
 * callback function of the form f(tripId, tripData).
 */
logbook.getTripData = function (tripId, callback) {
    $.getJSON('/logbook/tripData/' + tripId)
	.done(function (result) {
	    callback(tripId, result);
	})
	.fail(handleAjaxError);
};

/**
 * Gets a range of waypoint objects of a trip.
 * Passes the used trip ID and the waypoint array to a callback function f(tripId, waypoints).
 */
logbook.getTripWaypoints = function (tripId, startIndex, count, callback) {
    $.getJSON('/logbook/tripWaypoints/' + tripId + '/' + startIndex + '/' + count)
	.done(function (result) {
	    callback(tripId, result);
	})
	.fail(handleAjaxError);
};

/**
 * Gets a waypoint object from the database and passes it
 * to a callback function f(waypointId, waypointData).
 */
logbook.getWaypointData = function (waypointId, callback) {
    $.getJSON('/api/waypoint/' + waypointId)
	.done(function (result) {
	    callback(waypointId, result);
	})
	.fail(handleAjaxError);
};

/**
* Gets a set of trips of a boat ordered by the startDate (timestamp)
* and passes it to a callback function f(trips)
*/
logbook.getTripsOfBoat = function (boat, startDate, skip, count, descending, callback) {
    var desc = 'false';
    if (descending && descending == 'true') {
        desc = 'true';
    }
    $.getJSON('/logbook/getTrips/' + boat + '/' + startDate + '/' + skip + '/' + count + '/' + desc)
    .done(function (result) {
        callback(result);
    })
    .fail(handleAjaxError);
}

/**
* Gets all trips of the specified boat. Note that not all attributes are initialized.
* Passes the result to a callback function f(trips)
*/
logbook.getAllTripsOfBoat = function (boat, callback) {
    $.getJSON('/logbook/allTrips/' + boat)
        .done(function (result) {
            callback(result);
        })
        .fail(handleAjaxError);
}

/**
* Gets the metadata (name, date) of all waypoints of a trip
* and passes the result to a callback function f(tripId, waypoints)
*/
logbook.getAllWaypointsOfTrip = function (tripId, callback) {
    $.getJSON('/logbook/tripWaypoints/' + tripId + '/all')
        .done(function (result) {
            callback(tripId, result);
        })
        .fail(handleAjaxError);
}

/**
* Takes a callback function which gets invoked when the user tries to access restricted objects.
*/
logbook.onForbidden = null;  // dummy to be replaced by user

/**
 * Internal AJAX error handler
 */
function handleAjaxError(jqXHR, textStatus, errorThrown) {
    if (jqXHR.status == 403 && logbook.onForbidden != null) {   // forbidden
        logbook.onForbidden();
        return;
    }
    window.alert(jqXHR.responseText + ' (' + errorThrown + ').');
}