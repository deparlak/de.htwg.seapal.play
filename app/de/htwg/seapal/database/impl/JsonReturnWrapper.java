package de.htwg.seapal.database.impl;

import com.fasterxml.jackson.databind.node.JsonNodeFactory;
import com.fasterxml.jackson.databind.node.ObjectNode;

public class JsonReturnWrapper implements ReturnWrapper<ObjectNode> {
    private static JsonNodeFactory factory = JsonNodeFactory.instance;
    @Override
    public ObjectNode ok(String message) {
        return factory.objectNode().put("ok", message);
    }

    @Override
    public ObjectNode badRequest(String message) {
        return factory.objectNode().put("error", message);
    }

    @Override
    public ObjectNode notFound(String message) {
        return factory.objectNode().put("error", message);
    }

    @Override
    public ObjectNode unauthorized(String message) {
        return factory.objectNode().put("error", message);
    }

    @Override
    public ObjectNode forbidden(String message) {
        return factory.objectNode().put("error", message);
    }

    @Override
    public ObjectNode internalServerError(String message) {
        return factory.objectNode().put("error", message);
    }

    @Override
    public ObjectNode notSupported(String message) {
        return factory.objectNode().put("error", message);
    }

    @Override
    public ObjectNode authorized(String message) {
        return factory.objectNode().put("error", message);
    }
}
