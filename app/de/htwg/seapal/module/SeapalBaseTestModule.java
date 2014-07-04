package de.htwg.seapal.module;

import java.net.MalformedURLException;

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
		bind(String.class).annotatedWith(Names.named("databaseURL")).toInstance("https://seapaldev.couchappy.com");
		bind(String.class).annotatedWith(Names.named("databaseUser")).toInstance("admin");
		bind(String.class).annotatedWith(Names.named("databasePw")).toInstance("testtesttest123");
		
		// Use an active implementation of the test data generator
		bind(ISimulator.class).to(SimpleSimulator.class);
		bind(SimulationAPI.class).to(SimulationAPIImpl.class).in(Singleton.class);
	}

	private void configureControllers() {
		bind(IAccountController.class).to(AccountController.class).in(Singleton.class);
		bind(IMainController.class).to(MainController.class).in(Singleton.class);
	}

	@Provides
	HttpClient getHttpClient(@Named("databaseURL") String databaseURL, @Named("databaseUser") String user, @Named("databasePw") String password) throws MalformedURLException {
		return new StdHttpClient.Builder().url(databaseURL).username(user).password(password).build();
	}

	@Provides
	CouchDbInstance getStdCouchDbInstance(HttpClient httpClient) {
		return new StdCouchDbInstance(httpClient);
	}
}
