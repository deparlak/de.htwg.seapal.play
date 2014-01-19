package de.htwg.seapal.web.controllers;

import com.google.inject.Inject;
import de.htwg.seapal.controller.ITripController;
import de.htwg.seapal.controller.IWaypointController;
import de.htwg.seapal.model.impl.Account;
import de.htwg.seapal.utils.logging.ILogger;
import de.htwg.seapal.web.controllers.helpers.Menus;
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
        return ok(signInSeapal.render(DynamicForm.form(Account.class), routes.AccountAPI.login()));
    }

    public static Result forgotten() {
        return ok(forgottenPassword.render(DynamicForm.form(Account.class)));
    }

    public static Result signup() {
        return ok(signUpSeapal.render(DynamicForm.form(Account.class), routes.AccountAPI.signup()));
    }

    public static Result javascriptRoutes() {
        response().setContentType("text/javascript");
        return ok(Routes.javascriptRouter("jsRoutes",
                routes.javascript.MainAPI.singleDocument(), routes.javascript.MainAPI.deleteDocument(), routes.javascript.MainAPI.getDocuments(), routes.javascript.MainAPI.getByParent(), routes.javascript.MainAPI.createDocument()
        ));
    }
}
