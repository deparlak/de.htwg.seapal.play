package de.htwg.seapal.database.impl;

import com.google.inject.Inject;
import com.google.inject.name.Named;
import de.htwg.seapal.utils.logging.ILogger;
import de.htwg.seapal.web.controllers.secure.IAccount;
import de.htwg.seapal.database.IAccountDatabase;
import de.htwg.seapal.web.controllers.secure.impl.Account;
import org.ektorp.CouchDbConnector;
import org.ektorp.ViewQuery;
import org.ektorp.support.CouchDbRepositorySupport;

import java.util.LinkedList;
import java.util.List;
import java.util.UUID;

public class AccountDatabase
        extends CouchDbRepositorySupport<Account>
        implements IAccountDatabase {

    private final ILogger logger;

    @Inject
    protected AccountDatabase(@Named("accountCouchDbConnector") CouchDbConnector db, ILogger logger) {
        super(Account.class, db);
        super.initStandardDesignDocument();
        this.logger = logger;
    }

    @Override
    public boolean open() {
        logger.info("PersonDatabase", "Database connection opened");
        return true;
    }

    @Override
    public UUID create() {
        return null;
    }

    @Override
    public boolean save(final IAccount data) {
        Account entity = (Account) data;

        if (entity.isNew()) {
            // ensure that the id is generated and revision is null for saving a new entity
            entity.setId(UUID.randomUUID().toString());
            entity.setRevision(null);
            add(entity);
            return true;
        }

        logger.info("PersonDatabase", "Updating entity with UUID: " + entity.getId());
        update(entity);
        return false;
    }

    @Override
    public IAccount get(final UUID id) {
        return get(id.toString());
    }

    @Override
    public List<IAccount> loadAll() {
        List<IAccount> persons = new LinkedList<IAccount>(getAll());
        logger.info("PersonDatabase", "Loaded entities. Count: " + persons.size());
        return persons;
    }

    @Override
    public void delete(final UUID id) {
        logger.info("PersonDatabase", "Removing entity with UUID: " + id.toString());
        remove((Account) get(id));
    }

    @Override
    public boolean close() {
        return true;
    }

    @Override
    public Account getAccount(final String email)
            throws Exception {
        ViewQuery query = new ViewQuery().designDocId("_design/list").viewName("names").key(email);

        List<Account> accounts = db.queryView(query, Account.class);
        if (accounts.size() > 1) {
            throw new Exception("more than one account exists!");
        } else if (accounts.size() == 0) {
            return null;
        } else {
            return accounts.get(0);
        }
    }
}
