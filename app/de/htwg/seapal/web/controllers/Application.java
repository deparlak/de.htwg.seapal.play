package de.htwg.seapal.web.controllers;

import play.data.DynamicForm;
import play.mvc.Controller;
import play.mvc.Result;
import de.htwg.seapal.model.Account;
import de.htwg.seapal.web.views.html.*;
import de.htwg.seapal.web.views.html.signInSeapal;
import de.htwg.seapal.web.views.html.signUpSeapal;

public class Application extends Controller {
    
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
        return ok(signInSeapal.render(DynamicForm.form(Account.class), routes.Account.login()));
    }
    
    public static Result signup() {
        return ok(signUpSeapal.render(DynamicForm.form(Account.class), routes.Account.signup()));
    }
    
    public static Result forbiddenContent() {
        return ok(forbiddenContent.render());
    }

    public static Result todo() {
        return ok("TODO");
    }
	
    public static Result test() {
        return ok(test.render());
    }

}
