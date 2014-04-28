package de.htwg.seapal.web.controllers.impl;

import java.io.IOException;

import play.data.DynamicForm;
import play.data.Form;
import play.mvc.Controller;
import play.mvc.Result;

import com.google.inject.Inject;

import de.htwg.seapal.controller.IAccountController;
import de.htwg.seapal.controller.IMainController;
import de.htwg.seapal.controller.impl.AccountController;
import de.htwg.seapal.model.IBoat;
import de.htwg.seapal.web.controllers.SimulationAPI;
import de.htwg.seapal.web.controllers.helpers.ISimulator;
import de.htwg.seapal.web.models.TripGeneratorArgs;
import de.htwg.seapal.web.views.html.simulation;

/** Handles requests to the simulator.
 *  For use in test module configuration only!
 *  
 * @author Lukas
 */
public class SimulationAPIImpl extends Controller implements SimulationAPI {

	@Inject
	private IMainController mainController;
	
	@Inject
	private ISimulator simulator;

	/**
	 * GET: /simulation/prepareTrip
	 * Shows a page to configure the generation of a random trip.
	 */
	@Override
	public Result prepareTrip() {
		TripGeneratorArgs args  = new TripGeneratorArgs();
		args.setRouteFile("test/simulation/routes/bodensee1.txt");
		args.setNotesFile("test/simulation/sampletext.txt");
		args.setPicturesDir("test/simulation/pictures");
		args.setThumbsDir("test/simulation/pictures/thumbs");
		args.setWaypointCount(10);
		
		// get ID of first boat of user
		Object[] boats = mainController.getOwnDocuments("boat", session(IAccountController.AUTHN_COOKIE_KEY)).toArray();
		args.setBoatId(((IBoat)boats[0]).getId());

		return ok(simulation.render(args, null));
	}

	/**
	 * POST: /simulation/generateTrip
	 * Creates a random trip based on inputs from the prepareTrip page.
	 */
	@Override
	public Result generateTrip() throws IOException {
		Form<TripGeneratorArgs> postData = DynamicForm.form(TripGeneratorArgs.class).bindFromRequest();
		TripGeneratorArgs args = postData.get();

		simulator.generateTrip(args, session(AccountController.AUTHN_COOKIE_KEY));
		
		return ok(simulation.render(args, "OK, please reload seapal app."));
	}

}
