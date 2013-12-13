package de.htwg.seapal.database;

import de.htwg.seapal.web.controllers.secure.IAccount;
import de.htwg.seapal.web.controllers.secure.impl.Account;

public interface IAccountDatabase extends de.htwg.seapal.database.IDatabase<IAccount> {

    Account getAccount(String email)
            throws Exception;
}
