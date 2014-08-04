package de.htwg.seapal.web.controllers;

import com.google.inject.Inject;
import com.google.inject.name.Named;

import play.Logger;
import play.Logger.ALogger;
import play.libs.F.Promise;
import play.libs.ws.WS;
import play.libs.ws.WSRequestHolder;
import play.mvc.Controller;
import play.mvc.Result;


public class Database extends Controller {
    private final ALogger logger = Logger.of(getClass().getName());
    
    @Inject
    @Named("Database Controller - SyncGateway Client URL")
    private String baseUrl;
    
    public Promise<Result> proxyHead(String url) {
        WSRequestHolder holder = WS.url(baseUrl+url);
        logger.debug("HEAD proxy request to syncGateway : "+baseUrl+url);
        
        return holder.head().map(response -> {
            logger.debug("HEAD Got response from syncGateway : "+response.getStatusText());
            return status(response.getStatus(), response.getBody());
        });
    }
    
    public Promise<Result> proxyGet(String url) {
        WSRequestHolder holder = WS.url(baseUrl+url);
        logger.debug("GET proxy request to syncGateway : "+baseUrl+url);
        
        return holder.get().map(response -> {
            logger.debug("GET Got response from syncGateway : "+response.getStatusText());
            return status(response.getStatus(), response.getBody());
        });
    }
    
    public Promise<Result> proxyPut(String url) {
        WSRequestHolder holder = WS.url(baseUrl+url);
        logger.debug("PUT proxy request to syncGateway : "+baseUrl+url);
        
        return holder.put(request().body().asText()).map(response -> {
            logger.debug("PUT Got response from syncGateway : "+response.getStatusText());
            return status(response.getStatus(), response.getBody());
        });
    }
    
    public Promise<Result> proxyPost(String url) {
        WSRequestHolder holder = WS.url(baseUrl+url);
        logger.debug("PUT proxy request to syncGateway : "+baseUrl+url);
        
        return holder.post(request().body().asText()).map(response -> {
            logger.debug("PUT Got response from syncGateway : "+response.getStatusText());
            return status(response.getStatus(), response.getBody());
        });
    }
    
    public Promise<Result> proxyDelete(String url) {
        WSRequestHolder holder = WS.url(baseUrl+url);
        logger.debug("PUT proxy request to syncGateway : "+baseUrl+url);

        return holder.delete().map(response -> {
            logger.debug("PUT Got response from syncGateway : "+response.getStatusText());
            return status(response.getStatus(), response.getBody());
        });
    }
}