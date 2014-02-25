package de.htwg.seapal.web.controllers;

import com.google.inject.Inject;
import de.htwg.seapal.controller.IAccountController;
import de.htwg.seapal.controller.IMainController;
import de.htwg.seapal.controller.impl.AccountController;
import de.htwg.seapal.model.ModelDocument;
import de.htwg.seapal.model.impl.*;
import org.codehaus.jackson.JsonNode;
import org.codehaus.jackson.node.ObjectNode;
import play.data.Form;
import play.libs.Json;
import play.mvc.Controller;
import play.mvc.Http;
import play.mvc.Result;
import play.mvc.Security;

import java.io.File;
import java.io.FileNotFoundException;
import java.io.InputStream;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

public final class MainAPI
        extends Controller {

    private static final JsonNode SUCCESS = Json.parse("{\"success\":true}");
    private static final JsonNode FAIL = Json.parse("{\"success\":false}");
    private static final JsonNode EMPTY = Json.parse("{\"error\":\"no such document\"}");
    private static final JsonNode FILE_UPLOAD_FAILED = Json.parse("{\"error\":\"file upload failed\"}");

    @Inject
    private IMainController controller;

    @Inject
    private AccountController accountController;

    private final Map<String, Class<? extends ModelDocument>> classes;

    public MainAPI() {
        classes = new HashMap<>();
        classes.put("boat", Boat.class);
        classes.put("mark", Mark.class);
        classes.put("route", Route.class);
        classes.put("trip", Trip.class);
        classes.put("waypoint", Waypoint.class);
    }

    /**
     * route for receiving all documents of one friend.
     * @param user
     * @return
     */
    @play.mvc.Security.Authenticated(AccountAPI.SecuredAPI.class)
    public Result allofFriend(UUID user) {
        String session = session(IAccountController.AUTHN_COOKIE_KEY);

        ObjectNode node = Json.newObject();
        node.put("person_info", Json.toJson(controller.getDocuments("person", session, user.toString(), "own")));

        PublicPerson account = accountController.getInternalInfo(session, user.toString());
        if (account != null) {
            node.put("account_info", Json.toJson(account));
        }

        for (String type : classes.keySet()) {
            node.put(type, Json.toJson(controller.getDocuments(type, session, user.toString(), "own")));
        }

        return ok(node);
    }

    @play.mvc.Security.Authenticated(AccountAPI.SecuredAPI.class)
    public Result abortFriendRequest(UUID id) {
        try {
            controller.abortRequest(session(IAccountController.AUTHN_COOKIE_KEY), id);
            return ok(Json.toJson(true));
        } catch (NullPointerException e) {
            return internalServerError(EMPTY);
        }
    }

    @play.mvc.Security.Authenticated(AccountAPI.SecuredAPI.class)
    public Result all(String scope) {
        String session = session(IAccountController.AUTHN_COOKIE_KEY);

        ObjectNode node = Json.newObject();
        node.put("person_info", Json.toJson(controller.getDocuments("person", session, session, scope)));

        node.put("setting_info", Json.toJson(controller.getOwnDocuments("setting", session)));

        node.put("account_info", Json.toJson(accountController.getInternalInfo(session, session)));

        for (String type : classes.keySet()) {
            node.put(type, Json.toJson(controller.getDocuments(type, session, session, scope)));
        }

        return ok(node);
    }

    @play.mvc.Security.Authenticated(AccountAPI.SecuredAPI.class)
    public Result saveSettings() {
        try {
            Form<? extends ModelDocument> form2 = new Form<>(Setting.class).bindFromRequest();

            if (form2.hasErrors()) {
                return internalServerError(form2.errorsAsJson());
            }
            ModelDocument doc = form2.get();

            doc.setAccount(session(IAccountController.AUTHN_COOKIE_KEY));

            return ok(Json.toJson(controller.creatDocument("setting", doc, session(IAccountController.AUTHN_COOKIE_KEY))));
        } catch (NullPointerException e) {
            return internalServerError(EMPTY);
        }
    }

    @Security.Authenticated(AccountAPI.SecuredAPI.class)
    public Result singleDocument(final UUID id, final String document) {
        String session = session(IAccountController.AUTHN_COOKIE_KEY);

        return ok(Json.toJson(controller.getSingleDocument(document, session, id)));
    }

    @play.mvc.Security.Authenticated(AccountAPI.SecuredAPI.class)
    public Result deleteDocument(final UUID id, final String document) {
        String session = session(IAccountController.AUTHN_COOKIE_KEY);

        if (controller.deleteDocument(document, session, id)) {
            return ok(SUCCESS);
        } else {
            return unauthorized(FAIL);
        }
    }

    @play.mvc.Security.Authenticated(AccountAPI.SecuredAPI.class)
    public Result getDocuments(String document, String scope) {
        String session = session(IAccountController.AUTHN_COOKIE_KEY);

        return ok(Json.toJson(controller.getDocuments(document, session, session, scope)));
    }

    @play.mvc.Security.Authenticated(AccountAPI.SecuredAPI.class)
    public Result getByParent(String document, String parent, UUID id) {
        String session = session(IAccountController.AUTHN_COOKIE_KEY);

        try {
            return ok(Json.toJson(controller.getByParent(document, parent, session, id)));
        } catch (NullPointerException e) {
            return internalServerError(EMPTY);
        }
    }

    @play.mvc.Security.Authenticated(AccountAPI.SecuredAPI.class)
    public Result createDocument(String document) {
        try {
            Class<? extends ModelDocument> cla = classes.get(document);
            Form<? extends ModelDocument> form2 = new Form<>(cla).bindFromRequest();

            if (form2.hasErrors()) {
                return internalServerError(form2.errorsAsJson());
            }
            ModelDocument doc = form2.get();

            doc.setAccount(form2.data().get("owner"));

            return ok(Json.toJson(controller.creatDocument(document, doc, session(IAccountController.AUTHN_COOKIE_KEY))));
        } catch (NullPointerException e) {
            return internalServerError(EMPTY);
        }
    }

    @play.mvc.Security.Authenticated(AccountAPI.SecuredAPI.class)
    public Result sendFriendRequest(UUID askedPersonUUID) {
        try {
            return ok(Json.toJson(controller.addFriend(session(IAccountController.AUTHN_COOKIE_KEY), askedPersonUUID)));
        } catch (NullPointerException e) {
            return internalServerError(EMPTY);
        }
    }

    @play.mvc.Security.Authenticated(AccountAPI.SecuredAPI.class)
    public Result sendFriendRequestMail(String mail) {
        try {
            return ok(Json.toJson(controller.addFriend(session(IAccountController.AUTHN_COOKIE_KEY), mail)));
        } catch (NullPointerException e) {
            return internalServerError(EMPTY);
        }
    }

    @play.mvc.Security.Authenticated(AccountAPI.SecuredAPI.class)
    public Result addPhoto(UUID uuid, String type) throws FileNotFoundException {
        String session = session(IAccountController.AUTHN_COOKIE_KEY);

        Http.RequestBody s = request().body();

        Http.MultipartFormData body = s.asMultipartFormData();
        Http.MultipartFormData.FilePart picture = body.getFile("picture");
        if (picture != null) {
            String contentType = picture.getContentType();
            File file = picture.getFile();
            if (controller.addPhoto(session, uuid, contentType, file, type)) {
                return ok();
            } else {
                return internalServerError(FILE_UPLOAD_FAILED);
            }
        } else {
            return internalServerError(FILE_UPLOAD_FAILED);
        }
    }

    @play.mvc.Security.Authenticated(AccountAPI.SecuredAPI.class)
    public Result getPhoto(UUID id, String type) throws FileNotFoundException {
        String session = session(IAccountController.AUTHN_COOKIE_KEY);
        InputStream s = controller.getPhoto(session, id, type);
        if (s != null) {
            return ok(s).as("image/jpeg");
        }

        return internalServerError();
    }

    @play.mvc.Security.Authenticated(AccountAPI.SecuredAPI.class)
    public Result names() {
        return ok(Json.toJson(controller.getAskingPerson(session(IAccountController.AUTHN_COOKIE_KEY))));
    }
}
