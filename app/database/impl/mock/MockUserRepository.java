package database.impl.mock;

import com.google.inject.Inject;
import com.google.inject.name.Named;

import play.libs.F.Promise;
import database.*;
import database.impl.ReturnWrapper;
import database.model.User;


public class MockUserRepository<R> implements Repository<R, User>{
    @Inject
    @Named("MockUserRepository - ReturnWrapper")
    ReturnWrapper<R> status;

    @Override
    public Promise<R> create(User document, Options options) {
        return Promise.promise(() -> status.ok("ok"));
    }

    @Override
    public Promise<R> delete(User document, Options options) {
        return Promise.promise(() -> status.ok("ok"));
    }

    @Override
    public Promise<R> update(User document, Options options) {
        return Promise.promise(() -> status.ok("ok"));
    }

    @Override
    public Promise<R> query(Specification specification, Options options) {
        return Promise.promise(() -> status.notSupported("Query on user is not supported"));
    }

}
