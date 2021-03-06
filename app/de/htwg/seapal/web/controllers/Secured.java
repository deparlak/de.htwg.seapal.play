package de.htwg.seapal.web.controllers;

import play.mvc.Http.Context;
import play.mvc.Result;
import play.mvc.Security;



public class Secured extends Security.Authenticator {    
    @Override
    public String getUsername(Context ctx) {
        //TODO load this value from a static config file. Injection as in a controller is not possible
        return ctx.session().get("SyncGatewaySession");
    }

    @Override
    public Result onUnauthorized(Context ctx) {
        return redirect(routes.Application.login());
    }
}