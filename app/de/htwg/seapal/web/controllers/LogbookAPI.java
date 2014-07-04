package de.htwg.seapal.web.controllers;

import java.io.FileNotFoundException;
import java.io.InputStream;
import java.util.Collection;
import java.util.List;
import java.util.UUID;

import org.omg.CosNaming.NamingContextPackage.NotFoundReasonHolder;

import play.libs.Json;
import play.mvc.Controller;
import play.mvc.Result;

import com.google.inject.Inject;

import de.htwg.seapal.SeapalGlobal;
import de.htwg.seapal.controller.IAccountController;
import de.htwg.seapal.controller.IMainController;
import de.htwg.seapal.database.impl.TripDatabase;
import de.htwg.seapal.database.impl.WaypointDatabase;
import de.htwg.seapal.database.IWaypointDatabase.WaypointPictureBean;
import de.htwg.seapal.model.IModel;
import de.htwg.seapal.model.ITrip;
import de.htwg.seapal.model.IBoat;
import de.htwg.seapal.model.IWaypoint;
import de.htwg.seapal.utils.logging.ILogger;
import de.htwg.seapal.web.models.Logbook;
import de.htwg.seapal.web.views.html.logbook;

import java.util.Collection;

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
	
	@Inject
	private ILogger logger;

	/**
     * initial loading of first boat and trip of the user
     * @return logbook page
     */
    @play.mvc.Security.Authenticated(AccountAPI.Secured.class)
    public Result logbook(){
    	String userId = session(IAccountController.AUTHN_COOKIE_KEY);
    	
    	Collection<? extends IModel> boatList = mainController.getOwnDocuments("boat", userId);
    	
    	if (boatList.isEmpty()) {
    		return redirect(routes.Application.index());
    	}
    	IModel initialBoat = boatList.iterator().next();
    	    	
    	Collection<? extends IModel> tripList = mainController.getByParent("trip", "boat", userId, initialBoat.getUUID());
    	
    	if (tripList.isEmpty()) {
    		return redirect(routes.Application.index());
    	}
    	
    	IModel initialTrip = tripList.iterator().next();
    	return index(initialBoat.getUUID(), initialTrip.getUUID());
    	    	
    	// Test Trip with default user
        //return redirect("/logbook/505e4b46-517b-4c1e-ac96-3dc32400ff2a/2d6ce4e2-075e-47b2-9d7a-e094b06fbb44");  
    }
	

	@play.mvc.Security.Authenticated(AccountAPI.Secured.class)
	public Result index(UUID boatId, UUID tripId) {
		String userId = session(IAccountController.AUTHN_COOKIE_KEY);
		return ok(logbook.render(new Logbook(tripId.toString(), boatId.toString())));
	}

	/**
	 * Returns a sailing trip.
	 */
	@play.mvc.Security.Authenticated(AccountAPI.SecuredAPI.class)
	public Result getTripById(UUID tripId) {
		String userId = session(IAccountController.AUTHN_COOKIE_KEY);

		IModel trip = mainController.getSingleDocument("trip", userId, tripId);

		if (trip == null)
			return notFound();

		return ok(Json.toJson(trip));
	}

	/**
	 * Gets all waypoints of a trip which have a picture assigned.
	 * Returns an array of JSON objects of the form [{waypointId, thumbImage}, ...]
	 * thumbImage is of the form "data:image/jpg;base64,[binaryData]" for direct use as src of image tags.
	 * @param startIndex Number of entries to skip before returning the values.
	 */
	@play.mvc.Security.Authenticated(AccountAPI.SecuredAPI.class)
	public Result getPhotosOfTrip(UUID tripId, int startIndex, int count) {
		String userId = session(IAccountController.AUTHN_COOKIE_KEY);

		if (!canAccessTrip(tripId)) {
			return forbidden(AccessDeniedMsg);
		}

		List<WaypointPictureBean> result = mainController.getPhotosOfTrip(userId, tripId, startIndex, count);
		if (result == null) 
			return notFound();

		return ok(Json.toJson(result));
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

		return ok(Json.toJson(mainController.getWaypointsByTripId(tripId, startIndex, count)));
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

		List<? extends ITrip> result = mainController.getTripsByBoat(boat, startDate, skip, count, "true".equals(desc));
		if (result == null) {
			return notFound();
		}

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

		List<? extends ITrip> result = mainController.getTripsByBoatSlim(boatId);
		if (result == null) {
			return notFound();
		}

		return ok(Json.toJson(result));
	}

	/**
	 * Returns all waypoints of the specified trip. Note that not all properties get initialized!
	 */
	@play.mvc.Security.Authenticated(AccountAPI.SecuredAPI.class)
	public Result getAllWaypoints(UUID tripId) {
		List<? extends IWaypoint> result = mainController.getWaypointsOfTripSlim(tripId);
		if (result == null) {
			return notFound();
		}

		return ok(Json.toJson(result));
	}

	/**
	 * Returns the full-resolution image of a waypoint (binary data).
	 */
	@play.mvc.Security.Authenticated(AccountAPI.SecuredAPI.class)
	public Result getWaypointPhoto(UUID waypointId) {
		String userId = session(IAccountController.AUTHN_COOKIE_KEY);
		InputStream imgData;
		try {
			imgData = mainController.getPhoto(userId, waypointId, "waypoint");
			return ok(imgData).as("image/jpeg");
		} catch (FileNotFoundException e) {
			return notFound();
		}
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
