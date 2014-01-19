package de.htwg.seapal.web.controllers;

import com.google.inject.Inject;
import de.htwg.seapal.controller.IAccountController;
import de.htwg.seapal.controller.impl.PasswordHash;
import de.htwg.seapal.model.IAccount;
import de.htwg.seapal.model.IPerson;
import de.htwg.seapal.model.impl.Account;
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
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@With(Menus.class)
public class AccountAPI
        extends Controller {

    private static final long TIMEOUT = 60 * 60 * 1000;

    static Form<Account> form = Form.form(Account.class);
    private static final Pattern EMAIL_PATTERN = Pattern.compile("^[_A-Za-z0-9-\\+]+(\\.[_A-Za-z0-9-]+)*@[A-Za-z0-9-]+(\\.[A-Za-z0-9]+)*(\\.[A-Za-z]{2,})$");
    private static final int MIN_LENGTH = 8;

    @Inject
    private IAccountController controller;

    @Inject
    private ILogger logger;

    @play.mvc.Security.Authenticated(AccountAPI.SecuredAPI.class)
    public Result account() {
        String session = session(IAccountController.AUTHN_COOKIE_KEY);

        return ok(Json.toJson(controller.getInternalInfo(session)));
    }

    public Result signup() {
        Form<Account> filledForm = form.bindFromRequest();

        ObjectNode response = Json.newObject();
        Account account = filledForm.get();
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

                String error = validate(account);
                if (error != null) {
                    flash("errors", error);
                    return badRequest(signUpSeapal.render(filledForm, routes.AccountAPI.signup()));
                }

                account.setPassword(PasswordHash.createHash(account.getPassword()));
                controller.saveAccount(account);
            } catch (InvalidKeySpecException e) {
                e.printStackTrace();
            } catch (NoSuchAlgorithmException e) {
                e.printStackTrace();
            }


            session().clear();
            session(IAccountController.AUTHN_COOKIE_KEY, account.getUUID().toString());
            return redirect(routes.Application.app());
        }
    }

    public Result login() {
        Form<Account> filledForm = DynamicForm.form(Account.class).bindFromRequest();


        IAccount account = null;

        try {
            account = controller.authenticate(filledForm.get());

            if (!filledForm.hasErrors() && account != null) {
                session().clear();
                session(IAccountController.AUTHN_COOKIE_KEY, account.getUUID().toString());
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

    public Result logout() {
        session().clear();
        flash("success", "You've been logged out");
        return redirect(routes.Application.index());
    }

    public Result requestNewPassword() {
        Form<Account> filledForm = form.bindFromRequest();

        IAccount account = filledForm.get();
        List<? extends IAccount> list = controller.queryView("by_email", account.getEmail());

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

        controller.saveAccount(account);

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

        List<? extends IAccount> list = controller.queryView("resetToken", token);

        logger.error("size", Integer.toString(list.size()));

        if (list.size() == 0) {
            flash("errors", "Account does not/no longer exist!");
            return resetForm(Integer.parseInt(token));
        } else if (list.size() > 1) {
            flash("errors", "Too many equal reset tokens, Please request a new token by clicking on I forgot my password!");
            return resetForm(Integer.parseInt(token));
        }

        IAccount account = list.get(0);

        if (account.getResetTimeout() < System.currentTimeMillis()) {
            flash("errors", "Reset token expired. Please request a new token by clicking on I forgot my password!");
            return resetForm(Integer.parseInt(token));
        }

        String error = validate(account);
        if (error != null) {
            flash("errors", error);
            return resetForm(Integer.parseInt(token));
        }

        account.setResetToken("0");

        account.setResetTimeout(0);

        try {
            account.setPassword(PasswordHash.createHash(form.get("password")[0]));
            controller.saveAccount(account);
            session(IAccountController.AUTHN_COOKIE_KEY, account.getUUID().toString());
            flash("success", "You have successfully changed your password");
        } catch (InvalidKeySpecException e) {
            e.printStackTrace();
        } catch (NoSuchAlgorithmException e) {
            e.printStackTrace();
        }


        return resetForm(Integer.parseInt(token));
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

    public static String validate(IAccount account) {
        if (!validate_eMail(account.getEmail())) {
            return "Please enter a valid email adress!";
        }

        if (!checkLength(account.getPassword())) {
            return "The password you've entered is to short. Use at least " + MIN_LENGTH + " characters!";
        }

        return null;
    }

    private static boolean validate_eMail(final String hex) {
        Matcher matcher = EMAIL_PATTERN.matcher(hex);
        return matcher.matches();
    }

    private static boolean checkPasswords(IPerson account) {
        return true; //account.getPassword().equals(account.getRepeatedAccountPassword());
    }

    private static boolean checkLength(String password) {
        return password.length() >= MIN_LENGTH;
    }
}
