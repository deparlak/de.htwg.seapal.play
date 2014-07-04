package de.htwg.seapal.web.controllers.impl;

import java.io.IOException;

import de.htwg.seapal.web.controllers.SimulationAPI;
import play.mvc.Controller;
import play.mvc.Result;

public class SimulationAPIFake extends Controller implements SimulationAPI {

	@Override
	public Result prepareTrip() {
		throw new RuntimeException("Not available in this module configuration.");
	}

	@Override
	public Result generateTrip() throws IOException {
		throw new RuntimeException("Not available in this module configuration.");
	}

}
