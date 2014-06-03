package de.htwg.seapal.web.controllers;

import java.io.InputStream;
import java.util.List;
import java.util.UUID;

import play.libs.Json;
import play.mvc.Controller;
import play.mvc.Result;

import com.google.inject.Inject;

import de.htwg.seapal.SeapalGlobal;
import de.htwg.seapal.controller.IAccountController;
import de.htwg.seapal.controller.IMainController;
import de.htwg.seapal.database.impl.TripDatabase;
import de.htwg.seapal.database.impl.WaypointDatabase;
import de.htwg.seapal.model.IModel;
import de.htwg.seapal.model.ITrip;
import de.htwg.seapal.web.models.Logbook;
import de.htwg.seapal.web.views.html.logbook;

/**
 * Handles http requests to /LogbookAPI
 * @author Lukas
 *
 */
public class LogbookAPI extends Controller {

	private static final String AccessDeniedMsg = "You are not allowed to access this trip.";

	@Inject
	private IMainController mainController;

	@Inject
	private IAccountController accountController;


	@play.mvc.Security.Authenticated(AccountAPI.Secured.class)
	public Result index(UUID tripId) {
		String userId = session(IAccountController.AUTHN_COOKIE_KEY);
		return ok(logbook.render(new Logbook(tripId.toString())));
	}

	@play.mvc.Security.Authenticated(AccountAPI.SecuredAPI.class)
	public Result getTripById(UUID tripId) {
		TripDatabase db = SeapalGlobal.getInjector().getInstance(TripDatabase.class);
		ITrip trip = db.get(tripId);

		if (trip == null)
			return notFound();

		// check access rights
		String userId = session(IAccountController.AUTHN_COOKIE_KEY);
		if (!canAccess(trip.getAccount())) {
			return forbidden(AccessDeniedMsg);
		}

		return ok(Json.toJson(trip));
	}

	/**
	 * Gets all waypoints of a trip which have a picture assigned.
	 * Returns a list of JSON objects of the form {waypointId, thumbImage}.
	 * thumbImage is of the form "data:image/jpg;base64,[binaryData]" for direct use as src of image tags.
	 * @param startIndex Number of entries to skip before returning the values.
	 */
	@play.mvc.Security.Authenticated(AccountAPI.SecuredAPI.class)
	public Result getPhotosOfTrip(UUID tripId, int startIndex, int count) {
		if (!canAccessTrip(tripId)) {
			return forbidden(AccessDeniedMsg);
		}

		WaypointDatabase db = SeapalGlobal.getInjector().getInstance(WaypointDatabase.class);
		return ok(Json.toJson(db.getPhotosByTripId(tripId, startIndex, count)));
	}

	/**
	 * Gets the waypoints objects of a trip.
	 * @param startIndex Number of entries to skip before returning the values.
	 * @param count Specify 0 to reveive all items.
	 */
	@play.mvc.Security.Authenticated(AccountAPI.SecuredAPI.class)
	public Result getWaypointsOfTrip(UUID tripId, int startIndex, int count) {
		if (!canAccessTrip(tripId)) {
			return forbidden(AccessDeniedMsg);
		}
		
		WaypointDatabase db = SeapalGlobal.getInjector().getInstance(WaypointDatabase.class);
		return ok(Json.toJson(db.getWaypointsByTripId(tripId, startIndex, count)));
	}


	/**
	 * Returns a set of trip objects for a boat ordered by the startDate.
	 * @param skip Number of items to skip before returning the results
	 */
	@play.mvc.Security.Authenticated(AccountAPI.SecuredAPI.class)
	public Result getTrips(UUID boat, long startDate, int skip, int count, String desc) {
		// first check if user has access to trip of this boat
		if (!canAccessBoat(boat)) {
			return forbidden(AccessDeniedMsg);
		}
		
		TripDatabase tripsDb = SeapalGlobal.getInjector().getInstance(TripDatabase.class);
		List<? extends ITrip> result = tripsDb.getTrips(boat.toString(), startDate, skip, count, "true".equals(desc));

		return ok(Json.toJson(result));
	}

	/**
	 * Returns all trips of the specified boat.
	 * Note that only the properties name, startDate, from and to are initialized.
	 */
	@play.mvc.Security.Authenticated(AccountAPI.SecuredAPI.class)
	public Result getAllTrips(UUID boatId) {
		// first check if user has access to trip of this boat
		if (!canAccessBoat(boatId)) {
			return forbidden(AccessDeniedMsg);
		}
		
		TripDatabase tripsDb = SeapalGlobal.getInjector().getInstance(TripDatabase.class);
		List<? extends ITrip> result = tripsDb.getAllTrips(boatId.toString());

		return ok(Json.toJson(result));
	}
	
	/**
	 * Returns all waypoints of the specified trip. Note that not all properties get initialized!
	 */
	@play.mvc.Security.Authenticated(AccountAPI.SecuredAPI.class)
	public Result getAllWaypoints(UUID tripId) {
		WaypointDatabase db = SeapalGlobal.getInjector().getInstance(WaypointDatabase.class);
		return ok(Json.toJson(db.getAllWaypointsOfTrip(tripId)));
	}

	/**
	 * Returns the full-resolution image of a waypoint (binary data).
	 */
	@play.mvc.Security.Authenticated(AccountAPI.SecuredAPI.class)
	public Result getWaypointPhoto(UUID waypointId) {
		WaypointDatabase db = SeapalGlobal.getInjector().getInstance(WaypointDatabase.class);
		InputStream imgData = db.getPhoto(waypointId);
		return ok(imgData).as("image/jpeg");
	}
	
	/**
	 * Returns true when the current user is allowed to access the specified boat and it's trips.
	 */
	private boolean canAccessBoat(UUID boatId) {
		String userId = session(IAccountController.AUTHN_COOKIE_KEY);
		return mainController.getSingleDocument("boat", userId, boatId) != null;
	}

	/**
	 * Returns true when the current user is allowed to access the specified trip.
	 */
	private boolean canAccessTrip(UUID tripId) {
		String userId = session(IAccountController.AUTHN_COOKIE_KEY);
		return mainController.getSingleDocument("trip", userId, tripId) != null;
	}

	/**
	 * Returns true when the current user owns the object or when he is a friend of the object owner (objectOwnerId).
	 */
	private boolean canAccess(String objectOwnerId) {
		String userId = session(IAccountController.AUTHN_COOKIE_KEY);
		if (userId.equals(objectOwnerId)) {
			return true;
		} else {
			// get friend list of owner
			return accountController.getInternalInfo(userId, userId).getFriend_list().contains(objectOwnerId);
		}
	}
}
