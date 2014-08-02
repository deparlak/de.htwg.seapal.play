package controllers;

import com.google.inject.Inject;
import com.google.inject.name.Named;

import database.*;
import database.model.User;
import play.libs.F.Promise;
import play.mvc.Controller;
import play.mvc.Result;

public class Test extends Controller {
    @Inject 
    @Named("UserRepository")
    Repository<Result, User> repository;
    
    public Promise<Result> create(String name) {
        Options o = new SessionOptions();
        User u = new User();
        u.setEmail("email");
        u.setName("user");
        u.setPassword("password");
        Promise<Result> response = repository.create(u, o);
        return response.map(resp -> resp);
    }
    
    public Promise<Result> delete() {
        Options o = new SessionOptions();
        o.setUsername("user");
        Promise<Result> response = repository.delete(null, o);
        return response.map(resp -> resp);
    }
}
