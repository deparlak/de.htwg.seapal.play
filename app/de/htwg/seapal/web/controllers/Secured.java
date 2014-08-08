package de.htwg.seapal.web.controllers;

import com.google.inject.Inject;
import com.google.inject.name.Named;

import play.mvc.Http.Context;
import play.mvc.Result;
import play.mvc.Security;



public class Secured extends Security.Authenticator {
    @Inject 
    @Named("SyncGatewayCookieName")
    String sessionCookie;
    
    @Override
    public String getUsername(Context ctx) {
        return ctx.session().get(sessionCookie);
    }

    @Override
    public Result onUnauthorized(Context ctx) {
        return redirect(routes.Application.login());
    }
}