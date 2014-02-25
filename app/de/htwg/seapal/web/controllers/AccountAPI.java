package de.htwg.seapal.web.controllers;

import com.google.inject.Inject;
import de.htwg.seapal.controller.IAccountController;
import de.htwg.seapal.model.IAccount;
import de.htwg.seapal.model.impl.Account;
import de.htwg.seapal.model.impl.PublicPerson;
import de.htwg.seapal.model.impl.SignupAccount;
import de.htwg.seapal.utils.logging.ILogger;
import de.htwg.seapal.web.controllers.helpers.Menus;
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

import java.util.*;
import java.util.regex.Pattern;

@With(Menus.class)
public class AccountAPI
        extends Controller {

    private static final long TIMEOUT = 60 * 60 * 1000;
    private static final Form<Account> form = Form.form(Account.class);
    private static final Pattern EMAIL_PATTERN = Pattern.compile("^[_A-Za-z0-9-\\+]+(\\.[_A-Za-z0-9-]+)*@[A-Za-z0-9-]+(\\.[A-Za-z0-9]+)*(\\.[A-Za-z]{2,})$");
    private static final int MIN_LENGTH = 8;

    @Inject
    private IAccountController controller;

    @Inject
    private ILogger logger;

    private static String validate(SignupAccount account) {
        if (!EMAIL_PATTERN.matcher(account.getEmail()).matches()) {
            return "Please enter a valid email adress!";
        }

        if (!(account.getPassword().length() >= MIN_LENGTH)) {
            return "The password you've entered is to short. Use at least " + MIN_LENGTH + " characters!";
        }

        return null;
    }

    /**
     * Method signup gets called, when the user clicks the 'create new account' button on the signup page.
     * @return
     */
    public Result signup() {
        Form<SignupAccount> filledForm = DynamicForm.form(SignupAccount.class).bindFromRequest();
        if (filledForm.hasErrors()) {
            flash("errors", filledForm.errorsAsJson().toString());
            return badRequest(signUpSeapal.render(filledForm, routes.AccountAPI.signup()));
        }

        SignupAccount account = filledForm.get();
        if (controller.accountExists(account.getEmail())) {
            flash("errors", "Account already exists");
            return badRequest(signUpSeapal.render(filledForm, routes.AccountAPI.signup()));
        }

        String error = validate(account);
        if (error != null) {
            flash("errors", error);
            return badRequest(signUpSeapal.render(filledForm, routes.AccountAPI.signup()));
        }

        UUID uuid = controller.saveAccount(account, true);
        if (uuid == null) {
            return internalServerError("Could not save account<br>This problem will be reported");
        }

        session().clear();
        session(IAccountController.AUTHN_COOKIE_KEY, uuid.toString());
        return redirect(routes.Application.app());
    }

    /**
     * Method signup gets called, when the user clicks the 'sign in' button on the login page.
     * @return
     */
    public Result login() {
        Form<Account> filledForm = DynamicForm.form(Account.class).bindFromRequest();
        if (filledForm.hasErrors()) {
            flash("errors", filledForm.errorsAsJson().toString());
            return badRequest(signInSeapal.render(filledForm, routes.AccountAPI.login()));
        }

        IAccount account = controller.authenticate(filledForm.get());

        if (account == null) {
            flash("errors", "Authentication failed");
            return badRequest(signInSeapal.render(filledForm, routes.AccountAPI.login()));
        }

        session().clear();
        session(IAccountController.AUTHN_COOKIE_KEY, account.getUUID().toString());
        flash("success", "You've been logged in");
        return redirect(routes.Application.app());
    }

    /**
     * this method gets called, when the user clicks the 'send link to reset password' on the request new password page.
     * @return
     */
    public Result requestNewPassword() {
        Form<Account> filledForm = form.bindFromRequest();

        IAccount account = filledForm.get();
        List<? extends IAccount> list = controller.queryView("by_email", account.getEmail());

        if (list.size() == 0 || list.size() > 1) {
            flash("errors", "An internal error occured. Please try again!");
            return redirect(routes.Application.forgotten());
        }

        account =  list.get(0);

        if (account == null) {
            flash("errors", "An internal error occured. Please try again!");
            return redirect(routes.Application.forgotten());
        }

        Random rand = new Random(System.currentTimeMillis());
        int token = rand.nextInt(); // TODO: check if regex ^\s*-?[0-9]{1,10}\s*$ matches all possible return values of Random.nextInt()

        account.setResetToken(Integer.toString(token));

        account.setResetTimeout(System.currentTimeMillis() + TIMEOUT);

        controller.saveAccount(account, false);

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

    /**
     * this route gets called when the user actually entered his new password
     * @return
     */
    public Result resetPassword() {
        Map<String, String[]> form = request().body().asFormUrlEncoded();

        String token = form.get("token")[0];

        logger.error("Token", token);

        List<? extends IAccount> list = controller.queryView("resetToken", token);

        logger.error("size", Integer.toString(list.size()));

        if (list.size() == 0) {
            flash("errors", "Account does not/no longer exist!");
            return Application.resetForm(Integer.parseInt(token));
        } else if (list.size() > 1) {
            flash("errors", "Too many equal reset tokens, Please request a new token by clicking on I forgot my password!");
            return Application.resetForm(Integer.parseInt(token));
        }

        IAccount account = list.get(0);

        if (account.getResetTimeout() < System.currentTimeMillis()) {
            flash("errors", "Reset token expired. Please request a new token by clicking on I forgot my password!");
            return Application.resetForm(Integer.parseInt(token));
        }

        if (form.get("password")[0].length() > MIN_LENGTH) {
            flash("errors", "password too short");
            return Application.resetForm(Integer.parseInt(token));
        }

        account.setResetToken("0");

        account.setResetTimeout(0);

        account.setPassword(form.get("password")[0]);
        controller.saveAccount(account, true);
        session(IAccountController.AUTHN_COOKIE_KEY, account.getUUID().toString());
        flash("success", "You have successfully changed your password");


        return Application.resetForm(Integer.parseInt(token));
    }

    /**
     * this route redirects the user to the Google servers for OpenID authentication
     * @return
     */
    public Result auth() {
        String providerUrl = "https://www.google.com/accounts/o8/id";
        String returnToUrl = routes.AccountAPI.verify().absoluteURL(request());

        Map<String, String> attributes = new HashMap<>();
        attributes.put(IAccountController.KEY_EMAIL, "http://schema.openid.net/contact/email");
        attributes.put(IAccountController.KEY_FIRST_NAME, "http://schema.openid.net/namePerson/first");
        attributes.put(IAccountController.KEY_LAST_NAME, "http://schema.openid.net/namePerson/last");

        return redirect(OpenID.redirectURL(providerUrl, returnToUrl, attributes).get());
    }

    /**
     * this route handles the OpenID authN request, when the user gets redirected back from Google servers to us.
     * @return
     */
    public Result verify() {
        String[] modes = request().queryString().get("openid.mode");
        if (modes != null) {
            for (String mode : modes) {
                if (mode.equals("cancel")) {
                    flash("errors", "Login Failed");
                    return badRequest(signInSeapal.render(null, routes.AccountAPI.login()));
                }
            }
        }

        F.Promise<OpenID.UserInfo> userInfoPromise = OpenID.verifiedId();
        OpenID.UserInfo userInfo = userInfoPromise.get();

        IAccount person = controller.googleLogin(userInfo.attributes, userInfo.id);
        if (person == null) {
            flash("errors", "Login Failed");
            return badRequest(signInSeapal.render(null, routes.AccountAPI.login()));
        }

        session().clear();
        session(IAccountController.AUTHN_COOKIE_KEY, person.getId());
        return redirect(routes.Application.app());
    }

    /**
     * logout route, clear session cookie.
     * @return
     */
    @play.mvc.Security.Authenticated(AccountAPI.Secured.class)
    public Result logout() {
        session().clear();
        flash("success", "You've been logged out");
        return redirect(routes.Application.index());
    }

    /**
     * retrieve account data (id, friendlists)
     * @return
     */
    @play.mvc.Security.Authenticated(AccountAPI.SecuredAPI.class)
    public Result account() {
        String session = session(IAccountController.AUTHN_COOKIE_KEY);

        PublicPerson s = controller.getInternalInfo(session, session);
        if (s != null) {
            return ok(Json.toJson(s));
        } else {
            ObjectNode response = Json.newObject();
            response.put("error", "unauthorized");

            return unauthorized(response);
        }
    }

    private static class Secured
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

    public static class SecuredAPI
            extends Security.Authenticator {

        @Override
        public String getUsername(Context ctx) {
            return ctx.session().get(IAccountController.AUTHN_COOKIE_KEY);
        }

        @Override
        public Result onUnauthorized(Context ctx) {
            ObjectNode response = Json.newObject();
            response.put("error", "unauthorized");

            return unauthorized(response);
        }
    }
}
