package de.htwg.seapal.database.impl.couchbase;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.node.JsonNodeFactory;
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


public class CouchbaseSessionRepository<R> implements Repository<R, Account>{
    private final ALogger logger = Logger.of(getClass().getName());
    
    @Inject
    @Named("SyncGateway - Session URL")
    private String sessionUrl;
    @Inject
    @Named("CouchbaseSessionRepository - ReturnWrapper")
    private ReturnWrapper<R> status;

    @Override
    public Promise<R> create(Account document, Options options) {
        if (null == document) {
            return Promise.promise(() -> status.unauthorized(""));
        }
        CouchbaseAccount couchDocument = new CouchbaseAccount(document);
        logger.info("Get a session from the sync Gateway");

        return WS.url(sessionUrl).post(JsonNodeFactory.instance.objectNode().put("name", couchDocument.getName())).map(response -> {
            logger.info("Got response from sync Gateay for session : "+response.getStatusText());
            
            if (200 == response.getStatus()) {
                JsonNode data = response.asJson();
                logger.info("Set cookie "+data.get("cookie_name").asText()+" : "+data.get("session_id").asText());
                return status.ok(data.get("session_id").asText());
            } else {
                return status.badRequest(response.asJson().get("reason").asText());
            }
        });
    }

    @Override
    public Promise<R> delete(Account document, Options options) {
        return Promise.promise(() -> status.notSupported("Delete a session is not supported"));
    }

    @Override
    public Promise<R> update(Account document, Options options) {
        return Promise.promise(() -> status.notSupported("Update a session is not supported"));
    }

    @Override
    public Promise<R> query(Specification specification, Options options) {
        return Promise.promise(() -> status.notSupported("Query a session is not supported"));
    }

}
