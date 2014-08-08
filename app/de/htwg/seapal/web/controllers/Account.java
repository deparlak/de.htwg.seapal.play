package de.htwg.seapal.web.controllers;

import java.util.regex.Pattern;

import com.fasterxml.jackson.databind.node.ObjectNode;
import com.google.inject.Inject;
import com.google.inject.name.Named;

import de.htwg.seapal.database.Options;
import de.htwg.seapal.database.Repository;
import de.htwg.seapal.database.SessionOptions;
import de.htwg.seapal.web.views.html.signInSeapal;
import de.htwg.seapal.web.views.html.signUpSeapal;
import play.data.DynamicForm;
import play.data.Form;
import play.libs.F.Promise;
import play.mvc.Controller;
import play.mvc.Result;

public class Account extends Controller {
    private static final Pattern EMAIL_PATTERN = Pattern.compile("^[_A-Za-z0-9-\\+]+(\\.[_A-Za-z0-9-]+)*@[A-Za-z0-9-]+(\\.[A-Za-z0-9]+)*(\\.[A-Za-z]{2,})$");
    private static final int MIN_LENGTH = 8;
    
    @Inject 
    @Named("AccountRepository")
    private Repository<ObjectNode, de.htwg.seapal.model.Account> accountRepository;
    @Inject 
    @Named("SessionRepository")
    private Repository<ObjectNode, de.htwg.seapal.model.Account> sessionRepository;
    @Inject 
    @Named("AuthRepository")
    private Repository<ObjectNode, de.htwg.seapal.model.Account> authRepository;
    @Inject 
    @Named("SyncGatewayCookieName")
    private String sessionCookie;
    
    @play.mvc.Security.Authenticated(Secured.class)
    public Result logout() {
        session().clear();
        return redirect(routes.Application.login());
    }

    public Promise<Result> login() {
        Form<de.htwg.seapal.model.Account> filledForm = DynamicForm.form(de.htwg.seapal.model.Account.class).bindFromRequest();
        if (filledForm.hasErrors()) {
            flash("errors", filledForm.errorsAsJson().toString());
            return Promise.promise(() -> badRequest(signUpSeapal.render(filledForm, routes.Account.signup())));
        }
        
        de.htwg.seapal.model.Account account = filledForm.get();
        Options session = new SessionOptions();

//        final Promise<WSResponse> responseThreePromise = WS.url(urlOne).get()
//                .flatMap(responseOne -> WS.url(responseOne.getBody()).get())
//                .flatMap(responseTwo -> WS.url(responseTwo.getBody()).get());
//        
        //call the Auth Repository and check if the user get access.
        final Promise<ObjectNode> retVal = authRepository.create(account, session)
            .flatMap(authResponse -> {
                    if (authResponse.has("error")) {
                        return Promise.pure(authResponse);
                    }
                    return sessionRepository.create(account, session);
            });
        
        //Return an error or the user session, provided by the sessionRepository
        return retVal.map(resp -> { 
            if (resp.has("error")) {
                flash("errors", resp.get("error").asText());
                return badRequest(signInSeapal.render(filledForm, routes.Account.login())); 
            } else {
                System.out.println("Session : "+resp.get("ok").asText());
                session(sessionCookie, resp.get("ok").asText());
                return redirect(routes.Application.test());
            }
        });
    }
    
    public Promise<Result> signup() {
        Form<de.htwg.seapal.model.Account> filledForm = DynamicForm.form(de.htwg.seapal.model.Account.class).bindFromRequest();
        if (filledForm.hasErrors()) {
            flash("errors", filledForm.errorsAsJson().toString());
            return Promise.promise(() -> badRequest(signUpSeapal.render(filledForm, routes.Account.signup())));
        }
        de.htwg.seapal.model.Account account = filledForm.get();
        if (!EMAIL_PATTERN.matcher(account.getEmail()).matches()) {
            flash("errors", "Please enter a valid email adress!");
            return Promise.promise(() ->  badRequest(signUpSeapal.render(filledForm, routes.Account.signup())));
        }

        if (!(account.getPassword().length() >= MIN_LENGTH)) {
            flash("errors", "The password you've entered is to short. Use at least " + MIN_LENGTH + " characters!");
            return Promise.promise(() ->  badRequest(signUpSeapal.render(filledForm, routes.Account.signup())));
        }
        
        Options session = new SessionOptions();
        return accountRepository.create(account, session).map(resp -> {
            if (resp.has("error")) {
                flash("errors", resp.get("error").asText());
                return badRequest(signUpSeapal.render(filledForm, routes.Account.signup())); 
            } else {
                return redirect(routes.Application.login());
            }
        });
    }
}
