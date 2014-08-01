package database.impl.mock.user;

import play.Logger;
import play.Logger.ALogger;
import play.libs.F.Promise;
import database.*;
import database.model.User;


public abstract class AbstractMockUserRepository<R> implements Repository<R, User>{
    private final ALogger logger = Logger.of(getClass().getName());
    
    
    protected abstract R success(String message);
    protected abstract R failure(String message);

    @Override
    public Promise<R> create(User document, Options options) {
        return Promise.promise(() -> success("ok"));
    }

    @Override
    public Promise<R> delete(User document, Options options) {
        return Promise.promise(() -> success("ok"));
    }

    @Override
    public Promise<R> update(User document, Options options) {
        return Promise.promise(() -> success("ok"));
    }

    @Override
    public Promise<R> query(Specification specification, Options options) {
        return Promise.promise(() -> failure("Query on user is not supported"));
    }

}
