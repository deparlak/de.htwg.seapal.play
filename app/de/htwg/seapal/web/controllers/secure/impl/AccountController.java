package de.htwg.seapal.web.controllers.secure.impl;

import com.google.inject.Inject;
import de.htwg.seapal.database.IAccountDatabase;
import de.htwg.seapal.utils.logging.ILogger;
import de.htwg.seapal.utils.observer.Observable;
import de.htwg.seapal.web.controllers.helpers.PasswordHash;
import de.htwg.seapal.web.controllers.secure.IAccount;
import de.htwg.seapal.web.controllers.secure.IAccountController;
import play.data.Form;

import java.security.NoSuchAlgorithmException;
import java.security.spec.InvalidKeySpecException;
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
        if (boat == null) { return null; }
        return boat.getAccountName();
    }

    @Override
    public void setAccountName(final UUID id, final String accountName) {
        IAccount account = db.get(id);
        if (account == null) { return; }
        account.setAccountName(accountName);
        db.save(account);
        notifyObservers();
    }

    @Override
    public String getAccountPassword(final UUID id) {
        IAccount boat = db.get(id);
        if (boat == null) { return null; }
        return boat.getAccountPassword();
    }

    @Override
    public void setAccountPassword(final UUID id, final String password)
            throws InvalidKeySpecException, NoSuchAlgorithmException {
        IAccount account = db.get(id);
        if (account == null) {
            return;
        }

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

    @Override
    public IAccount authenticate(final Form<Account> form)
            throws Exception {
        IAccount account = db.getAccount(form.get().accountName);

        if (PasswordHash.validatePassword(form.get().accountPassword, account.getAccountPassword())) {
            return account;
        }

        return null;
    }

    @Override
    public boolean accountExists(final String email)
            throws Exception {
        return db.getAccount(email) != null;
    }
    @Override
    public List<? extends IAccount> queryView(final String viewName, final String key) {
        return db.queryViews(viewName, key);
    }
}
