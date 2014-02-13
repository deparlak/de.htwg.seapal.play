package de.htwg.seapal.module;

import com.google.inject.AbstractModule;
import com.google.inject.Provides;
import com.google.inject.Singleton;
import com.google.inject.name.Named;
import com.google.inject.name.Names;
import de.htwg.seapal.controller.*;
import de.htwg.seapal.controller.impl.AccountController;
import de.htwg.seapal.controller.impl.MainController;
import de.htwg.seapal.controller.impl.PersonController;
import org.ektorp.CouchDbInstance;
import org.ektorp.http.HttpClient;
import org.ektorp.http.StdHttpClient;
import org.ektorp.impl.StdCouchDbInstance;

public abstract class SeapalBaseModule
        extends AbstractModule {

    @Override
    protected void configure() {
        configureControllers();

        // configure database configuration
        bind(String.class).annotatedWith(Names.named("databaseHost")).toInstance("roroettg.iriscouch.com");
        bind(Integer.class).annotatedWith(Names.named("databasePort")).toInstance(80);
        bind(String.class).annotatedWith(Names.named("databaseURL")).toInstance("http://roroettg.iriscouch.com");
    }

    private void configureControllers() {
        bind(IAccountController.class).to(AccountController.class).in(Singleton.class);
        bind(IPersonController.class).to(PersonController.class).in(Singleton.class);
        bind(IMainController.class).to(MainController.class).in(Singleton.class);
    }

    @Provides
    HttpClient getHttpClient(@Named("databaseHost") String databaseHost, @Named("databasePort") int databasePort) {
        return new StdHttpClient.Builder().host(databaseHost).port(databasePort).build();
    }

    @Provides
    CouchDbInstance getStdCouchDbInstance(HttpClient httpClient) {
        return new StdCouchDbInstance(httpClient);
    }
}
