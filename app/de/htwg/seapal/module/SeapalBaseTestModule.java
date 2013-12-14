package de.htwg.seapal.module;

import com.google.inject.AbstractModule;
import com.google.inject.Provides;
import com.google.inject.Singleton;
import com.google.inject.name.Named;
import com.google.inject.name.Names;
import de.htwg.seapal.controller.IBoatController;
import de.htwg.seapal.controller.IRaceController;
import de.htwg.seapal.controller.ITripController;
import de.htwg.seapal.controller.IWaypointController;
import de.htwg.seapal.controller.impl.BoatController;
import de.htwg.seapal.controller.impl.RaceController;
import de.htwg.seapal.controller.impl.TripController;
import de.htwg.seapal.controller.impl.WaypointController;
import de.htwg.seapal.web.controllers.secure.IAccountController;
import de.htwg.seapal.web.controllers.secure.impl.AccountController;
import org.ektorp.CouchDbInstance;
import org.ektorp.http.HttpClient;
import org.ektorp.http.StdHttpClient;
import org.ektorp.impl.StdCouchDbInstance;

public abstract class SeapalBaseTestModule extends AbstractModule {

	@Override
	protected void configure() {
		configureControllers();

		// configure database configuration
		bind(String.class).annotatedWith(Names.named("databaseHost")).toInstance("localhost");
	    bind(Integer.class).annotatedWith(Names.named("databasePort")).toInstance(5984);
	    bind(String.class).annotatedWith(Names.named("databaseURL")).toInstance("http://localhost");
	}

	private void configureControllers() {
        bind(IAccountController.class).to(AccountController.class).in(Singleton.class);
        bind(IBoatController.class).to(BoatController.class).in(Singleton.class);
        bind(ITripController.class).to(TripController.class).in(Singleton.class);
		bind(IWaypointController.class).to(WaypointController.class).in(Singleton.class);
		bind(IRaceController.class).to(RaceController.class).in(Singleton.class);
	}

	@Provides
    HttpClient getHttpClient(@Named("databaseHost") String databaseHost, @Named("databasePort") int databasePort) {
        return new StdHttpClient.Builder().host(databaseHost).port(databasePort).username("root").password("root").build();
    }

    @Provides
    CouchDbInstance getStdCouchDbInstance(HttpClient httpClient) {
        return new StdCouchDbInstance(httpClient);
    }
}
