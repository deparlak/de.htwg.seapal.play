package de.htwg.seapal.web.controllers;

import java.io.IOException;

import play.mvc.Result;

/**
 * Handles http requests to the simulator - only available in test modules.
 * @author Lukas
 *
 */
public interface SimulationAPI {

	/**
	 * @see SimulationAPIImpl.prepareTrip()
	 */
	public Result prepareTrip();
	
	/**
	 * @see SimulationAPIImpl.generateTrip()
	 */
	public Result generateTrip() throws IOException;
	
}
