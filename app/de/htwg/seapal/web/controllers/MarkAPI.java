package de.htwg.seapal.web.controllers;

import com.google.inject.Inject;
import de.htwg.seapal.controller.IMarkController;
import de.htwg.seapal.model.impl.Mark;
import de.htwg.seapal.utils.logging.ILogger;
import de.htwg.seapal.web.controllers.secure.IAccountController;
import org.codehaus.jackson.node.ObjectNode;
import play.data.Form;
import play.libs.Json;
import play.mvc.Controller;
import play.mvc.Result;
import play.mvc.Security;

import java.util.UUID;

public class MarkAPI
        extends Controller {

	static Form<Mark> form = Form.form(Mark.class);

    @Inject
    private IMarkController controller;

    @Inject
	private ILogger logger;

    @Security.Authenticated(AccountAPI.SecuredAPI.class)
    public Result marksAsJson(UUID boat) {
        return ok(Json.toJson(controller.queryView("marksAsJson", session(IAccountController.AUTHN_COOKIE_KEY) + boat.toString())));
   	}

    @Security.Authenticated(AccountAPI.SecuredAPI.class)
    public Result markAsJson(UUID mark) {
        return ok(Json.toJson(controller.queryView("markAsJson", session(IAccountController.AUTHN_COOKIE_KEY) + mark.toString())));
    }

    @Security.Authenticated(AccountAPI.SecuredAPI.class)
    public Result addMark() {
		logger.info("MarkAPI", "--> addMark");
		Form<Mark> filledForm = form.bindFromRequest();

		ObjectNode response = Json.newObject();

		if (filledForm.hasErrors()) {
			logger.warn("MarkAPI", "FilledForm has errors: " + filledForm.errorsAsJson().toString());
			response.put("success", false);
			response.put("errors", filledForm.errorsAsJson());

			return badRequest(response);
		} else {
			response.put("success", true);
            Mark mark = filledForm.get();

            mark.setOwner(session(IAccountController.AUTHN_COOKIE_KEY));

			boolean created = controller.saveMark(mark);
            if(created) {
                logger.info("MarkAPI", "Mark created");
				return created(response);
			} else {
				logger.info("MarkAPI", "Mark updated");
				return ok(response);
			}
		}
	}

    @Security.Authenticated(AccountAPI.SecuredAPI.class)
    public Result deleteMark(UUID id) {
		controller.deleteMark(id);
        ObjectNode response = Json.newObject();
		response.put("success", true);

		return ok(response);
	}
}
