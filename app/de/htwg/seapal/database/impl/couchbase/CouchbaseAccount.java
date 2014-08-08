package de.htwg.seapal.database.impl.couchbase;

import org.apache.commons.codec.binary.Hex;

import de.htwg.seapal.model.Account;

public class CouchbaseAccount extends Account {
    private String name;

    public CouchbaseAccount(Account document) {
        super(document);
        this.name = Hex.encodeHexString(document.getEmail().getBytes(/* charset */));
        System.out.println(this.name);
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

}
