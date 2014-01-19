package de.htwg.seapal.database.impl;

import com.google.inject.Inject;
import com.google.inject.name.Named;
import de.htwg.seapal.database.IAccountDatabase;
import de.htwg.seapal.model.IAccount;
import de.htwg.seapal.model.impl.Account;
import de.htwg.seapal.utils.logging.ILogger;
import org.ektorp.CouchDbConnector;
import org.ektorp.DocumentNotFoundException;
import org.ektorp.support.CouchDbRepositorySupport;

import java.util.ArrayList;
import java.util.LinkedList;
import java.util.List;
import java.util.UUID;

public final class AccountDatabase extends CouchDbRepositorySupport<Account>
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
        logger.info("AccountDatabase", "Database connection opened");
        return true;
    }

    @Override
    public UUID create() {
        return null;
    }

    @Override
    public boolean save(IAccount data) {
        Account entity = (Account) data;

        if (entity.isNew()) {
            // ensure that the id is generated and revision is null for saving a new entity
            entity.setRevision(null);
            add(entity);
            return true;
        }

        logger.info("AccountDatabase", "Updating entity with UUID: " + entity.getId());
        update(entity);
        return false;
    }

    @Override
    public IAccount get(UUID id) {
        try {
            return get(id.toString());
        } catch (DocumentNotFoundException e) {
            return null;
        }
    }

    @Override
    public List<IAccount> loadAll() {
        List<IAccount> Accounts = new LinkedList<IAccount>(getAll());
        logger.info("AccountDatabase", "Loaded entities. Count: " + Accounts.size());
        return Accounts;
    }

    @Override
    public void delete(UUID id) {
        logger.info("AccountDatabase", "Removing entity with UUID: " + id.toString());
        remove((Account) get(id));
    }

    @Override
    public boolean close() {
        return true;
    }

    @Override
    public List<? extends IAccount> queryViews(final String viewName, final String key) {
        try {
            return super.queryView(viewName, key);
        } catch (DocumentNotFoundException e) {
            return new ArrayList<>();
        }
    }

    @Override
    public Account getAccount(final String email) {
        List<Account> accounts = super.queryView("by_email", email);
        if (accounts.size() > 1 || accounts.size() < 1) {
            return null;
        } else {
            return accounts.get(0);
        }
    }
}
