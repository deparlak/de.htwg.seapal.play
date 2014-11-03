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
        // TODO : set the URL to the Sync Gateway
        String syncGatewayInterface = "http://localhost:4984/sync_gateway/";
        String syncGatewayAdminInterface = "http://localhost:4985/sync_gateway/";
    
    
        // configure database configuration
        bind(new TypeLiteral<ReturnWrapper<ObjectNode>>(){}).annotatedWith(Names.named("CouchbaseAccountRepository - ReturnWrapper")).to(JsonReturnWrapper.class);
        bind(new TypeLiteral<Repository<ObjectNode, Account>>(){}).annotatedWith(Names.named("AccountRepository")).to(new TypeLiteral<CouchbaseAccountRepository<ObjectNode>>(){});
        
        bind(new TypeLiteral<ReturnWrapper<ObjectNode>>(){}).annotatedWith(Names.named("CouchbaseSessionRepository - ReturnWrapper")).to(JsonReturnWrapper.class);
        bind(new TypeLiteral<Repository<ObjectNode, Account>>(){}).annotatedWith(Names.named("SessionRepository")).to(new TypeLiteral<CouchbaseSessionRepository<ObjectNode>>(){});
        
        bind(new TypeLiteral<ReturnWrapper<ObjectNode>>(){}).annotatedWith(Names.named("CouchbaseBasicHttpAuthRepository - ReturnWrapper")).to(JsonReturnWrapper.class);
        bind(new TypeLiteral<Repository<ObjectNode, Account>>(){}).annotatedWith(Names.named("AuthRepository")).to(new TypeLiteral<CouchbaseBasicHttpAuthRepository<ObjectNode>>(){});
         
        // configure Sync Gateway Routes.
        bind(String.class).annotatedWith(Names.named("SyncGateway - URL")).toInstance(syncGatewayInterface);
        bind(String.class).annotatedWith(Names.named("SyncGateway - User URL")).toInstance(syncGatewayAdminInterface+"_user/"); 
        bind(String.class).annotatedWith(Names.named("SyncGateway - Session URL")).toInstance(syncGatewayAdminInterface+"_session");
        bind(String.class).annotatedWith(Names.named("SyncGateway - Basic Http Auth URL")).toInstance(syncGatewayAdminInterface+"_session");
        
        bind(String.class).annotatedWith(Names.named("SyncGatewayCookieName")).toInstance("SyncGatewaySession");
    }
}
