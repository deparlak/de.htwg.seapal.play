package de.htwg.seapal.database.impl.couchbase;

import java.util.ArrayList;
import java.util.List;

import de.htwg.seapal.model.Account;

public class CouchbaseAccount extends Account {
    private String name;
    private List<String> admin_channels;

    public CouchbaseAccount(Account document) {
        super(document);
        this.name = document.getEmail();
        this.admin_channels = new ArrayList<String>();
        this.admin_channels.add(this.name);
        this.admin_channels.add("test");
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }
    
    public List<String> getAdmin_channels() {
        return admin_channels;
    }
    
    public void setAdmin_channels(List<String> channels) {
        admin_channels = channels;
    }
    
    public boolean addAdminChannel(String channel) {
        return admin_channels.add(channel);
    }
    
    public boolean removeAdminChannel(String channel) {
        return admin_channels.remove(channel);
    }

}
