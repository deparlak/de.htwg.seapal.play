package de.htwg.seapal.database.impl.couchbase;

import de.htwg.seapal.model.Account;

public class CouchbaseAccount extends Account {
    private String name;

    public CouchbaseAccount(Account document) {
        super(document);
        this.name = document.getEmail();
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

}
