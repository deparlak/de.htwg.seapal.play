package de.htwg.seapal.database.impl;

import play.mvc.Result;

public class PlayResultReturnWrapper implements ReturnWrapper<Result>{

    public Result ok(String message) {
        return play.mvc.Controller.ok(message);
    }


    public Result badRequest(String message) {
        return play.mvc.Controller.badRequest(message);
    }


    public Result notFound(String message) {
        return play.mvc.Controller.notFound(message);
    }

    
    public Result unauthorized(String message) {
        return play.mvc.Controller.unauthorized(message);
    }

    
    public Result forbidden(String message) {
        return play.mvc.Controller.forbidden(message);
    }

    
    public Result internalServerError(String message) {
        return play.mvc.Controller.internalServerError(message);
    }

    public Result notSupported(String message) {
        return play.mvc.Controller.internalServerError(message);
    }

    public Result authorized(String message) {
        return play.mvc.Controller.ok(message);
    }
}
