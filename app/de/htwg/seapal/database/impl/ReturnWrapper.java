package de.htwg.seapal.database.impl;

public interface ReturnWrapper<R> {
    R ok(String message);
    R badRequest(String message);
    R notFound(String message);
    R unauthorized(String message);
    R forbidden(String message);
    R internalServerError(String message);
    R notSupported(String message);
    R authorized(String message);
    R cookie(String name, String value);
}
