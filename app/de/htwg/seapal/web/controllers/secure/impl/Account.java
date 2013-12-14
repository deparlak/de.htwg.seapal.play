package de.htwg.seapal.web.controllers.secure.impl;

import de.htwg.seapal.web.controllers.secure.IAccount;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

public final class Account
        extends de.htwg.seapal.model.ModelDocument
        implements IAccount {

    public String accountName;
    public String accountPassword;
    public String repeatedAccountPassword;
    private List<UUID> boats = new ArrayList<>();
    private List<UUID> trips = new ArrayList<>();

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

    @Override
    public String getRepeatedAccountPassword() {
        return this.repeatedAccountPassword;
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
    @Override
    public List<UUID> getTrips() {
        return trips;
    }
    @Override
    public void setTrips(final List<UUID> trips) {
        this.trips = trips;
    }

    @Override
    public boolean hasBoat(final UUID id) {
        return boats.contains(id);
    }

    @Override
    public void addBoat(final UUID uuid) {
        boats.add(uuid);
    }
    @Override
    public void deleteBoat(final UUID id) {
        boats.remove(id);
    }
    @Override
    public boolean hasTrip(final UUID id) {
        return trips.contains(id);
    }
    @Override
    public void deleteTrip(final UUID tripID) {
       trips.remove(tripID);
    }
}
