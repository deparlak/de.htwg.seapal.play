package de.htwg.seapal.web.controllers;

import com.google.inject.Inject;
import de.htwg.seapal.utils.logging.ILogger;
import de.htwg.seapal.web.controllers.helpers.PasswordHash;
import de.htwg.seapal.web.controllers.secure.IAccount;
import de.htwg.seapal.web.controllers.secure.IAccountController;
import de.htwg.seapal.web.controllers.secure.impl.Account;
import de.htwg.seapal.web.views.html.content.login;
import org.codehaus.jackson.node.ObjectNode;
import play.data.DynamicForm;
import play.data.Form;
import play.libs.Json;
import play.mvc.Controller;
import play.mvc.Http.Context;
import play.mvc.Result;
import play.mvc.Security;

import java.security.NoSuchAlgorithmException;
import java.security.spec.InvalidKeySpecException;
import java.util.Map;

public class AccountAPI
        extends Controller {

    static Form<Account> form = Form.form(Account.class);

    @Inject
    private IAccountController controller;

    @Inject
    private ILogger logger;

    public Result signup() {
        Form<Account> filledForm = form.bindFromRequest();
        Map<String, String> data = form.data();

        ObjectNode response = Json.newObject();
        IAccount account = filledForm.get();

        if (filledForm.hasErrors() || controller.accountExists(account.getAccountName())) {
            response.put("success", false);
            response.put("errors", filledForm.errorsAsJson());

            return badRequest(response);
        } else {
            try {
                account.setAccountPassword(PasswordHash.createHash(account.getAccountPassword()));
                controller.saveAccount(account);
            } catch (InvalidKeySpecException e) {
                e.printStackTrace();
            } catch (NoSuchAlgorithmException e) {
                e.printStackTrace();
            }
            session().clear();
            session(IAccountController.AUTHN_COOKIE_KEY, filledForm.get().getUUID().toString());
            return redirect(routes.Application.index());
        }
    }

    public Result login() {
        Form<Account> filledForm = DynamicForm.form(Account.class).bindFromRequest();


        ObjectNode response = Json.newObject();

        try {
            IAccount account = controller.authenticate(filledForm);

            if (!filledForm.hasErrors() && account != null) {
                session().clear();
                session(IAccountController.AUTHN_COOKIE_KEY, account.getUUID().toString());
                flash("success", "You've been logged in");
                return redirect(routes.Application.index());
            }
        } catch (NoSuchAlgorithmException e) {
            e.printStackTrace();
        } catch (InvalidKeySpecException e) {
            e.printStackTrace();
        }

        response.put("success", false);
        response.put("errors", filledForm.errorsAsJson());

        return badRequest(login.render(filledForm, routes.AccountAPI.login(), false, "Login"));
    }

    public static Result logout() {
        session().clear();
        flash("success", "You've been logged out");
        return redirect(routes.Application.index());
    }

    public static class Secured
            extends Security.Authenticator {
        @Override
        public String getUsername(Context ctx) {
            return ctx.session().get(IAccountController.AUTHN_COOKIE_KEY);
        }

        @Override
        public Result onUnauthorized(Context ctx) {
            return redirect(routes.Application.login());
        }

    }
}
