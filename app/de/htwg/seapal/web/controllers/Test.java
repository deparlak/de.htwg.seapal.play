package de.htwg.seapal.web.controllers;

import com.google.inject.Inject;
import com.google.inject.name.Named;

import de.htwg.seapal.database.Options;
import de.htwg.seapal.database.Repository;
import de.htwg.seapal.database.SessionOptions;
import de.htwg.seapal.model.Account;
import play.libs.F.Promise;
import play.mvc.Controller;
import play.mvc.Result;

public class Test extends Controller {
    @Inject 
    @Named("UserRepository")
    private Repository<Result, Account> repository;
    
    public Promise<Result> create(String name) {
        Options o = new SessionOptions();
        Account u = new Account();
        u.setEmail("email");
        u.setPassword("password");
        return repository.create(u, o).map(resp -> resp);
    }
    
    public Promise<Result> delete() {
        Options o = new SessionOptions();
        o.setUsername("user");
        Promise<Result> response = repository.delete(null, o);
        return response.map(resp -> resp);
    }
}
