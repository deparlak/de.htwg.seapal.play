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
        Promise<Result> response = repository.create(new User());
        return response.map(resp -> resp);
    }
}
