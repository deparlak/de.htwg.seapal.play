package de.htwg.seapal.web.controllers.secure.impl;

import de.htwg.seapal.web.controllers.secure.IAccount;

import java.util.List;
import java.util.UUID;

public final class Account
        extends de.htwg.seapal.model.ModelDocument
        implements IAccount {

    public String accountName;
    public String accountPassword;
    private List<UUID> boats;

    public Account() {
        setId(UUID.randomUUID().toString());
        this.accountName = "";
        this.accountPassword = "";
    }

    public Account(IAccount account) {
        setId(account.getId());
        this.accountName = account.getAccountName();
        this.accountPassword = account.getAccountPassword();
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

    @Override
    public void setAccountPassword(final String password) {
        this.accountPassword = password;
    }

    @Override
    public List<UUID> getBoats() {
        return boats;
    }

    @Override
    public void setBoats(final List<UUID> boats) {
        this.boats = boats;
    }

    public boolean hasBoat(final UUID id) {
        return boats.contains(id);
    }
}
