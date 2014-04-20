package de.htwg.seapal.web.controllers;

import java.util.UUID;

import play.libs.Json;
import play.mvc.Controller;
import play.mvc.Result;

import com.google.inject.Inject;

import de.htwg.seapal.SeapalGlobal;
import de.htwg.seapal.controller.IAccountController;
import de.htwg.seapal.controller.IMainController;
import de.htwg.seapal.database.impl.WaypointDatabase;
import de.htwg.seapal.model.IModel;

/**
 * Handles http requests to /LogbookAPI
 * @author Lukas
 *
 */
public class LogbookAPI extends Controller {

	@Inject
	private IMainController mainController;
	

	@play.mvc.Security.Authenticated(AccountAPI.SecuredAPI.class)
	public Result index(UUID tripId) {
		String userId = session(IAccountController.AUTHN_COOKIE_KEY);
		return ok("logbook"); //de.htwg.seapal.web.views.html.journal.render(tripId));
	}
	
	@play.mvc.Security.Authenticated(AccountAPI.SecuredAPI.class)
	public Result getTripById(UUID tripId) {
		String userId = session(IAccountController.AUTHN_COOKIE_KEY);
		IModel trip = mainController.getSingleDocument("trip", userId, tripId);
		if (trip == null)
			return notFound();
		
		return ok(Json.toJson(trip));
	}
	
	
	@play.mvc.Security.Authenticated(AccountAPI.SecuredAPI.class)
	public Result getPhotosOfTrip(UUID tripId, int startIndex, int count) {
		WaypointDatabase db = SeapalGlobal.getInjector().getInstance(WaypointDatabase.class);
		return ok(Json.toJson(db.getPhotosByTripId(tripId, startIndex, count)));
	}
	
	
}
