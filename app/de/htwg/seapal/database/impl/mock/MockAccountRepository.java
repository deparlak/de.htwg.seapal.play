package de.htwg.seapal.database.impl.mock;

import com.google.inject.Inject;
import com.google.inject.name.Named;

import de.htwg.seapal.database.Options;
import de.htwg.seapal.database.Repository;
import de.htwg.seapal.database.Specification;
import de.htwg.seapal.database.impl.ReturnWrapper;
import de.htwg.seapal.model.Account;
import play.libs.F.Promise;


public class MockAccountRepository<R> implements Repository<R, Account>{
    @Inject
    @Named("MockAccountRepository - ReturnWrapper")
    ReturnWrapper<R> status;

    @Override
    public Promise<R> create(Account document, Options options) {
        return Promise.promise(() -> status.ok("ok"));
    }

    @Override
    public Promise<R> delete(Account document, Options options) {
        return Promise.promise(() -> status.ok("ok"));
    }

    @Override
    public Promise<R> update(Account document, Options options) {
        return Promise.promise(() -> status.ok("ok"));
    }

    @Override
    public Promise<R> query(Specification specification, Options options) {
        return Promise.promise(() -> status.notSupported("Query on user is not supported"));
    }

}
