package de.htwg.seapal.module;

import org.ektorp.CouchDbInstance;
import org.ektorp.http.HttpClient;
import org.ektorp.http.StdHttpClient;
import org.ektorp.impl.StdCouchDbInstance;

import com.google.inject.AbstractModule;
import com.google.inject.Provides;
import com.google.inject.Singleton;
import com.google.inject.name.Named;
import com.google.inject.name.Names;

import de.htwg.seapal.controller.IAccountController;
import de.htwg.seapal.controller.IMainController;
import de.htwg.seapal.controller.impl.AccountController;
import de.htwg.seapal.controller.impl.MainController;
import de.htwg.seapal.web.controllers.SimulationAPI;
import de.htwg.seapal.web.controllers.helpers.ISimulator;
import de.htwg.seapal.web.controllers.helpers.SimpleSimulator;
import de.htwg.seapal.web.controllers.impl.SimulationAPIImpl;

public abstract class SeapalBaseTestModule extends AbstractModule {

	@Override
	protected void configure() {
		configureControllers();

		// configure database configuration
		bind(String.class).annotatedWith(Names.named("databaseHost")).toInstance("localhost");
		bind(Integer.class).annotatedWith(Names.named("databasePort")).toInstance(5984);
		bind(String.class).annotatedWith(Names.named("databaseURL")).toInstance("http://localhost");

		// Use an active implementation of the test data generator
		bind(ISimulator.class).to(SimpleSimulator.class);
		bind(SimulationAPI.class).to(SimulationAPIImpl.class).in(Singleton.class);
	}

	private void configureControllers() {
		bind(IAccountController.class).to(AccountController.class).in(Singleton.class);
		bind(IMainController.class).to(MainController.class).in(Singleton.class);
	}

	@Provides
	HttpClient getHttpClient(@Named("databaseHost") String databaseHost, @Named("databasePort") int databasePort) {
		return new StdHttpClient.Builder().host(databaseHost).port(databasePort).username("lukas").password("test").build();
	}

	@Provides
	CouchDbInstance getStdCouchDbInstance(HttpClient httpClient) {
		return new StdCouchDbInstance(httpClient);
	}
}
