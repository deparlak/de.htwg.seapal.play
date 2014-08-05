package de.htwg.seapal.web.global.module;

import play.mvc.Result;

import com.google.inject.AbstractModule;
import com.google.inject.TypeLiteral;
import com.google.inject.name.Names;

import de.htwg.seapal.database.Repository;
import de.htwg.seapal.database.impl.*;
import de.htwg.seapal.database.impl.couchbase.CouchbaseAccountRepository;
import de.htwg.seapal.model.Account;

public class TestModule extends AbstractModule {

    @Override
    protected void configure() {
        // configure database configuration
        bind(new TypeLiteral<ReturnWrapper<Result>>(){}).annotatedWith(Names.named("CouchbaseAccountRepository - ReturnWrapper")).to(PlayResultReturnWrapper.class);
        bind(new TypeLiteral<Repository<Result, Account>>(){}).annotatedWith(Names.named("AccountRepository")).to(new TypeLiteral<CouchbaseAccountRepository<Result>>(){});
        
        
        
        
        bind(String.class).annotatedWith(Names.named("Database Controller - SyncGateway Client URL")).toInstance("http://localhost:4984/sync_gateway/");  
        bind(String.class).annotatedWith(Names.named("CouchbaseAccountRepository - URL")).toInstance("http://localhost:4985/sync_gateway/_user/");        
        bind(Integer.class).annotatedWith(Names.named("CouchbaseAccountRepository - Timeout")).toInstance(120000);   
        
        
//        bind(Integer.class).annotatedWith(Names.named("databasePort")).toInstance(80);
//        bind(String.class).annotatedWith(Names.named("databaseURL")).toInstance("http://roroettg.iriscouch.com");        
//        // Use an empty implementation of the test data generator in production mode
//        bind(ISimulator.class).to(SimpleSimulator.class);
//        bind(SimulationAPI.class).to(SimulationAPIFake.class).in(Singleton.class);
    }
}