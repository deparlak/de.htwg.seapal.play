package de.htwg.seapal.web.controllers;

import com.google.inject.Inject;
import de.htwg.seapal.controller.IBoatController;
import de.htwg.seapal.controller.ITripController;
import de.htwg.seapal.model.ITrip;
import de.htwg.seapal.model.impl.Trip;
import de.htwg.seapal.utils.logging.ILogger;
import de.htwg.seapal.web.controllers.secure.IAccountController;
import org.codehaus.jackson.node.ObjectNode;
import play.data.Form;
import play.libs.Json;
import play.mvc.Controller;
import play.mvc.Result;
import play.mvc.Security;

import java.util.UUID;

public class TripAPI extends Controller {

	static Form<Trip> form = Form.form(Trip.class);

	@Inject
	private ITripController controller;

    @Inject
    private IAccountController accountController;

    @Inject
    private IBoatController boatController;

    @Inject
	private ILogger logger;

    @Security.Authenticated(AccountAPI.Secured.class)
    public Result tripsAsJson(UUID boatId) {
        return ok(Json.toJson(controller.getTrips(session(IAccountController.AUTHN_COOKIE_KEY) + "+" + boatId.toString(), "tripsAsJson")));
    }

    @Security.Authenticated(AccountAPI.Secured.class)
    public Result tripAsJson(UUID id) {
        return ok(Json.toJson(controller.getTrips(session(IAccountController.AUTHN_COOKIE_KEY) + "+" + id.toString(), "tripAsJson").get(0)));
    }

    @Security.Authenticated(AccountAPI.Secured.class)
    public Result allTripsAsJson() {
        return ok(Json.toJson(controller.getTrips(session(IAccountController.AUTHN_COOKIE_KEY), "allTripsAsJson").get(0)));
    }

    @Security.Authenticated(AccountAPI.Secured.class)
    public Result addTrip() {
		logger.info("TripAPI", "--> addTrip");
		Form<Trip> filledForm = form.bindFromRequest();

		ObjectNode response = Json.newObject();

		if (filledForm.hasErrors()) {
			logger.warn("TripAPI", "FilledForm has errors: " + filledForm.errorsAsJson().toString());
			response.put("success", false);
			response.put("errors", filledForm.errorsAsJson());

			return badRequest(response);
		} else {
			response.put("success", true);
            ITrip trip = filledForm.get();
            trip.setOwner(session(IAccountController.AUTHN_COOKIE_KEY));
            boolean created = controller.saveTrip(trip);
			if(created) {
                accountController.addBoat(trip.getUUID());
                logger.info("TripAPI", "Trip created");
				return created(response);
			}else{
				logger.info("TripAPI", "Trip updated");
				return ok(response);
			}
		}
	}

    @Security.Authenticated(AccountAPI.Secured.class)
    public Result deleteTrip(UUID id) {
		controller.deleteTrip(id);
        accountController.deleteTrip(id);
        ObjectNode response = Json.newObject();
		response.put("success", true);

		return ok(response);
	}

}
