package de.htwg.seapal.web.controllers;

import com.google.inject.Inject;

import de.htwg.seapal.model.impl.Account;
import de.htwg.seapal.model.impl.SignupAccount;
import de.htwg.seapal.utils.logging.ILogger;
import de.htwg.seapal.web.controllers.helpers.Menus;
import de.htwg.seapal.web.models.Logbook;
import de.htwg.seapal.web.views.html.app;
import de.htwg.seapal.web.views.html.appContent.forgottenPassword;
import de.htwg.seapal.web.views.html.appContent.reset;
import de.htwg.seapal.web.views.html.appContent.signInSeapal;
import de.htwg.seapal.web.views.html.appContent.signUpSeapal;
import de.htwg.seapal.web.views.html.impressum;
import de.htwg.seapal.web.views.html.index;
import de.htwg.seapal.web.views.html.logbook;
import play.Routes;
import play.data.DynamicForm;
import play.mvc.Controller;
import play.mvc.Result;
import play.mvc.With;

@With(Menus.class)
public class Application
        extends Controller {

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

    @play.mvc.Security.Authenticated(AccountAPI.Secured.class)
    public static Result logbook(){
        return redirect("/logbook/394b2934-3918-444d-820c-abaf11e60fc7");  
    }

    public static Result login() {
    	String returnUrl = request().getQueryString("returnUrl");
    	if (returnUrl == null) {
    		returnUrl = "";
    	}
    	
        return ok(signInSeapal.render(DynamicForm.form(Account.class), routes.AccountAPI.login(), returnUrl));
    }

    public static Result forgotten() {
        return ok(forgottenPassword.render(DynamicForm.form(Account.class)));
    }

    public static Result signup() {
        return ok(signUpSeapal.render(DynamicForm.form(SignupAccount.class), routes.AccountAPI.signup()));
    }

    public static Result resetForm(int token) {
        return ok(reset.render(token));
    }

    public static Result javascriptRoutes() {
        response().setContentType("text/javascript");
        return ok(Routes.javascriptRouter("jsRoutes",
                routes.javascript.MainAPI.singleDocument(), routes.javascript.MainAPI.deleteDocument(), routes.javascript.MainAPI.getDocuments(), routes.javascript.MainAPI.getByParent(), routes.javascript.MainAPI.createDocument()
        ));
    }
}
