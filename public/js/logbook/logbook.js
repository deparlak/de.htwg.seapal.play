function getTripPhotos(tripId, startIndex, count, callback) {
	$.getJSON('logbook/tripPhotos/' + tripId + '/' + startIndex + '/' + count)
	.done(function (result) {
		callback(tripId, result);
	});
}
