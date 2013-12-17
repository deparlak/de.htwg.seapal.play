package de.htwg.seapal.web.controllers.secure;

import de.htwg.seapal.model.IModel;

public interface IAccount
        extends IModel {

    String getAccountName();

    void setAccountName(String email);

    String getAccountPassword();

    String getRepeatedAccountPassword();

    void setAccountPassword(String password);
}
