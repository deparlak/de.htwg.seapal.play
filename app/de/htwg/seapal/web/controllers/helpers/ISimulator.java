package de.htwg.seapal.web.controllers.helpers;

import java.io.IOException;

import de.htwg.seapal.web.models.TripGeneratorArgs;

/**
 * Provides methods for the generation of fake data in test configurations.
 * @author Lukas
 *
 */
public interface ISimulator {

	/**
	 * Generates a random sailing trip based on data from the TripGeneratorArgs object.
	 * @param args 
	 * @param userId ID of the calling user account.
	 * @throws IOException Thrown on missing input files.
	 */
	void generateTrip(TripGeneratorArgs args, String userId) throws IOException;

}
