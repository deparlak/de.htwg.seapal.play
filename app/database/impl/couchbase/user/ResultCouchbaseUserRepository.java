package database.impl.couchbase.user;

import play.mvc.Result;

public class ResultCouchbaseUserRepository extends AbstractCouchbaseUserRepository<Result>{

    @Override
    protected Result ok(String message) {
        return play.mvc.Controller.ok(message);
    }

    @Override
    protected Result badRequest(String message) {
        return play.mvc.Controller.badRequest(message);
    }

    @Override
    protected Result notFound(String message) {
        return play.mvc.Controller.notFound(message);
    }

    @Override
    protected Result unauthorized(String message) {
        return play.mvc.Controller.unauthorized(message);
    }

    @Override
    protected Result forbidden(String message) {
        return play.mvc.Controller.forbidden(message);
    }

    @Override
    protected Result internalServerError(String message) {
        return play.mvc.Controller.internalServerError(message);
    }

}
