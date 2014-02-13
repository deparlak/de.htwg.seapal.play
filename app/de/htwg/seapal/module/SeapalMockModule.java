package de.htwg.seapal.module;

import com.google.inject.Singleton;
import de.htwg.seapal.controller.IMainController;
import de.htwg.seapal.controller.impl.MainController;
import de.htwg.seapal.database.*;
import de.htwg.seapal.utils.logger.iml.WebLogger;
import de.htwg.seapal.utils.logging.ILogger;

public class SeapalMockModule extends SeapalBaseModule {

	@Override
	protected void configure() {
		super.configure();

		// configure logger
		bind(ILogger.class).to(WebLogger.class);

		configureDatabases();
	}

	private void configureDatabases() {
		bind(IBoatDatabase.class).to(de.htwg.seapal.database.mock.BoatDatabase.class);
		bind(IPersonDatabase.class).to(de.htwg.seapal.database.mock.PersonDatabase.class);
		bind(ITripDatabase.class).to(de.htwg.seapal.database.mock.TripDatabase.class);
		bind(IMarkDatabase.class).to(de.htwg.seapal.database.mock.MarkDatabase.class);
		bind(IWaypointDatabase.class).to(de.htwg.seapal.database.mock.WaypointDatabase.class);
		bind(IRouteDatabase.class).to(de.htwg.seapal.database.mock.RouteDatabase.class);
		bind(IRaceDatabase.class).to(de.htwg.seapal.database.mock.RaceDatabase.class);

        bind(IMainController.class).to(MainController.class).in(Singleton.class);
    }
}
