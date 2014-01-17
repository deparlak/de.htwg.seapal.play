package de.htwg.seapal.web.controllers;

import com.google.inject.Inject;
import de.htwg.seapal.controller.IMainController;
import de.htwg.seapal.controller.IPersonController;
import de.htwg.seapal.model.ModelDocument;
import de.htwg.seapal.model.impl.*;
import org.codehaus.jackson.JsonNode;
import org.codehaus.jackson.node.ObjectNode;
import play.data.Form;
import play.libs.Json;
import play.mvc.Controller;
import play.mvc.Result;

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

    private Map<String, Class<? extends ModelDocument>> forms;

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
        String session = session(IPersonController.AUTHN_COOKIE_KEY);

        ObjectNode node = Json.newObject();
        node.put("account", Json.toJson(controller.account(session)));

        for (String type: forms.keySet()) {
            node.put(type, Json.toJson(controller.getDocuments(type, session, scope)));
        }

        return ok(node);
    }

    @play.mvc.Security.Authenticated(AccountAPI.SecuredAPI.class)
    public Result singleDocument(final UUID id, final String document) {
        String session = session(IPersonController.AUTHN_COOKIE_KEY);

        return ok(Json.toJson(controller.getSingleDocument(session, id, document)));
    }

    @play.mvc.Security.Authenticated(AccountAPI.SecuredAPI.class)
    public Result deleteDocument(final UUID id, final String document) {
        String session = session(IPersonController.AUTHN_COOKIE_KEY);

        if (controller.deleteDocument(session, id, document)) {
            return ok(success);
        } else {
            return unauthorized(fail);
        }
    }

    @play.mvc.Security.Authenticated(AccountAPI.SecuredAPI.class)
    public Result getDocuments(String document, String scope) {
        String session = session(IPersonController.AUTHN_COOKIE_KEY);

        return ok(Json.toJson(controller.getDocuments(document, session, scope)));
    }

    @play.mvc.Security.Authenticated(AccountAPI.SecuredAPI.class)
    public Result getByParent(String document, String parent, UUID id) {
        String session = session(IPersonController.AUTHN_COOKIE_KEY);

        try {
            return ok(Json.toJson(controller.getByParent(document, parent, session, id)));
        } catch (NullPointerException e) {
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

            doc.setAccount(session(IPersonController.AUTHN_COOKIE_KEY));
            return ok(Json.toJson(controller.creatDocument(document, doc)));
        } catch (NullPointerException e) {
            return internalServerError(EMPTY);
        }
    }

    @play.mvc.Security.Authenticated(AccountAPI.SecuredAPI.class)
    public Result ownAccount() {
        try {
            return ok(Json.toJson(controller.account(session(IPersonController.AUTHN_COOKIE_KEY))));
        } catch (NullPointerException e) {
            return internalServerError(EMPTY);
        }
    }

    @play.mvc.Security.Authenticated(AccountAPI.SecuredAPI.class)
    public Result account(UUID id) {
        try {
            return ok(Json.toJson(controller.account(id, session(IPersonController.AUTHN_COOKIE_KEY))));
        } catch (NullPointerException e) {
            return internalServerError(EMPTY);
        }
    }

    @play.mvc.Security.Authenticated(AccountAPI.SecuredAPI.class)
    public Result sendFriendRequest(UUID askedPersonUUID) {
        try {
            return ok(Json.toJson(controller.addFriend(session(IPersonController.AUTHN_COOKIE_KEY), askedPersonUUID)));
        } catch (NullPointerException e) {
            return internalServerError(EMPTY);
        }
    }
}
