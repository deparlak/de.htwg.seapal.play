package de.htwg.seapal.web.global.module;

import com.fasterxml.jackson.databind.node.ObjectNode;
import com.google.inject.AbstractModule;
import com.google.inject.TypeLiteral;
import com.google.inject.name.Names;

import de.htwg.seapal.database.Repository;
import de.htwg.seapal.database.impl.*;
import de.htwg.seapal.database.impl.couchbase.*;
import de.htwg.seapal.model.Account;

public class TestModule extends AbstractModule {

    @Override
    protected void configure() {
        // configure database configuration
        bind(new TypeLiteral<ReturnWrapper<ObjectNode>>(){}).annotatedWith(Names.named("CouchbaseAccountRepository - ReturnWrapper")).to(JsonReturnWrapper.class);
        bind(new TypeLiteral<Repository<ObjectNode, Account>>(){}).annotatedWith(Names.named("AccountRepository")).to(new TypeLiteral<CouchbaseAccountRepository<ObjectNode>>(){});
        
        bind(new TypeLiteral<ReturnWrapper<ObjectNode>>(){}).annotatedWith(Names.named("CouchbaseSessionRepository - ReturnWrapper")).to(JsonReturnWrapper.class);
        bind(new TypeLiteral<Repository<ObjectNode, Account>>(){}).annotatedWith(Names.named("SessionRepository")).to(new TypeLiteral<CouchbaseSessionRepository<ObjectNode>>(){});
        
        bind(new TypeLiteral<ReturnWrapper<ObjectNode>>(){}).annotatedWith(Names.named("CouchbaseBasicHttpAuthRepository - ReturnWrapper")).to(JsonReturnWrapper.class);
        bind(new TypeLiteral<Repository<ObjectNode, Account>>(){}).annotatedWith(Names.named("AuthRepository")).to(new TypeLiteral<CouchbaseBasicHttpAuthRepository<ObjectNode>>(){});
         
         
        
        bind(String.class).annotatedWith(Names.named("SyncGateway - URL")).toInstance("http://localhost:4984/sync_gateway/");
        bind(String.class).annotatedWith(Names.named("SyncGateway - User URL")).toInstance("http://localhost:4985/sync_gateway/_user/"); 
        bind(String.class).annotatedWith(Names.named("SyncGateway - Session URL")).toInstance("http://localhost:4985/sync_gateway/_session");
        bind(String.class).annotatedWith(Names.named("SyncGateway - Basic Http Auth URL")).toInstance("http://localhost:4985/sync_gateway/_session");
        
        bind(String.class).annotatedWith(Names.named("SyncGatewayCookieName")).toInstance("SyncGatewaySession");
        
//        bind(Integer.class).annotatedWith(Names.named("databasePort")).toInstance(80);
//        bind(String.class).annotatedWith(Names.named("databaseURL")).toInstance("http://roroettg.iriscouch.com");        
//        // Use an empty implementation of the test data generator in production mode
//        bind(ISimulator.class).to(SimpleSimulator.class);
//        bind(SimulationAPI.class).to(SimulationAPIFake.class).in(Singleton.class);
    }
}
