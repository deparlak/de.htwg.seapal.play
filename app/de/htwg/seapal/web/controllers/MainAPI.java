package de.htwg.seapal.web.controllers;

import com.google.inject.Inject;
import de.htwg.seapal.controller.IAccountController;
import de.htwg.seapal.controller.IMainController;
import de.htwg.seapal.controller.impl.AccountController;
import de.htwg.seapal.model.IModel;
import de.htwg.seapal.model.ModelDocument;
import de.htwg.seapal.model.impl.*;
import de.htwg.seapal.utils.logging.ILogger;
import org.codehaus.jackson.JsonNode;
import org.codehaus.jackson.node.ObjectNode;
import org.ektorp.UpdateConflictException;
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

    private static final JsonNode SUCCESS = Json.parse("{\"success\":true}");
    private static final JsonNode FAIL = Json.parse("{\"success\":false}");
    private static final JsonNode EMPTY = Json.parse("{\"error\":\"no such document\"}");
    private static final JsonNode FILE_UPLOAD_FAILED = Json.parse("{\"error\":\"file upload failed\"}");
    private static final JsonNode DOCUMENT_UPDATE_CONFLICT = Json.parse("{\"error\":\"document update conflict, wrong revision\"}");

    @Inject
    private IMainController controller;

    @Inject
    private ILogger logger;

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
     *
     * @param user the friend the logged in user wants to retrieve the documents from.
     * @return a result containing a JSON object of all the documents.
     */
    @play.mvc.Security.Authenticated(AccountAPI.SecuredAPI.class)
    public Result allofFriend(UUID user) {
        String session = session(IAccountController.AUTHN_COOKIE_KEY);

        ObjectNode node = Json.newObject();
        node.put("person_info", Json.toJson(controller.getDocuments("person", session, user.toString(), "own")));

        for (String type : classes.keySet()) {
            node.put(type, Json.toJson(controller.getDocuments(type, session, user.toString(), "own")));
        }

        return ok(node);
    }

    /**
     * see de.htwg.seapal.controller.impl.MainController.abortRequest(session, id)
     *
     * @param id the UUID of the account getting asked
     * @return Result determining if it succeeded
     */
    @play.mvc.Security.Authenticated(AccountAPI.SecuredAPI.class)
    public Result abortFriendRequest(UUID id) {
        try {
            controller.abortRequest(session(IAccountController.AUTHN_COOKIE_KEY), id);
            return ok(Json.toJson(true));
        } catch (NullPointerException e) {
            return internalServerError(EMPTY);
        }
    }


    /**
     * retrieve the documents of one account is allowed to see. The scope determines if you want to retrieve only own
     * documents, the documents of all your friends or both.
     *
     * @param scope can be one of all / own / friends.
     * @return a result containing the JSON document containing the documents.
     */
    @play.mvc.Security.Authenticated(AccountAPI.SecuredAPI.class)
    public Result all(String scope) {
        String session = session(IAccountController.AUTHN_COOKIE_KEY);

        ObjectNode node = Json.newObject();
        node.put("person_info", Json.toJson(controller.getDocuments("person", session, session, scope)));

        node.put("setting_info", Json.toJson(controller.getOwnDocuments("setting", session)));

        PublicPerson accountInfo = accountController.getInternalInfo(session, session);
        if (accountInfo != null) {
            node.put("account_info", Json.toJson(accountInfo));
        }

        for (String type : classes.keySet()) {
            node.put(type, Json.toJson(controller.getDocuments(type, session, session, scope)));
        }

        return ok(node);
    }

    /**
     * saves the personal settings of an account.
     *
     * @return the saved json document.
     */
    @play.mvc.Security.Authenticated(AccountAPI.SecuredAPI.class)
    public Result saveSettings() {
        try {
            Form<? extends ModelDocument> form2 = new Form<>(Setting.class).bindFromRequest();

            if (form2.hasErrors()) {
                return internalServerError(form2.errorsAsJson());
            }
            ModelDocument doc = form2.get();

            Collection<? extends IModel> collection = controller.getOwnDocuments("setting", session(IAccountController.AUTHN_COOKIE_KEY));
            if (collection.size() == 1) {
                Setting setting = (Setting) collection.toArray()[0];
                doc.setRevision(setting.getRevision());
                doc.setId(setting.getId());
            }

            doc.setAccount(session(IAccountController.AUTHN_COOKIE_KEY));

            return ok(Json.toJson(controller.creatDocument("setting", doc, session(IAccountController.AUTHN_COOKIE_KEY))));
        } catch (NullPointerException e) {
            return internalServerError(EMPTY);
        }
    }

    /**
     * retrieve a single document.
     *
     * @param id   the id of the document.
     * @param type the type of the document.
     * @return the document.
     */
    @Security.Authenticated(AccountAPI.SecuredAPI.class)
    public Result singleDocument(final UUID id, final String type) {
        String session = session(IAccountController.AUTHN_COOKIE_KEY);

        IModel document = controller.getSingleDocument(type, session, id);
        if (document == null) {
            return notFound();
        }

        return ok(Json.toJson(document));
    }

    /**
     * delete a single document.
     *
     * @param id   the id of the document.
     * @param type the type of the document.
     * @return whether it suceeded or failed.
     */
    @play.mvc.Security.Authenticated(AccountAPI.SecuredAPI.class)
    public Result deleteDocument(final UUID id, final String type) {
        String session = session(IAccountController.AUTHN_COOKIE_KEY);

        if (controller.deleteDocument(type, session, id)) {
            return ok(SUCCESS);
        } else {
            return unauthorized(FAIL);
        }
    }

    /**
     * get all documents of one type based of the scope (own / friends / all).
     *
     * @param type  the type of the document.
     * @param scope the scope of the document.
     * @return a result containing a json object containing the documents.
     */
    @play.mvc.Security.Authenticated(AccountAPI.SecuredAPI.class)
    public Result getDocuments(String type, String scope) {
        String session = session(IAccountController.AUTHN_COOKIE_KEY);

        return ok(Json.toJson(controller.getDocuments(type, session, session, scope)));
    }

    /**
     * get all documents that belong to one parent document (for example alle waypoints for one boat)
     *
     * @param document the type of the document.
     * @param parent   the type of the parent document.
     * @param id       the id of the parent document.
     * @return a result containing the child documents.
     */
    @play.mvc.Security.Authenticated(AccountAPI.SecuredAPI.class)
    public Result getByParent(String document, String parent, UUID id) {
        String session = session(IAccountController.AUTHN_COOKIE_KEY);

        return ok(Json.toJson(controller.getByParent(document, parent, session, id)));
    }

    /**
     * create a document. the document to be saved must be new or must contain the latest revision.
     *
     * @param document the type of the document.
     * @return on success, the saved document with new rev or HTTP 500 with a json object explaining the error.
     */
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
        } catch (UpdateConflictException e) {
            logger.exc(e);
            return internalServerError(DOCUMENT_UPDATE_CONFLICT);
        }
    }

    /**
     * send friend request or approve a received one. this method needs the uuid of the other account as parameter.
     *
     * @param askedPersonUUID the uuid of the other account (asking or asked one).
     * @return whether it succeeded.
     */
    @play.mvc.Security.Authenticated(AccountAPI.SecuredAPI.class)
    public Result sendFriendRequest(UUID askedPersonUUID) {
        try {
            return ok(Json.toJson(controller.addFriend(session(IAccountController.AUTHN_COOKIE_KEY), askedPersonUUID)));
        } catch (NullPointerException e) {
            return internalServerError(EMPTY);
        }
    }

    /**
     * send friend request or approve a received one. this method needs the mail adress of the other account as parameter.
     *
     * @param mail the mail of the other account (asking or asked one).
     * @return whether it succeeded.
     */
    @play.mvc.Security.Authenticated(AccountAPI.SecuredAPI.class)
    public Result sendFriendRequestMail(String mail) {
        try {
            return ok(Json.toJson(controller.addFriend(session(IAccountController.AUTHN_COOKIE_KEY), mail)));
        } catch (NullPointerException e) {
            return internalServerError(EMPTY);
        }
    }

    /**
     * add a photo as attachement to an existing document.
     *
     * @param uuid the uuid of the document the attachement will be added to.
     * @param type the type of the document (mark or waypoint).
     * @return whether it succeeded.
     * @throws FileNotFoundException
     */
    @play.mvc.Security.Authenticated(AccountAPI.SecuredAPI.class)
    public Result addPhoto(UUID uuid, String type) throws FileNotFoundException {
        String session = session(IAccountController.AUTHN_COOKIE_KEY);

        Http.RequestBody s = request().body();

        Http.MultipartFormData body = s.asMultipartFormData();
        Http.MultipartFormData.FilePart picture = body.getFile("picture");
        if (picture != null) {
            String contentType = picture.getContentType();
            File file = picture.getFile();
            String revision = controller.addPhoto(session, uuid, contentType, file, type);
            if (revision != null) {
                return ok(Json.parse(String.format("{\"_rev\": \"%s\"}", revision)));
            } else {
                return internalServerError(FILE_UPLOAD_FAILED);
            }
        } else {
            return internalServerError(FILE_UPLOAD_FAILED);
        }
    }

    /**
     * retrieve the attachement of an document.
     *
     * @param id the id of the document containing the attachement.
     * @param type the type of the document (mark or waypoint).
     * @return the photo as blob stream.
     * @throws FileNotFoundException
     */
    @play.mvc.Security.Authenticated(AccountAPI.SecuredAPI.class)
    public Result getPhoto(UUID id, String type) throws FileNotFoundException {
        String session = session(IAccountController.AUTHN_COOKIE_KEY);
        InputStream s = controller.getPhoto(session, id, type);
        if (s == null) {
            return internalServerError();
        }

        return ok(s).as("image/jpeg");
    }

    /**
     * retrieve a list of all persons which have sent friend requests to the logged in user.
     *
     * @return list of all person objects which have sent friend requests.
     */
    @play.mvc.Security.Authenticated(AccountAPI.SecuredAPI.class)
    public Result names() {
        return ok(Json.toJson(controller.getAskingPerson(session(IAccountController.AUTHN_COOKIE_KEY))));
    }
}
