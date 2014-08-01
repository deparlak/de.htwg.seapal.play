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
    public Promise<R> create(User document) {
        logger.info("try to create user");
        return Promise.promise(() -> success("Successfully created user"));
    }

    @Override
    public Promise<R> delete(User document) {
        return Promise.promise(() -> success("Successfully deleted user"));
    }

    @Override
    public Promise<R> update(User document) {
        return Promise.promise(() -> success("Successfully updated user"));
    }

    @Override
    public Promise<R> query(Specification specification) {
        return Promise.promise(() -> failure("Query on user is not supported"));
    }

}
