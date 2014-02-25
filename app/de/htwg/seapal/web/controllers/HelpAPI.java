package de.htwg.seapal.web.controllers;

import com.google.inject.Inject;
import de.htwg.seapal.controller.IAccountController;
import de.htwg.seapal.controller.IMainController;
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
    private IMainController mainController;

    @Inject
    private IAccountController AccountController;

    @Inject
    private ILogger logger;


    public Result help() {
        ObjectNode node = Json.newObject();
        Map<String, JsonNode> dom = new HashMap<>();
        Map<String, JsonNode> domACL = new HashMap<>();
        Map<String, JsonNode> domACLPerson = new HashMap<>();

        Account crewMember1 = new Account();
        crewMember1.setAccount(crewMember1.getUUID().toString());
        crewMember1.setEmail("crewMember1@123.de");
        crewMember1.setPassword("test");
        SignupAccount save = new SignupAccount(crewMember1, "Alfred", "von Tirpitz");
        AccountController.saveAccount(save, true);
        domACL.put("crewMember1", Json.toJson(AccountController.getInternalInfo(String.valueOf(crewMember1.getUUID()), crewMember1.getUUID().toString())));
        domACLPerson.put("crewMember1", Json.toJson(mainController.getDocuments("person", crewMember1.getUUID().toString(), crewMember1.getUUID().toString(), "own")));

        IAccount crewMember2 = new Account();
        crewMember2.setAccount(crewMember2.getUUID().toString());
        crewMember2.setEmail("crewMember2@123.de");
        crewMember2.setPassword("test");
        SignupAccount save2 = new SignupAccount(crewMember2, "Ernst", "Lindemann");
        AccountController.saveAccount(save2, true);
        domACL.put("crewMember2", Json.toJson(AccountController.getInternalInfo(String.valueOf(crewMember2.getUUID()), String.valueOf(crewMember2.getUUID()))));
        domACLPerson.put("crewMember1", Json.toJson(mainController.getDocuments("person", crewMember2.getUUID().toString(), crewMember2.getUUID().toString(), "own")));

        IAccount account = new Account();
        account.setAccount(account.getUUID().toString());
        account.addFriend(crewMember1);
        crewMember1.addFriend(account);
        account.setEmail("account@123.de");
        account.setPassword("test");
        SignupAccount save3 = new SignupAccount(account, "Karl", "Dönitz");
        AccountController.saveAccount(save3, true);
        domACL.put("captain", Json.toJson(AccountController.getInternalInfo(String.valueOf(account.getUUID()), String.valueOf(account.getUUID()))));
        domACLPerson.put("crewMember1", Json.toJson(mainController.getDocuments("person", account.getUUID().toString(), account.getUUID().toString(), "own")));

        ObjectNode nodeInner = Json.newObject();
        nodeInner.putAll(domACL);
        ObjectNode nodeInner2 = Json.newObject();
        nodeInner2.putAll(domACLPerson);
        dom.put("captainAndCrew_internal_info", nodeInner);
        dom.put("captainAndCrew_external_info", nodeInner2);

        String owner = account.getUUID().toString();

        IBoat boat = new Boat();
        boat.setName("boat1");
        boat.setAccount(owner);
        mainController.creatDocument("boat", (ModelDocument) boat, owner);
        dom.put("boat", Json.toJson(mainController.getSingleDocument("boat", owner, boat.getUUID())));

        IBoat boat2 = new Boat();
        boat2.setName("boat2");
        boat2.setAccount(crewMember1.getUUID().toString());
        mainController.creatDocument("boat", (ModelDocument) boat2, crewMember1.getUUID().toString());
        dom.put("boat2", Json.toJson(mainController.getSingleDocument("boat", crewMember1.getUUID().toString(), boat2.getUUID())));

        IMark mark = new Mark();
        mark.setAccount(owner);
        mark.setLat(3.4);
        mark.setLng(5.6);
        mainController.creatDocument("mark", (ModelDocument) mark, owner);
        dom.put("mark", Json.toJson(mainController.getSingleDocument("mark", owner, mark.getUUID())));

        IRoute route = new Route();
        route.setAccount(owner);
        mainController.creatDocument("route", (ModelDocument) route, owner);
        dom.put("route", Json.toJson(mainController.getSingleDocument("route", owner, route.getUUID())));

        ITrip trip = new Trip();
        trip.setAccount(owner);
        trip.setBoat(boat.getUUID().toString());
        mainController.creatDocument("trip", (ModelDocument) trip, owner);
        dom.put("trip", Json.toJson(mainController.getSingleDocument("trip", owner, trip.getUUID())));

        IWaypoint waypoint = new Waypoint();
        waypoint.setAccount(owner);
        waypoint.setTrip(trip.getUUID().toString());
        waypoint.setBoat(boat.getUUID().toString());
        mainController.creatDocument("waypoint", (ModelDocument) waypoint, owner);
        dom.put("waypoint", Json.toJson(mainController.getSingleDocument("waypoint", owner, waypoint.getUUID())));

        node.putAll(dom);

        return ok(node);
    }
}
