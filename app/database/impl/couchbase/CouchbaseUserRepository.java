package database.impl.couchbase;

import play.libs.Json;

import com.google.inject.Inject;
import com.google.inject.name.Named;

import play.Logger;
import play.Logger.ALogger;
import play.libs.F.Promise;
import play.libs.ws.*;
import database.*;
import database.impl.ReturnWrapper;
import database.model.User;


public class CouchbaseUserRepository<R> implements Repository<R, User>{
    private final ALogger logger = Logger.of(getClass().getName());
    
    @Inject
    @Named("CouchbaseUserRepository - URL")
    private String url;
    @Inject
    @Named("CouchbaseUserRepository - Timeout")
    private Integer timeout;
    @Inject
    @Named("CouchbaseUserRepository - ReturnWrapper")
    ReturnWrapper<R> status;

    @Override
    public Promise<R> create(User document, Options options) {
        WSRequestHolder holder = WS.url(url).setTimeout(timeout);
        logger.debug("create a user.");
        
        return holder.post(Json.toJson(document)).map(response -> {
            logger.debug("Got response of create a user : "+response.getStatusText());
            
            if (201 == response.getStatus()) {
                return status.ok("Created user");
            } else if (409 == response.getStatus())  {
                return status.badRequest("User already exist");
            } else {
                return status.badRequest(response.getStatusText());
            }
        }).recoverWith(throwable -> Promise.promise(() -> {
            logger.warn("Server not reachable");
            return status.internalServerError("Server not reachable");
        }));

    }

    @Override
    public Promise<R> delete(User document, Options options) {
        WSRequestHolder holder = WS.url(url+options.getUsername()).setTimeout(timeout);
        logger.debug("delete a user.");
        
        return holder.delete().map(response -> {
            logger.debug("Got response of delete a user : "+response.getStatusText());

            if (201 == response.getStatus()) {
                return status.ok("deleted user");
            } else {
                return status.badRequest(response.getStatusText());
            }
        }).recoverWith(throwable -> Promise.promise(() -> {
            logger.warn("Server not reachable");
            return status.internalServerError("Server not reachable");
        }));

    }

    @Override
    public Promise<R> update(User document, Options options) {
        return Promise.promise(() -> status.ok("ok"));
    }

    @Override
    public Promise<R> query(Specification specification, Options options) {
        return Promise.promise(() -> status.badRequest("Query on user is not supported"));
    }

}
