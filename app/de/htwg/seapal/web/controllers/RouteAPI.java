package de.htwg.seapal.web.controllers;

import com.google.inject.Inject;
import de.htwg.seapal.controller.IRouteController;
import de.htwg.seapal.model.IRoute;
import de.htwg.seapal.model.impl.Route;
import de.htwg.seapal.utils.logging.ILogger;
import de.htwg.seapal.web.controllers.secure.IAccountController;
import org.codehaus.jackson.node.ObjectNode;
import play.data.Form;
import play.libs.Json;
import play.mvc.Controller;
import play.mvc.Result;
import play.mvc.Security;

import java.util.UUID;

public class RouteAPI
        extends Controller {

    static Form<Route> form = Form.form(Route.class);

    @Inject
    private IRouteController controller;

    @Inject
    private ILogger logger;

    @Security.Authenticated(AccountAPI.Secured.class)
    public Result routesAsJson() {
        return ok(Json.toJson(controller.queryView("routesAsJson", session(IAccountController.AUTHN_COOKIE_KEY))));
    }

    @Security.Authenticated(AccountAPI.Secured.class)
    public Result routeAsJson(UUID id) {
        return ok(Json.toJson(controller.queryView("routeAsJson", session(IAccountController.AUTHN_COOKIE_KEY) + id.toString())));
    }

    @Security.Authenticated(AccountAPI.Secured.class)
    public Result addRoute() {
        logger.info("RouteAPI", "--> addRoute");
        Form<Route> filledForm = form.bindFromRequest();

        ObjectNode response = Json.newObject();

        if (filledForm.hasErrors()) {
            logger.warn("RouteAPI", "FilledForm has errors: " + filledForm.errorsAsJson().toString());
            response.put("success", false);
            response.put("errors", filledForm.errorsAsJson());

            return badRequest(response);
        } else {
            response.put("success", true);
            IRoute trip = filledForm.get();
            trip.setAccount(session(IAccountController.AUTHN_COOKIE_KEY));
            boolean created = controller.saveRoute(trip);
            if (created) {
                logger.info("RouteAPI", "Route created");
                return created(response);
            } else {
                logger.info("RouteAPI", "Route updated");
                return ok(response);
            }
        }
    }

    @Security.Authenticated(AccountAPI.Secured.class)
    public Result deleteRoute(UUID id) {
        controller.deleteRoute(id);
        ObjectNode response = Json.newObject();
        response.put("success", true);

        return ok(response);
    }
}
