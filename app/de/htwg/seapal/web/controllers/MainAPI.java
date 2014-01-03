package de.htwg.seapal.web.controllers;

import com.google.inject.Inject;
import de.htwg.seapal.controller.IMainController;
import de.htwg.seapal.model.IModel;
import de.htwg.seapal.model.ModelDocument;
import de.htwg.seapal.model.impl.*;
import de.htwg.seapal.web.controllers.secure.IAccountController;
import org.codehaus.jackson.JsonNode;
import play.data.Form;
import play.libs.Json;
import play.mvc.Controller;
import play.mvc.Result;

import java.util.*;

public final class MainAPI
        extends Controller {

    private static final JsonNode success = Json.parse("{\"success\":true}");
    private static final JsonNode fail = Json.parse("{\"success\":false}");

    @Inject
    private IMainController controller;

    private Map<String, Form<? extends ModelDocument>> forms;

    public MainAPI() {
        forms = new HashMap<>();
        forms.put("boat", Form.form(Boat.class));
        forms.put("mark", Form.form(Mark.class));
        forms.put("route", Form.form(Route.class));
        forms.put("trip", Form.form(Trip.class));
        forms.put("waypoint", Form.form(Waypoint.class));
    }

    public Result singleDocument(final UUID id, final String document) {

        return ok(Json.toJson(controller.getSingleDocument(session(IAccountController.AUTHN_COOKIE_KEY), id, document)));
    }
    public Result deleteDocument(final UUID id, final String document) {
        if (controller.deleteDocument(session(IAccountController.AUTHN_COOKIE_KEY), id, document)) {
            return ok(success);
        } else {
            return unauthorized(fail);
        }
    }
    public Result getDocuments(String document, String scope) {
        Collection<IModel> list = new LinkedList<>();
        String session = session(IAccountController.AUTHN_COOKIE_KEY);

        if (scope.equals("all") || scope.equals("own")) {
            list.addAll(controller.getOwnDocuments(document, session));
        }

        if (scope.equals("all") || scope.equals("own")) {
            list.addAll(controller.getForeignDocuments(document, session));
        }

        return ok(Json.toJson(list));
    }
    public Result getByParent(String document, String parent, UUID id) {
        return ok(Json.toJson(controller.getByParent(document, parent, session(IAccountController.AUTHN_COOKIE_KEY), id)));
    }

    public Result createDocument(String document) {
        return ok(controller.creatDocument(document, forms.get(document).bindFromRequest().get()));
    }
}
