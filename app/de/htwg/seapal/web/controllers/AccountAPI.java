package de.htwg.seapal.web.controllers;

import com.google.inject.Inject;
import de.htwg.seapal.controller.IPersonController;
import de.htwg.seapal.controller.impl.PasswordHash;
import de.htwg.seapal.model.IPerson;
import de.htwg.seapal.model.impl.Person;
import de.htwg.seapal.utils.logging.ILogger;
import de.htwg.seapal.web.controllers.helpers.Menus;
import de.htwg.seapal.web.views.html.appContent.reset;
import de.htwg.seapal.web.views.html.appContent.signInSeapal;
import de.htwg.seapal.web.views.html.appContent.signUpSeapal;
import org.codehaus.jackson.node.ObjectNode;
import play.data.DynamicForm;
import play.data.Form;
import play.libs.F;
import play.libs.Json;
import play.libs.OpenID;
import play.mvc.Controller;
import play.mvc.Http.Context;
import play.mvc.Result;
import play.mvc.Security;
import play.mvc.With;

import java.security.NoSuchAlgorithmException;
import java.security.spec.InvalidKeySpecException;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Random;

@With(Menus.class)
public class AccountAPI
        extends Controller {

    private static final long TIMEOUT = 60 * 60 * 1000;

    static Form<Person> form = Form.form(Person.class);

    @Inject
    private IPersonController controller;

    @Inject
    private ILogger logger;

    public Result signup() {
        Form<Person> filledForm = form.bindFromRequest();

        ObjectNode response = Json.newObject();
        IPerson account = filledForm.get();
        boolean exists = controller.accountExists(account.getEmail());

        if (filledForm.hasErrors() || exists) {
            response.put("success", false);
            response.put("errors", filledForm.errorsAsJson());
            if (exists) {
                flash("errors", "Account already exists");
            }

            return badRequest(signUpSeapal.render(filledForm, routes.AccountAPI.signup()));
        } else {
            try {

                String error = InputValidator.validate(account);
                if (error != null) {
                    flash("errors", error);
                    return badRequest(signUpSeapal.render(filledForm, routes.AccountAPI.signup()));
                }

                account.setPassword(PasswordHash.createHash(account.getPassword()));
                controller.savePerson(account);
            } catch (InvalidKeySpecException e) {
                e.printStackTrace();
            } catch (NoSuchAlgorithmException e) {
                e.printStackTrace();
            }
            session().clear();
            session(IPersonController.AUTHN_COOKIE_KEY, filledForm.get().getUUID().toString());
            return redirect(routes.Application.app());
        }
    }

    public Result login() {
        Form<Person> filledForm = DynamicForm.form(Person.class).bindFromRequest();


        IPerson account = null;

        try {
            account = controller.authenticate(filledForm.get());

            if (!filledForm.hasErrors() && account != null) {
                session().clear();
                session(IPersonController.AUTHN_COOKIE_KEY, account.getUUID().toString());
                flash("success", "You've been logged in");
                return redirect(routes.Application.app());
            }
        } catch (Exception e) {
            e.printStackTrace();
        }

        ObjectNode response = Json.newObject();
        response.put("success", false);
        response.put("errors", filledForm.errorsAsJson());
        if (account == null) {
            flash("errors", "Wrong username or password");
        }

        return badRequest(signInSeapal.render(filledForm, routes.AccountAPI.login()));
    }

    public static Result logout() {
        session().clear();
        flash("success", "You've been logged out");
        return redirect(routes.Application.app());
    }

    public Result requestNewPassword() {
        Form<Person> filledForm = form.bindFromRequest();

        IPerson account = filledForm.get();
        List<? extends IPerson> list = controller.queryView("by_email", account.getEmail());

        if (list.size() == 0) {
            flash("errors", "Account does not exist");
            return redirect(routes.Application.forgotten());
        } else if (list.size() > 1) {
            flash("errors", "An internal error occured. Please try again!");
            return redirect(routes.Application.forgotten());
        }

        account = list.get(0);

        Random rand = new Random(System.currentTimeMillis());

        int token = rand.nextInt(); // TODO: check if regex ^\s*-?[0-9]{1,10}\s*$ matches all possible return values of Random.nextInt()

        account.setResetToken(Integer.toString(token));

        account.setResetTimeout(System.currentTimeMillis() + TIMEOUT);

        controller.savePerson(account);

        /*
            MailerAPI mail = play.Play.application().plugin(MailerPlugin.class).email();
            mail.setSubject("request for password change");
            logger.error("AccountName", account.getAccountName());
            mail.addRecipient("John Doe <" + account.getAccountName() + ">");
            mail.addFrom("seapalweb@gmail.com");
            mail.send("To Reset your password, click the following link: http://localhost:9000/pwreset/" + token);
        */
        System.out.println("http://localhost:9000/pwreset/" + token);
        flash("success", "You have received an email with a link to reset your password!");
        return redirect(routes.Application.forgotten());
    }

    public Result resetForm(int token) {
        return ok(reset.render(token));
    }

    public Result resetPassword() {
        Map<String, String[]> form = request().body().asFormUrlEncoded();

        String token = form.get("token")[0];

        logger.error("Token", token);

        List<? extends IPerson> list = controller.queryView("resetToken", token);

        logger.error("size", Integer.toString(list.size()));

        if (list.size() == 0) {
            flash("errors", "Account does not/no longer exist!");
            return resetForm(Integer.parseInt(token));
        } else if (list.size() > 1) {
            flash("errors", "Too many equal reset tokens, Please request a new token by clicking on I forgot my password!");
            return resetForm(Integer.parseInt(token));
        }

        IPerson account = list.get(0);

        if (account.getResetTimeout() < System.currentTimeMillis()) {
            flash("errors", "Reset token expired. Please request a new token by clicking on I forgot my password!");
            return resetForm(Integer.parseInt(token));
        }

        String error = InputValidator.validate(account);
        if (error != null) {
            flash("errors", error);
            return resetForm(Integer.parseInt(token));
        }

        account.setResetToken("0");

        account.setResetTimeout(0);

        try {
            account.setPassword(PasswordHash.createHash(form.get("password")[0]));
        } catch (NoSuchAlgorithmException e) {
            e.printStackTrace();
        } catch (InvalidKeySpecException e) {
            e.printStackTrace();
        }
        controller.savePerson(account);

        session(IPersonController.AUTHN_COOKIE_KEY, account.getUUID().toString());
        flash("success", "You have successfully changed your password");

        return resetForm(Integer.parseInt(token));
    }

    public static class Secured
            extends Security.Authenticator {

        @Override
        public String getUsername(Context ctx) {
            return ctx.session().get(IPersonController.AUTHN_COOKIE_KEY);
        }

        @Override
        public Result onUnauthorized(Context ctx) {
            return redirect(routes.Application.login());
        }
    }

    public static class SecuredAPI
            extends Security.Authenticator {

        @Override
        public String getUsername(Context ctx) {
            return ctx.session().get(IPersonController.AUTHN_COOKIE_KEY);
        }

        @Override
        public Result onUnauthorized(Context ctx) {
            ObjectNode response = Json.newObject();
            response.put("error", "unauthorized");

            return unauthorized(response);
        }
    }

    public static Result auth() {
        String providerUrl = "https://www.google.com/accounts/o8/id";
        String returnToUrl = "http://localhost:9000/openID/verify";

        Map<String, String> attributes = new HashMap<>();
        attributes.put("Email", "http://schema.openid.net/contact/email");
        attributes.put("FirstName", "http://schema.openid.net/namePerson/first");
        attributes.put("LastName", "http://schema.openid.net/namePerson/last");

        F.Promise<String> redirectUrl = OpenID.redirectURL(providerUrl, returnToUrl, attributes);
        return redirect(redirectUrl.get());
    }

    public Result verify() {
        try {
            F.Promise<OpenID.UserInfo> userInfoPromise = OpenID.verifiedId();
            OpenID.UserInfo userInfo = userInfoPromise.get();
            IPerson person = controller.googleLogin(userInfo.attributes, userInfo.id);
            if (person == null) {
                flash("errors", "Login Failed");
                return badRequest(signInSeapal.render(null, routes.AccountAPI.login()));
            }

            session().clear();
            session(IPersonController.AUTHN_COOKIE_KEY, person.getId());
            return redirect(routes.Application.app());
        } catch (Exception e) {
            flash("errors", "Login Failed");
            return badRequest(signInSeapal.render(null, routes.AccountAPI.login()));
        }
    }
}
