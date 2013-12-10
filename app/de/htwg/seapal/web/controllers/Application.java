package de.htwg.seapal.web.controllers;

import java.util.ArrayList;
import java.util.LinkedList;
import java.util.List;
import java.util.UUID;

import com.google.inject.Inject;

import de.htwg.seapal.controller.ITripController;
import de.htwg.seapal.controller.IWaypointController;
import de.htwg.seapal.model.impl.Waypoint;
import de.htwg.seapal.utils.logging.ILogger;
import de.htwg.seapal.web.controllers.helpers.Menus;
import de.htwg.seapal.web.views.html.*;
import play.Routes;
import play.data.Form;
import play.mvc.Controller;
import play.mvc.Result;
import play.mvc.With;

@With(Menus.class)
public class Application extends Controller {
	
	@Inject
	private ITripController tripController;
	
	@Inject
	private IWaypointController waypointController;
	
	@Inject
	private ILogger logger;
	
	public static Result index() {
		return ok(index.render());
	}

	public static Result impressum() {
		return ok(impressum.render());
	}
	
	public static Result app(){
		return ok(app.render());
	}
	/*
	public static Result waypoint_add(UUID tripId){
		Form<Waypoint> form = Form.form(Waypoint.class);
		return ok(log_entry.render(tripId, null, form));
	}
	
	public Result waypoint_show(UUID waypointId) {
		Form<Waypoint> form = Form.form(Waypoint.class);
		return ok(log_entry.render(null, waypointId, form.fill((Waypoint)waypointController.getWaypoint(waypointId))));
	}*/
	
	public static Result javascriptRoutes() {
	    response().setContentType("text/javascript");
	    return ok(
	      Routes.javascriptRouter("jsRoutes",
	        // Routes

	    	// API  
	        de.htwg.seapal.web.controllers.routes.javascript.BoatAPI.boatAsJson(),
	        de.htwg.seapal.web.controllers.routes.javascript.BoatAPI.boatsAsJson(),
	        de.htwg.seapal.web.controllers.routes.javascript.BoatAPI.deleteBoat(),
	        de.htwg.seapal.web.controllers.routes.javascript.BoatAPI.addBoat(),
	        de.htwg.seapal.web.controllers.routes.javascript.TripAPI.tripsAsJson(),
	        de.htwg.seapal.web.controllers.routes.javascript.TripAPI.tripAsJson(),
	        de.htwg.seapal.web.controllers.routes.javascript.TripAPI.allTripsAsJson(),
	        de.htwg.seapal.web.controllers.routes.javascript.TripAPI.addTrip(),
	        de.htwg.seapal.web.controllers.routes.javascript.WaypointAPI.addWaypoint(),
	        de.htwg.seapal.web.controllers.routes.javascript.WaypointAPI.waypointAsJson(),
	        de.htwg.seapal.web.controllers.routes.javascript.WaypointAPI.waypointsAsJson()
	        //de.htwg.seapal.web.controllers.routes.javascript.BoatPositionAPI.current(),
	      )
	    );
	  }
}