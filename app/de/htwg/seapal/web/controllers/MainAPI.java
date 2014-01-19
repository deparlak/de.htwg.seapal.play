package de.htwg.seapal.web.controllers;

import com.google.inject.Inject;
import de.htwg.seapal.controller.IAccountController;
import de.htwg.seapal.controller.IMainController;
import de.htwg.seapal.controller.impl.AccountController;
import de.htwg.seapal.model.ModelDocument;
import de.htwg.seapal.model.impl.*;
import de.htwg.seapal.utils.logging.ILogger;
import org.codehaus.jackson.JsonNode;
import org.codehaus.jackson.node.ObjectNode;
import play.data.Form;
import play.libs.Json;
import play.mvc.Controller;
import play.mvc.Result;
import play.mvc.Security;

import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

public final class MainAPI
        extends Controller {

    private static final JsonNode success = Json.parse("{\"success\":true}");
    private static final JsonNode fail = Json.parse("{\"success\":false}");
    private static final JsonNode EMPTY = Json.parse("{\"error\":\"no such document\"}");

    @Inject
    private IMainController controller;

    @Inject
    private AccountController accountController;

    private Map<String, Class<? extends ModelDocument>> forms;

    @Inject
    private ILogger logger;

    public MainAPI() {
        forms = new HashMap<>();
        forms.put("boat", Boat.class);
        forms.put("mark", Mark.class);
        forms.put("route", Route.class);
        forms.put("trip", Trip.class);
        forms.put("waypoint", Waypoint.class);
    }

    @play.mvc.Security.Authenticated(AccountAPI.SecuredAPI.class)
    public Result all(String scope) {
        try {
            String session = session(IAccountController.AUTHN_COOKIE_KEY);

            ObjectNode node = Json.newObject();
            node.put("person_info", Json.toJson(accountController.getPerson(UUID.fromString(session))));

            node.put("account_info", Json.toJson(accountController.getInternalInfo(session)));

            for (String type : forms.keySet()) {
                node.put(type, Json.toJson(controller.getDocuments(type, session, scope)));
            }

            return ok(node);
        } catch (Exception e) {
            logger.exc(e);
            return internalServerError(EMPTY);
        }
    }

    @Security.Authenticated(AccountAPI.SecuredAPI.class)
    public Result singleDocument(final UUID id, final String document) {
        try {
            String session = session(IAccountController.AUTHN_COOKIE_KEY);

            return ok(Json.toJson(controller.getSingleDocument(session, id, document)));
        } catch (Exception e) {
            return internalServerError(EMPTY);
        }
    }

    @play.mvc.Security.Authenticated(AccountAPI.SecuredAPI.class)
    public Result deleteDocument(final UUID id, final String document) {
        String session = session(IAccountController.AUTHN_COOKIE_KEY);

        if (controller.deleteDocument(session, id, document)) {
            return ok(success);
        } else {
            return unauthorized(fail);
        }
    }

    @play.mvc.Security.Authenticated(AccountAPI.SecuredAPI.class)
    public Result getDocuments(String document, String scope) {
        try {
            String session = session(IAccountController.AUTHN_COOKIE_KEY);

            return ok(Json.toJson(controller.getDocuments(document, session, scope)));
        } catch (Exception e) {
            return internalServerError(EMPTY);
        }
    }

    @play.mvc.Security.Authenticated(AccountAPI.SecuredAPI.class)
    public Result getByParent(String document, String parent, UUID id) {
        try {
            String session = session(IAccountController.AUTHN_COOKIE_KEY);

            return ok(Json.toJson(controller.getByParent(document, parent, session, id)));
        } catch (Exception e) {
            return internalServerError(EMPTY);
        }
    }

    @play.mvc.Security.Authenticated(AccountAPI.SecuredAPI.class)
    public Result createDocument(String document) {
        try {
            Class<? extends ModelDocument> cla = forms.get(document);
            Form<? extends ModelDocument> form2 = new Form<>(cla).bindFromRequest();

            if (form2.hasErrors()) {
                return internalServerError(form2.errorsAsJson());
            }
            ModelDocument doc = form2.get();
            if (document.equals("mark")) {
                Mark mark = (Mark) doc;
                mark.setLongitude(Double.valueOf(form2.data().get("lng")));
                mark.setLatitude(Double.valueOf(form2.data().get("lat")));
            }

            doc.setAccount(session(IAccountController.AUTHN_COOKIE_KEY));
            return ok(Json.toJson(controller.creatDocument(document, doc)));
        } catch (Exception e) {
            return internalServerError(EMPTY);
        }
    }

    @play.mvc.Security.Authenticated(AccountAPI.SecuredAPI.class)
    public Result sendFriendRequest(UUID askedPersonUUID) {
        try {
            return ok(Json.toJson(controller.addFriend(session(IAccountController.AUTHN_COOKIE_KEY), askedPersonUUID)));
        } catch (Exception e) {
            return internalServerError(EMPTY);
        }
    }

    @play.mvc.Security.Authenticated(AccountAPI.SecuredAPI.class)
    public Result sendFriendRequestMail(String mail) {
        try {
            return ok(Json.toJson(controller.addFriend(session(IAccountController.AUTHN_COOKIE_KEY), mail)));
        } catch (Exception e) {
            return internalServerError(EMPTY);
        }
    }
}
