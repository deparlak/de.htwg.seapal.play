package de.htwg.seapal.web.controllers;

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

/**
 * Handles http requests to /LogbookAPI
 * @author Lukas
 *
 */
public class LogbookAPI extends Controller {

	@Inject
	private IMainController mainController;
	

	//@play.mvc.Security.Authenticated(AccountAPI.SecuredAPI.class)
	public Result index(UUID tripId) {
		String userId = session(IAccountController.AUTHN_COOKIE_KEY);
		return ok(de.htwg.seapal.web.views.html.scrolldemo.render(tripId.toString()));
	}
	
	//@play.mvc.Security.Authenticated(AccountAPI.SecuredAPI.class)
	public Result getTripById(UUID tripId) {
		TripDatabase db = SeapalGlobal.getInjector().getInstance(TripDatabase.class);
		ITrip trip = db.get(tripId);
		
		if (trip == null)
			return notFound();
		
		return ok(Json.toJson(trip));
	}
	
	//@play.mvc.Security.Authenticated(AccountAPI.SecuredAPI.class)
	public Result getPhotosOfTrip(UUID tripId, int startIndex, int count) {
		WaypointDatabase db = SeapalGlobal.getInjector().getInstance(WaypointDatabase.class);
		return ok(Json.toJson(db.getPhotosByTripId(tripId, startIndex, count)));
	}
	
	//@play.mvc.Security.Authenticated(AccountAPI.SecuredAPI.class)
	public Result getWaypointsOfTrip(UUID tripId, int startIndex, int count) {
		WaypointDatabase db = SeapalGlobal.getInjector().getInstance(WaypointDatabase.class);
		return ok(Json.toJson(db.getWaypointsByTripId(tripId, startIndex, count)));
	}
	
	public Result getTrips(UUID boat, long startDate, int skip, int count, String desc) {
		TripDatabase tripsDb = SeapalGlobal.getInjector().getInstance(TripDatabase.class);
		List<? extends ITrip> result = tripsDb.getTrips(boat.toString(), startDate, skip, count, "true".equals(desc));
		
		return ok(Json.toJson(result));
	}
	
	public Result getAllTrips(UUID boat) {
		TripDatabase tripsDb = SeapalGlobal.getInjector().getInstance(TripDatabase.class);
		List<? extends ITrip> result = tripsDb.getAllTrips(boat.toString());
		
		return ok(Json.toJson(result));
	}
}
