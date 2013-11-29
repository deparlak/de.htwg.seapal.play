package de.htwg.seapal.web.controllers;

import com.google.inject.Inject;
import de.htwg.seapal.controller.IBoatController;
import de.htwg.seapal.model.IBoat;
import de.htwg.seapal.model.impl.Boat;
import de.htwg.seapal.utils.logging.ILogger;
import de.htwg.seapal.web.controllers.secure.IAccount;
import de.htwg.seapal.web.controllers.secure.IAccountController;
import org.codehaus.jackson.node.ObjectNode;
import play.data.Form;
import play.libs.Json;
import play.mvc.Controller;
import play.mvc.Result;
import play.mvc.Security;

import java.util.LinkedList;
import java.util.List;
import java.util.Map;
import java.util.UUID;

public class BoatAPI extends Controller {

	static Form<Boat> form = Form.form(Boat.class);

    @Inject
    private IBoatController controller;

    @Inject
    private IAccountController aController;

    @Inject
	private ILogger logger;

    @Security.Authenticated(AccountAPI.Secured.class)
    public Result boatsAsJson() {
        IAccount account = aController.findById(request().username());
        List<IBoat> target = new LinkedList<>();

        if (account != null) {
            List<IBoat> list = controller.getAllBoats();
            for (IBoat boat : list) {
                if (account.hasBoat(boat.getUUID())) {
                    target.add(boat);
                }
            }
        }

        return ok(Json.toJson(target));
	}

    @Security.Authenticated(AccountAPI.Secured.class)
    public Result boatAsJson(UUID id) {
		IBoat boat = controller.getBoat(id);
        IAccount account = aController.findById(request().username());
        if(boat != null && account.hasBoat(id)){
			return ok(Json.toJson(boat));
		} else {
			return notFound();
		}
	}

	public Result addBoat() {
		logger.info("BoatAPI", "--> addBoat");
		Form<Boat> filledForm = form.bindFromRequest();
		Map<String, String> data = form.data();
		logger.info("Filled Form Data" , filledForm.toString());

		ObjectNode response = Json.newObject();

		if (filledForm.hasErrors()) {
			logger.warn("BoatAPI", "FilledForm has errors: " + filledForm.errorsAsJson().toString());
			response.put("success", false);
			response.put("errors", filledForm.errorsAsJson());

			return badRequest(response);
		} else {
			response.put("success", true);
			boolean created = controller.saveBoat(filledForm.get());
			if(created) {
				logger.info("BoatAPI", "Boat created");
				return created(response);
			} else {
				logger.info("BoatAPI", "Boat updated");
				return ok(response);
			}
		}
	}

	public Result deleteBoat(UUID id) {
		controller.deleteBoat(id);
		ObjectNode response = Json.newObject();
		response.put("success", true);

		return ok(response);
	}

}
