package de.htwg.seapal.web.controllers.secure.impl;

import com.google.inject.Inject;
import de.htwg.seapal.database.IAccountDatabase;
import de.htwg.seapal.model.IBoat;
import de.htwg.seapal.model.ITrip;
import de.htwg.seapal.utils.logging.ILogger;
import de.htwg.seapal.utils.observer.Observable;
import de.htwg.seapal.web.controllers.helpers.Intersection;
import de.htwg.seapal.web.controllers.helpers.PasswordHash;
import de.htwg.seapal.web.controllers.secure.IAccount;
import de.htwg.seapal.web.controllers.secure.IAccountController;
import play.data.Form;

import java.security.NoSuchAlgorithmException;
import java.security.spec.InvalidKeySpecException;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

import static play.mvc.Controller.session;

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
    public boolean saveAccount(final IAccount account)  {
        return db.save(account);
    }

    public IAccount authenticate(final Form<Account> form)
            throws InvalidKeySpecException, NoSuchAlgorithmException {
        List<IAccount> list = getAllAccounts();
        for (IAccount account : list) {
            if (account.getAccountName().equals(form.get().accountName) && PasswordHash.validatePassword(form.get().accountPassword, account.getAccountPassword())) {
                return account;
            }
        }

        return null;
    }
    @Override
    public void addBoat(final UUID account, final UUID boat) {
        IAccount account1 = getAccount(account);
        account1.getBoats().add(boat);
        saveAccount(account1);
    }
    @Override
    public void deleteBoat(final UUID account, final UUID boat) {
        IAccount account1 = getAccount(account);
        account1.getBoats().remove(boat);
        saveAccount(account1);
    }

    private IAccount getAccount() {
        String id = session().get(AUTHN_COOKIE_KEY);
        UUID uuid = UUID.fromString(id);
        return getAccount(uuid);
    }

    @Override
    public void deleteBoat(final UUID boatID) {
        IAccount account = getAccount();
        account.deleteBoat(boatID);
        saveAccount(account);
    }

    @Override
    public List<IBoat> getAllBoats(final List<IBoat> allBoats) {
        return new Intersection<>(allBoats).select(getAccount().getBoats());
    }

    @Override
    public boolean hasBoat(final UUID boatID) {
        return getAccount().hasBoat(boatID);
    }

    @Override
    public void addBoat(final UUID boatID) {
        IAccount account = getAccount();
        account.addBoat(boatID);
        saveAccount(account);
    }

    @Override
    public boolean hasTrip(final UUID tripID) {
        return getAccount().hasTrip(tripID);
    }

    @Override
    public List<ITrip> getAllTrips(final List<ITrip> allTrips) {
        return new Intersection<>(allTrips).select(getAccount().getTrips());
    }

    @Override
    public void deleteTrip(final UUID tripID) {
        IAccount account = getAccount();
        account.deleteTrip(tripID);
        saveAccount(account);
    }

    @Override
    public boolean accountExists(final String email) {
        return db.accountExists(email);
    }
}
