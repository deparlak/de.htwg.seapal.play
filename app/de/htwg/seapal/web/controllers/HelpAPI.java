package de.htwg.seapal.web.controllers;

import com.google.inject.Inject;
import de.htwg.seapal.controller.*;
import de.htwg.seapal.model.*;
import de.htwg.seapal.model.impl.*;
import de.htwg.seapal.utils.logging.ILogger;
import de.htwg.seapal.web.controllers.secure.IAccount;
import de.htwg.seapal.web.controllers.secure.IAccountController;
import de.htwg.seapal.web.controllers.secure.impl.Account;
import org.codehaus.jackson.JsonNode;
import org.codehaus.jackson.node.ObjectNode;
import play.libs.Json;
import play.mvc.Controller;
import play.mvc.Result;

import java.util.HashMap;
import java.util.Map;

public class HelpAPI
        extends Controller {

    @Inject
    private IAccountController accountController;

    @Inject
    private IBoatController boatController;

    @Inject
    private IMarkController markController;

    @Inject
    private IPersonController personController;

    @Inject
    private IRouteController routeController;

    @Inject
    private ITripController tripController;

    @Inject
    private IWaypointController waypointController;

    @Inject
    private ILogger logger;

    public Result help() {
        ObjectNode node = Json.newObject();
        Map<String, JsonNode> dom = new HashMap<>();
        Map<String, JsonNode> domACL = new HashMap<>();

        IAccount account = new Account();
        account.setAccount(account.getUUID().toString());
        accountController.saveAccount(account);
        domACL.put("captain", Json.toJson(accountController.getAccount(account.getUUID())));

        IAccount crewMember1 = new Account();
        crewMember1.setAccount(crewMember1.getUUID().toString());
        accountController.saveAccount(crewMember1);
        domACL.put("crewMember1", Json.toJson(accountController.getAccount(crewMember1.getUUID())));

        IAccount crewMember2 = new Account();
        crewMember2.setAccount(crewMember2.getUUID().toString());
        accountController.saveAccount(crewMember2);
        domACL.put("crewMember2", Json.toJson(accountController.getAccount(crewMember2.getUUID())));

        ObjectNode nodeInner  = Json.newObject();
        nodeInner.putAll(domACL);
        dom.put("captainAndCrew", nodeInner);

        String owner = account.getUUID().toString();
        String crewMember1UUID = crewMember1.getUUID().toString();
        String crewMember2UUID = crewMember2.getUUID().toString();

        IBoat boat = new Boat();
        boat.setAccount(owner);
        // boat.addCrewMember(crewMember1UUID);
        // boat.addCrewMember(crewMember2UUID);
        boatController.saveBoat(boat);
        dom.put("boat", Json.toJson(boatController.getBoat(boat.getUUID())));

        IMark mark = new Mark();
        mark.setAccount(owner);
        // mark.addCrewMember(crewMember1UUID);
        // mark.addCrewMember(crewMember2UUID);
        markController.saveMark(mark);
        dom.put("mark", Json.toJson(markController.getMark(mark.getUUID())));

        IPerson person = new Person();
        person.setAccount(owner);
        personController.savePerson(person);
        dom.put("person", Json.toJson(personController.getPerson(person.getUUID())));

        IRoute route = new Route();
        route.setAccount(owner);
        // route.addCrewMember(crewMember1UUID);
        // route.addCrewMember(crewMember2UUID);
        routeController.saveRoute(route);
        dom.put("route", Json.toJson(routeController.getRoute(route.getUUID())));

        ITrip trip = new Trip();
        trip.setAccount(owner);
        // trip.addCrewMember(crewMember1UUID);
        // trip.addCrewMember(crewMember2UUID);
        tripController.saveTrip(trip);
        dom.put("trip", Json.toJson(tripController.getTrip(trip.getUUID())));

        IWaypoint waypoint = new Waypoint();
        waypoint.setAccount(owner);
        // waypoint.addCrewMember(crewMember1UUID);
        // waypoint.addCrewMember(crewMember2UUID);
        waypointController.saveWaypoint(waypoint);
        dom.put("waypoint", Json.toJson(waypointController.getWaypoint(waypoint.getUUID())));


        node.putAll(dom);

        return ok(node);
    }
}
