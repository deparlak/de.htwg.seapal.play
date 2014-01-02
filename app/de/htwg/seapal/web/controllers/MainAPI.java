package de.htwg.seapal.web.controllers;

import com.google.inject.Inject;
import de.htwg.seapal.controller.impl.IMainController;
import de.htwg.seapal.model.IModel;
import de.htwg.seapal.web.controllers.secure.IAccountController;
import org.codehaus.jackson.JsonNode;
import play.libs.Json;
import play.mvc.Controller;
import play.mvc.Result;

import java.util.Collection;
import java.util.LinkedList;
import java.util.UUID;

public final class MainAPI
        extends Controller {

    private static final JsonNode success = Json.parse("{\"success\":true}");
    private static final JsonNode fail = Json.parse("{\"success\":false}");

    @Inject
    private IMainController controller;

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
}
