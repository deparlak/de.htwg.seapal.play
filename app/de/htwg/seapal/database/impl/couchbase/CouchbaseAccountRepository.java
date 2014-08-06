package de.htwg.seapal.database.impl.couchbase;

import play.libs.Json;

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


public class CouchbaseAccountRepository<R> implements Repository<R, Account>{
    private final ALogger logger = Logger.of(getClass().getName());
    
    @Inject
    @Named("CouchbaseAccountRepository - URL")
    private String url;
    @Inject
    @Named("CouchbaseAccountRepository - Timeout")
    private Integer timeout;
    @Inject
    @Named("CouchbaseAccountRepository - ReturnWrapper")
    ReturnWrapper<R> status;

    @Override
    public Promise<R> create(Account document, Options options) {
        CouchbaseAccount couchDocument = new CouchbaseAccount(document);

        WSRequestHolder holder = WS.url(url).setTimeout(timeout);
        logger.debug("create an account.");
        
        return holder.post(Json.toJson(couchDocument)).map(response -> {
            logger.debug("Got response of create an account : "+response.getStatusText());
            
            if (201 == response.getStatus()) {
                return status.ok("Created account");
            } else if (409 == response.getStatus())  {
                return status.badRequest("Account already exist");
            } else {
                return status.badRequest(response.asJson().get("reason").asText());
            }
        }).recoverWith(throwable -> Promise.promise(() -> {
            logger.warn("Server not reachable");
            return status.internalServerError("Server not reachable");
        }));

    }

    @Override
    public Promise<R> delete(Account document, Options options) {
        WSRequestHolder holder = WS.url(url+options.getUsername()).setTimeout(timeout);
        logger.debug("delete an account.");
        
        return holder.delete().map(response -> {
            logger.debug("Got response of delete an account : "+response.getStatusText());

            if (201 == response.getStatus()) {
                return status.ok("deleted account");
            } else {
                return status.badRequest(response.asJson().get("reason").asText());
            }
        }).recoverWith(throwable -> Promise.promise(() -> {
            logger.warn("Server not reachable");
            return status.internalServerError("Server not reachable");
        }));

    }

    @Override
    public Promise<R> update(Account document, Options options) {
        return Promise.promise(() -> status.notSupported("Update an account is not supported"));
    }

    @Override
    public Promise<R> query(Specification specification, Options options) {
        return Promise.promise(() -> status.notSupported("Query an account is not supported"));
    }

}
