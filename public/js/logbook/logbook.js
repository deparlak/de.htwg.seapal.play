/**
 * Get a range of pictures of a trip.
 * Returns an array of (waypointId, thumbPicture) objects
 * where thumbPicture can be assigned as src of <img> tags directly.
 */	
function getTripPhotos(tripId, startIndex, count, callback) {
	$.getJSON('logbook/tripPhotos/' + tripId + '/' + startIndex + '/' + count)
	.done(function (result) {
		callback(tripId, result);
	});
}

/**
 * Returns the URL to the full-size picture of the specified waypoint.
 */
function getPhotoOfWaypoint(waypointId) {
	return 'api/photo/' + waypointId + '/waypoint.jpg';
}
