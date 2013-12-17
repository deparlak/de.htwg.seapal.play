package de.htwg.seapal.web.controllers;

import com.google.inject.Inject;
import de.htwg.seapal.controller.IWaypointController;
import de.htwg.seapal.model.IWaypoint;
import de.htwg.seapal.model.impl.Waypoint;
import de.htwg.seapal.utils.logging.ILogger;
import de.htwg.seapal.web.controllers.secure.IAccountController;
import org.codehaus.jackson.node.ObjectNode;
import play.data.Form;
import play.libs.Json;
import play.mvc.Controller;
import play.mvc.Result;
import play.mvc.Security;

import java.util.*;

public class WaypointAPI extends Controller {

	static Form<Waypoint> form = Form.form(Waypoint.class);

	@Inject
	private IWaypointController controller;

	@Inject
	private ILogger logger;

    @Security.Authenticated(AccountAPI.SecuredAPI.class)
    public Result waypointAsJson(UUID waypointId) {
        return ok(Json.toJson(controller.queryView("waypointAsJson", session(IAccountController.AUTHN_COOKIE_KEY) + waypointId.toString())));
    }

    @Security.Authenticated(AccountAPI.SecuredAPI.class)
    public Result waypointsAsJson(UUID tripId) {
        List<? extends IWaypoint> waypoints = controller.queryView("waypointsAsJson", session(IAccountController.AUTHN_COOKIE_KEY) + tripId.toString());

        Collections.sort(waypoints, new Comparator<IWaypoint>(){

	            @Override
	            public int compare(IWaypoint arg0, IWaypoint arg1) {
	                return arg0.getDate().compareTo(arg1.getDate());
	            }

	        });

		return ok(Json.toJson(waypoints));
	}

    @Security.Authenticated(AccountAPI.SecuredAPI.class)
    public Result addWaypoint() {

        // TODO check if waypoint belongs to account currently logged in
		logger.info("WaypointAPI", "--> addWaypoint");
		Form<Waypoint> filledForm = form.bindFromRequest();
		logger.info("Filled Form Data" , filledForm.toString());

		ObjectNode response = Json.newObject();

		if (filledForm.hasErrors()) {
			logger.warn("WaypointAPI", "FilledForm has errors: " + filledForm.errorsAsJson().toString());
			response.put("success", false);
			response.put("errors", filledForm.errorsAsJson());

			return badRequest(response);
		} else {
			response.put("success", true);
            controller.saveWaypoint(filledForm.get());

			logger.info("WaypointAPI", "Waypoint created");
			return created(response);
		}
	}

}
