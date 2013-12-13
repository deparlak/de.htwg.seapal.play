package de.htwg.seapal.web.controllers;

import com.google.inject.Inject;
import de.htwg.seapal.controller.IBoatController;
import de.htwg.seapal.model.IBoat;
import de.htwg.seapal.model.impl.Boat;
import de.htwg.seapal.utils.logging.ILogger;
import de.htwg.seapal.web.controllers.secure.IAccountController;
import org.codehaus.jackson.node.ObjectNode;
import play.data.Form;
import play.libs.Json;
import play.mvc.Controller;
import play.mvc.Result;
import play.mvc.Security;

import java.util.UUID;

public class BoatAPI extends Controller {

	static Form<Boat> form = Form.form(Boat.class);

    @Inject
    private IBoatController controller;

    @Inject
    private IAccountController accountController;

    @Inject
	private ILogger logger;

    @Security.Authenticated(AccountAPI.Secured.class)
    public Result boatsAsJson() {
        return ok(Json.toJson(controller.getBoats(session(IAccountController.AUTHN_COOKIE_KEY), "list")));
   	}

    @Security.Authenticated(AccountAPI.Secured.class)
    public Result boatAsJson(UUID id) {
		IBoat boat = controller.getBoat(id);

        if(boat != null && accountController.hasBoat(id)){
			return ok(Json.toJson(boat));
		} else {
			return notFound();
		}
	}

    @Security.Authenticated(AccountAPI.Secured.class)
    public Result addBoat() {
		logger.info("BoatAPI", "--> addBoat");
		Form<Boat> filledForm = form.bindFromRequest();

		ObjectNode response = Json.newObject();

		if (filledForm.hasErrors()) {
			logger.warn("BoatAPI", "FilledForm has errors: " + filledForm.errorsAsJson().toString());
			response.put("success", false);
			response.put("errors", filledForm.errorsAsJson());

			return badRequest(response);
		} else {
			response.put("success", true);
            IBoat boat = filledForm.get();
            boat.setOwner(session(IAccountController.AUTHN_COOKIE_KEY));
			boolean created = controller.saveBoat(boat);
            if(created) {
                accountController.addBoat(boat.getUUID());
                logger.info("BoatAPI", "Boat created");
				return created(response);
			} else {
				logger.info("BoatAPI", "Boat updated");
				return ok(response);
			}
		}
	}

    @Security.Authenticated(AccountAPI.Secured.class)
    public Result deleteBoat(UUID id) {
		controller.deleteBoat(id);
        accountController.deleteBoat(id);
        ObjectNode response = Json.newObject();
		response.put("success", true);

		return ok(response);
	}

}
