package de.htwg.seapal.web.controllers;

import com.google.inject.Inject;
import de.htwg.seapal.controller.IAccountController;
import de.htwg.seapal.controller.IMainController;
import de.htwg.seapal.controller.impl.AccountController;
import de.htwg.seapal.model.IModel;
import de.htwg.seapal.model.IPerson;
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
import java.util.Collection;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

public final class MainAPI
        extends Controller {

    private static final JsonNode success = Json.parse("{\"success\":true}");
    private static final JsonNode fail = Json.parse("{\"success\":false}");
    private static final JsonNode EMPTY = Json.parse("{\"error\":\"no such document\"}");
    private static final JsonNode FILE_UPLOAD_FAILED = Json.parse("{\"error\":\"file upload failed\"}");

    @Inject
    private IMainController controller;

    @Inject
    private AccountController accountController;

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
    public Result allofFriend(UUID user) {
        String session = session(IAccountController.AUTHN_COOKIE_KEY);

        ObjectNode node = Json.newObject();
        node.put("person_info", Json.toJson(controller.getDocuments("person", session, user.toString(), "own")));

        PublicPerson account = accountController.getInternalInfo(session, user.toString());
        if (account != null) {
            node.put("account_info", Json.toJson(account));
        }

        for (String type : forms.keySet()) {
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

        node.put("account_info", Json.toJson(accountController.getInternalInfo(session, session)));

        for (String type: forms.keySet()) {
            node.put(type, Json.toJson(controller.getDocuments(type, session, session, scope)));
        }

        return ok(node);
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
            return ok(success);
        } else {
            return unauthorized(fail);
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
            Class<? extends ModelDocument> cla = forms.get(document);
            Form<? extends ModelDocument> form2 = new Form<>(cla).bindFromRequest();

            if (form2.hasErrors()) {
                return internalServerError(form2.errorsAsJson());
            }
            ModelDocument doc = form2.get();

            /*
               account has to be set here, because it will not mapped automatically.
               TODO : check why auto mapping is not working
            */
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

        Http.Request s2 = request();
        Http.RequestBody s = s2.body();

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

    public Result names() {
        Http.RequestBody body = request().body();
        JsonNode jsonNode = body.asJson();
        if (jsonNode == null || !jsonNode.isArray()) {
            return internalServerError();
        }


        ObjectNode response = Json.newObject();
        for (int i = 0; i < jsonNode.size(); i++) {
            String uuid = jsonNode.get(i).asText();

            Collection<? extends IModel> result = controller.getOwnDocuments("person", uuid);
            if (result.size() != 1) {
                continue;
            }

            IPerson person = (IPerson) result.toArray()[0];
            System.out.println(person);
            String[] name = new String[]{person.getFirstname(), person.getLastname()};
            response.put(uuid, Json.toJson(name));
        }

        return ok(response);
    }
}
