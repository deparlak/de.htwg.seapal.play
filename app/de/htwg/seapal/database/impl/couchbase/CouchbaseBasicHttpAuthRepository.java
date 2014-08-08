package de.htwg.seapal.database.impl.couchbase;

import com.google.inject.Inject;
import com.google.inject.name.Named;

import de.htwg.seapal.database.Options;
import de.htwg.seapal.database.Repository;
import de.htwg.seapal.database.Specification;
import de.htwg.seapal.database.impl.ReturnWrapper;
import de.htwg.seapal.model.Account;
import play.Logger;
import play.Logger.ALogger;
import play.libs.F.Promise;
import play.libs.ws.*;


public class CouchbaseBasicHttpAuthRepository<R> implements Repository<R, Account>{
    private final ALogger logger = Logger.of(getClass().getName());
    
    @Inject
    @Named("SyncGateway - Basic Http Auth URL")
    private String sessionUrl;
    @Inject
    @Named("CouchbaseBasicHttpAuthRepository - ReturnWrapper")
    ReturnWrapper<R> status;

    @Override
    public Promise<R> create(Account document, Options options) {
        CouchbaseAccount couchDocument = new CouchbaseAccount(document);
        logger.info("Login with Http Auth to sync Gateway");
        WSRequestHolder holder = WS.url(sessionUrl);
        holder.setAuth(couchDocument.getName(), couchDocument.getPassword(), WSAuthScheme.BASIC);
        
        return holder.get().map(response -> {
            logger.info("Got response from sync Gateway for Http Auth : "+response.getStatusText());
            
            if (200 == response.getStatus()) {
                return status.ok("credentials are correct");
            } else {
                return status.badRequest(response.asJson().get("reason").asText());
            }
        });
    }

    @Override
    public Promise<R> delete(Account document, Options options) {
        return Promise.promise(() -> status.notSupported("Delete Http Auth is not supported"));
    }

    @Override
    public Promise<R> update(Account document, Options options) {
        return Promise.promise(() -> status.notSupported("Update Http Auth is not supported"));
    }

    @Override
    public Promise<R> query(Specification specification, Options options) {
        return Promise.promise(() -> status.notSupported("Query Http Auth is not supported"));
    }

}
