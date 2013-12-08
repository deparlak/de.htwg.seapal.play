package de.htwg.seapal.web.controllers.secure;

import de.htwg.seapal.model.IBoat;
import de.htwg.seapal.model.ITrip;
import de.htwg.seapal.utils.observer.IObservable;
import de.htwg.seapal.web.controllers.secure.impl.Account;
import play.data.Form;

import java.security.NoSuchAlgorithmException;
import java.security.spec.InvalidKeySpecException;
import java.util.List;
import java.util.UUID;

public interface IAccountController
        extends IObservable {

    String AUTHN_COOKIE_KEY = "id";

    String getAccountName(UUID id);

    void setAccountName(UUID id, String AccountName);

    String getAccountPassword(UUID id);

    void setAccountPassword(UUID id, String Password)
            throws InvalidKeySpecException, NoSuchAlgorithmException;

    String getString(UUID id);

    UUID newAccount();

    void deleteAccount(UUID id);

    void closeDB();

    List<UUID> getAccounts();

    IAccount getAccount(UUID AccountId);

    List<IAccount> getAllAccounts();

    boolean saveAccount(IAccount Account);

    IAccount authenticate(Form<Account> form)
            throws Exception;

    void addBoat(UUID account, UUID boat);

    void deleteBoat(UUID account, UUID boat);

    void deleteBoat(UUID boatID);

    List<IBoat> getAllBoats(List<IBoat> allBoats);

    boolean hasBoat(UUID boatID);

    void addBoat(UUID boatID);

    boolean hasTrip(UUID tripID);

    List<ITrip> getAllTrips(List<ITrip> allTrips);

    void deleteTrip(UUID tripID);

    boolean accountExists(String accountName)
            throws Exception;
}

