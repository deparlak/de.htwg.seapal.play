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
    private static final int URL_SPLIT_INDEX = 10;
    private final ALogger logger = Logger.of(getClass().getName());
    
    @Inject
    @Named("SyncGateway - URL")
    private String baseUrl;
    @Inject 
    @Named("SyncGatewayCookieName")
    private String sessionCookie;
    
    @play.mvc.Security.Authenticated(SecuredJson.class)
    public Promise<Result> proxyHead(String path) {
        String url = baseUrl + request().uri().substring(URL_SPLIT_INDEX);
        WSRequestHolder holder = WS.url(url);
        holder.setHeader("Cookie", sessionCookie + "=" + session().get(sessionCookie) + ";");
        logger.info("HEAD proxy request to syncGateway : "+url);
        
        return holder.head().map(response -> {
            logger.info("HEAD Got response from syncGateway : "+response.getStatusText());
            return status(response.getStatus(), response.getBody());
        });
    }
    
    @play.mvc.Security.Authenticated(SecuredJson.class)
    public Promise<Result> proxyGet(String path) {
        String url = baseUrl + request().uri().substring(URL_SPLIT_INDEX);
        WSRequestHolder holder = WS.url(url);
        holder.setHeader("Cookie", sessionCookie + "=" + session().get(sessionCookie) + ";");
        logger.info("GET proxy request to syncGateway : " + url);
        logger.info("Set cookie " + sessionCookie + " : " + session().get(sessionCookie));
        
        return holder.get().map(response -> {
            logger.info("GET Got response from syncGateway : "+response.getStatusText());
            return status(response.getStatus(), response.getBody());
        });
    }
    
    @play.mvc.Security.Authenticated(SecuredJson.class)
    public Promise<Result> proxyPut(String path) {
        String url = baseUrl + request().uri().substring(URL_SPLIT_INDEX);
        WSRequestHolder holder = WS.url(url);
        holder.setHeader("Cookie", sessionCookie + "=" + session().get(sessionCookie) + ";");
        logger.info("PUT proxy request to syncGateway : "+url);
        logger.info("PUT body : "+request().body().asJson().toString());
        
        return holder.put(request().body().asJson()).map(response -> {
            logger.info("PUT Got response from syncGateway : "+response.getStatusText());
            return status(response.getStatus(), response.getBody());
        });
    }
    
    @play.mvc.Security.Authenticated(SecuredJson.class)
    public Promise<Result> proxyPost(String path) {
        String url = baseUrl + request().uri().substring(URL_SPLIT_INDEX);
        WSRequestHolder holder = WS.url(url);
        holder.setHeader("Cookie", sessionCookie + "=" + session().get(sessionCookie) + ";");
        logger.info("POST proxy request to syncGateway : "+url);

        return holder.post(request().body().asJson()).map(response -> {
            logger.info("POST Got response from syncGateway : "+response.getStatusText());
            return status(response.getStatus(), response.getBody());
        });
    }
    
    @play.mvc.Security.Authenticated(SecuredJson.class)
    public Promise<Result> proxyDelete(String path) {
        String url = baseUrl + request().uri().substring(URL_SPLIT_INDEX);
        WSRequestHolder holder = WS.url(url);
        holder.setHeader("Cookie", sessionCookie + "=" + session().get(sessionCookie) + ";");
        logger.info("DELETE proxy request to syncGateway : "+url);

        return holder.delete().map(response -> {
            logger.info("DELETE Got response from syncGateway : "+response.getStatusText());
            return status(response.getStatus(), response.getBody());
        });
    }
}