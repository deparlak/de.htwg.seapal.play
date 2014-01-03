package de.htwg.seapal.web.controllers;

import com.google.inject.Inject;
import de.htwg.seapal.controller.ITripController;
import de.htwg.seapal.controller.IWaypointController;
import de.htwg.seapal.model.impl.Person;
import de.htwg.seapal.utils.logging.ILogger;
import de.htwg.seapal.web.controllers.helpers.Menus;
import de.htwg.seapal.web.controllers.secure.impl.Account;
import de.htwg.seapal.web.views.html.app;
import de.htwg.seapal.web.views.html.appContent.forgottenPassword;
import de.htwg.seapal.web.views.html.appContent.signInSeapal;
import de.htwg.seapal.web.views.html.appContent.signUpSeapal;
import de.htwg.seapal.web.views.html.impressum;
import de.htwg.seapal.web.views.html.index;
import play.Routes;
import play.data.DynamicForm;
import play.mvc.Controller;
import play.mvc.Result;
import play.mvc.With;

@With(Menus.class)
public class Application
        extends Controller {

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

    public static Result app() {
        return ok(app.render());
    }

    public static Result login() {
        return ok(signInSeapal.render(DynamicForm.form(Person.class), routes.AccountAPI.login()));
    }

    public static Result forgotten() {
        return ok(forgottenPassword.render(DynamicForm.form(Account.class)));
    }

    public static Result signup() {
        return ok(signUpSeapal.render(DynamicForm.form(Person.class), routes.AccountAPI.signup()));
    }
    /*
    @Security.Authenticated(AccountAPI.Secured.class)
    public static Result boat_info() {
        return ok(boat_info.render());
    }

    @Security.Authenticated(AccountAPI.Secured.class)
    public static Result trip_list(UUID boatId) {
        return ok(trip_list.render(boatId));
    }

    @Security.Authenticated(AccountAPI.Secured.class)
    public static Result trip_add(UUID boatId) {
        return ok(trip_info.render(boatId, null));
    }

    @Security.Authenticated(AccountAPI.Secured.class)
    public static Result trip_edit(UUID tripId) {
        return ok(trip_info.render(null, tripId));
    }

    @Security.Authenticated(AccountAPI.Secured.class)
    public static Result waypoint_add(UUID tripId) {
        Form<Waypoint> form = Form.form(Waypoint.class);
        return ok(log_entry.render(tripId, null, form));
    }

    @Security.Authenticated(AccountAPI.Secured.class)
    public Result waypoint_show(UUID waypointId) {
        Form<Waypoint> form = Form.form(Waypoint.class);
        return ok(log_entry.render(null, waypointId, form.fill((Waypoint) waypointController.getWaypoint(waypointId))));
    }
	*/
    public static Result javascriptRoutes() {
        response().setContentType("text/javascript");
        return ok(Routes.javascriptRouter("jsRoutes",
                // Routes

                // API
                de.htwg.seapal.web.controllers.routes.javascript.BoatAPI.boatAsJson(), de.htwg.seapal.web.controllers.routes.javascript.BoatAPI.boatsAsJson(), de.htwg.seapal.web.controllers.routes.javascript.BoatAPI.deleteBoat(), de.htwg.seapal.web.controllers.routes.javascript.BoatAPI.addBoat(), de.htwg.seapal.web.controllers.routes.javascript.TripAPI.tripsAsJson(), de.htwg.seapal.web.controllers.routes.javascript.TripAPI.tripAsJson(), de.htwg.seapal.web.controllers.routes.javascript.TripAPI.allTripsAsJson(), de.htwg.seapal.web.controllers.routes.javascript.TripAPI.addTrip(), de.htwg.seapal.web.controllers.routes.javascript.WaypointAPI.addWaypoint(), de.htwg.seapal.web.controllers.routes.javascript.WaypointAPI.waypointAsJson(), de.htwg.seapal.web.controllers.routes.javascript.WaypointAPI.waypointsAsJson()
                //de.htwg.seapal.web.controllers.routes.javascript.BoatPositionAPI.current(),
        ));
    }
}
