package de.htwg.seapal.web.controllers;

import com.google.inject.Inject;
import de.htwg.seapal.utils.logging.ILogger;
import de.htwg.seapal.web.controllers.secure.IAccount;
import de.htwg.seapal.web.controllers.secure.IAccountController;
import de.htwg.seapal.web.controllers.secure.impl.Account;
import de.htwg.seapal.web.views.html.content.login;
import de.htwg.seapal.web.views.html.content.signup;
import org.codehaus.jackson.node.ObjectNode;
import play.data.DynamicForm;
import play.data.Form;
import play.libs.Json;
import play.mvc.Controller;
import play.mvc.Http.Context;
import play.mvc.Result;
import play.mvc.Security;

import java.util.Map;

public class AccountAPI
        extends Controller {

    static Form<Account> form = Form.form(Account.class);

    public static final String AUTHN_COOKIE_KEY = "id";

    public static class Secured
            extends Security.Authenticator {

        @Override
        public String getUsername(Context ctx) {
            return ctx.session().get(AUTHN_COOKIE_KEY);
        }

        @Override
        public Result onUnauthorized(Context ctx) {
            return redirect(routes.AccountAPI.login());
        }
    }

    @Inject
    private ILogger logger;

    @Inject
    private IAccountController controller;

    public Result signup() {
        Form<Account> filledForm = form.bindFromRequest();
        Map<String, String> data = form.data();

        ObjectNode response = Json.newObject();

        if (filledForm.hasErrors()) {
            response.put("success", false);
            response.put("errors", filledForm.errorsAsJson());

            return badRequest(response);
        } else {
            controller.saveAccount(filledForm.get());
            session().clear();
            session(AUTHN_COOKIE_KEY, filledForm.get().getUUID().toString());
            return redirect(routes.Application.index());
        }
    }

    public Result authenticate() {
        Form<Account> filledForm = DynamicForm.form(Account.class).bindFromRequest();

        IAccount account = controller.authenticate(filledForm);

        ObjectNode response = Json.newObject();

        if (filledForm.hasErrors() || account == null || !account.getAccountPassword().equals(filledForm.get().getAccountPassword())) {
            response.put("success", false);
            response.put("errors", filledForm.errorsAsJson());

            return badRequest(login.render(filledForm));
        } else {
            session().clear();
            session(AUTHN_COOKIE_KEY, account.getUUID().toString());
            return redirect(routes.Application.index());
        }
    }

    public static Result login() {
        return ok(login.render(DynamicForm.form(Account.class)));
    }

    public static Result signupForm() {
        return ok(signup.render(DynamicForm.form(Account.class)));
    }

    public static Result logout() {
        session().clear();
        flash("success", "You've been logged out");
        return redirect(routes.Application.index());
    }
}
