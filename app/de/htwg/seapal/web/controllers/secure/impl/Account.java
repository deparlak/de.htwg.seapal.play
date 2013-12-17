package de.htwg.seapal.web.controllers.secure.impl;

import de.htwg.seapal.web.controllers.secure.IAccount;

import java.util.UUID;
import org.codehaus.jackson.annotate.JsonIgnore;

public final class Account
        extends de.htwg.seapal.model.ModelDocument
        implements IAccount {

    public String accountName;
    public String accountPassword;
    public String repeatedAccountPassword;

    public Account() {
        setId(UUID.randomUUID().toString());
        this.accountName = "";
        this.accountPassword = "";
        this.repeatedAccountPassword = "";
    }

    public Account(IAccount account) {
        setId(account.getId());
        this.accountName = account.getAccountName();
        this.accountPassword = account.getAccountPassword();
        this.repeatedAccountPassword = account.getRepeatedAccountPassword();
    }

    @Override
    public String getAccountName() {
        return accountName;
    }

    @Override
    public void setAccountName(final String email) {
        this.accountName = email;
    }

    @Override
    public String getAccountPassword() {
        return this.accountPassword;
    }

    @JsonIgnore
    @Override
    public String getRepeatedAccountPassword() {
        return this.repeatedAccountPassword;
    }

    @Override
    public void setAccountPassword(final String password) {
        this.accountPassword = password;
    }
}
