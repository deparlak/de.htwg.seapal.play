package de.htwg.seapal.web.controllers;

import com.google.inject.Inject;
import de.htwg.seapal.controller.*;
import de.htwg.seapal.model.*;
import de.htwg.seapal.model.impl.*;
import de.htwg.seapal.utils.logging.ILogger;
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

        IPerson crewMember1 = new Person();
        crewMember1.setAccount(crewMember1.getUUID().toString());
        personController.savePerson(crewMember1);
        domACL.put("crewMember1", Json.toJson(personController.getPerson(crewMember1.getUUID())));

        IPerson crewMember2 = new Person();
        crewMember2.setAccount(crewMember2.getUUID().toString());
        personController.savePerson(crewMember2);
        domACL.put("crewMember2", Json.toJson(personController.getPerson(crewMember2.getUUID())));

        String crewMember1UUID = crewMember1.getUUID().toString();
        String crewMember2UUID = crewMember2.getUUID().toString();

        IPerson account = new Person();
        account.setAccount(account.getUUID().toString());
        account.addFriend(crewMember1UUID);
        account.addFriend(crewMember1UUID);
        personController.savePerson(account);
        domACL.put("captain", Json.toJson(personController.getPerson(account.getUUID())));

        ObjectNode nodeInner  = Json.newObject();
        nodeInner.putAll(domACL);
        dom.put("captainAndCrew", nodeInner);



        String owner = account.getUUID().toString();

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

        IRoute route = new Route();
        route.setAccount(owner);
        // route.addCrewMember(crewMember1UUID);
        // route.addCrewMember(crewMember2UUID);
        routeController.saveRoute(route);
        dom.put("route", Json.toJson(routeController.getRoute(route.getUUID())));

        ITrip trip = new Trip();
        trip.setAccount(owner);
        trip.setBoat(boat.getUUID().toString());
        // trip.addCrewMember(crewMember1UUID);
        // trip.addCrewMember(crewMember2UUID);
        tripController.saveTrip(trip);
        dom.put("trip", Json.toJson(tripController.getTrip(trip.getUUID())));

        IWaypoint waypoint = new Waypoint();
        waypoint.setAccount(owner);
        waypoint.setTrip(trip.getUUID().toString());
        waypoint.setBoat(boat.getUUID().toString());
        // waypoint.addCrewMember(crewMember1UUID);
        // waypoint.addCrewMember(crewMember2UUID);
        waypointController.saveWaypoint(waypoint);
        dom.put("waypoint", Json.toJson(waypointController.getWaypoint(waypoint.getUUID())));


        node.putAll(dom);

        return ok(node);
    }
}
