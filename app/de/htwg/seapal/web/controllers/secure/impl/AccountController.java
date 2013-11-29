package de.htwg.seapal.web.controllers.secure.impl;

import com.google.inject.Inject;
import de.htwg.seapal.utils.logging.ILogger;
import de.htwg.seapal.utils.observer.Observable;
import de.htwg.seapal.web.controllers.secure.IAccount;
import de.htwg.seapal.web.controllers.secure.IAccountController;
import de.htwg.seapal.web.controllers.secure.IAccountDatabase;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

public final class AccountController
        extends Observable
        implements IAccountController {

    protected IAccountDatabase db;
    private final ILogger logger;

    @Inject
    public AccountController(IAccountDatabase db, ILogger logger) {
        this.db = db;
        this.logger = logger;
    }

    @Override
    public String getAccountName(final UUID id) {
        IAccount boat = db.get(id);
        if (boat == null)
            return null;
        return boat.getAccountName();
    }

    @Override
    public void setAccountName(final UUID id, final String accountName) {
        IAccount account = db.get(id);
        if (account == null)
            return;
        account.setAccountName(accountName);
        db.save(account);
        notifyObservers();
    }

    @Override
    public String getAccountPassword(final UUID id) {
        IAccount boat = db.get(id);
        if (boat == null)
            return null;
        return boat.getAccountPassword();
    }

    @Override
    public void setAccountPassword(final UUID id, final String password) {
        IAccount account = db.get(id);
        if (account == null)
            return;
        account.setAccountPassword(password);
        db.save(account);
        notifyObservers();
    }

    @Override
    public String getString(final UUID id) {
        return "ID = " + id + " \n" + "AccountName = " + getAccountName(id) + "\n" + "AccountPassword = " + getAccountPassword(id);
    }

    @Override
    public UUID newAccount() {
        UUID account = db.create();
        return account;
    }

    @Override
    public void deleteAccount(final UUID id) {
        db.delete(id);
        notifyObservers();
    }

    @Override
    public void closeDB() {
        db.close();
        logger.info("BoatController", "Database closed");
    }

    @Override
    public List<UUID> getAccounts() {
        List<IAccount> query = db.loadAll();
        List<UUID> list = new ArrayList<UUID>();
        for (IAccount account : query) {
            list.add(account.getUUID());
        }
        return list;
    }

    @Override
    public IAccount getAccount(final UUID accountId) {
        return db.get(accountId);
    }

    @Override
    public List<IAccount> getAllAccounts() {
        return db.loadAll();
    }

    @Override
    public boolean saveAccount(final IAccount account) {
        return db.save(account);
    }

    public IAccount authenticate(final String email, final String password) {
        List<IAccount> list = getAllAccounts();
        for (IAccount account : list) {
            System.out.println(account);
            if (account.getAccountName().equals(email) && account.getAccountPassword().equals(password)) {
                return account;
            }
        }

        return null;
    }

    public IAccount findById(final String email) {
        List<IAccount> list = getAllAccounts();
        for (IAccount account : list) {
            if (account.getAccountName().equals(email)) {
                return account;
            }
        }

        return null;
    }
}
