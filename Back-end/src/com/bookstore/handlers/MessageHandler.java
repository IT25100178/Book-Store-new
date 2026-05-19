package com.bookstore.handlers;

import com.bookstore.models.Message;
import com.bookstore.services.MessageService;
import com.bookstore.server.BaseHandler;
import com.bookstore.storage.FileStorage;
import com.sun.net.httpserver.HttpExchange;

import java.io.IOException;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

public class MessageHandler extends BaseHandler {
    private final MessageService messageService = new MessageService();

    @Override
    public void handle(HttpExchange exchange) throws IOException {
        if (handlePreflight(exchange)) return;

        String method = exchange.getRequestMethod().toUpperCase();
        String path = exchange.getRequestURI().getPath();

        try {
            if ("GET".equals(method)) {
                List<Message> messages = messageService.getAllMessages();
                List<String> jsons = messages.stream().map(Message::toJson).collect(Collectors.toList());
                sendSuccess(exchange, toJsonArray(jsons));
            } else if ("POST".equals(method)) {
                Map<String, String> data = FileStorage.parseJsonBody(readBody(exchange));
                if (!data.containsKey("name") || !data.containsKey("email") || !data.containsKey("body")) {
                    sendBadRequest(exchange, "Missing required fields");
                    return;
                }
                Message msg = new Message(null, data.get("name"), data.get("email"), data.getOrDefault("subject", ""), data.get("body"), "NEW", null);
                Message created = messageService.createMessage(msg);
                sendCreated(exchange, created.toJson());
            } else if ("PUT".equals(method) && path.matches("/api/messages/.+")) {
                String id = path.substring(path.lastIndexOf('/') + 1);
                Map<String, String> data = FileStorage.parseJsonBody(readBody(exchange));
                Message updated = messageService.updateMessageStatus(id, data.get("status"));
                if (updated != null) sendSuccess(exchange, updated.toJson());
                else sendNotFound(exchange, "Message");
            } else if ("DELETE".equals(method) && path.matches("/api/messages/.+")) {
                String id = path.substring(path.lastIndexOf('/') + 1);
                if (messageService.deleteMessage(id)) sendSuccess(exchange, "{\"message\":\"Deleted successfully\"}");
                else sendNotFound(exchange, "Message");
            } else {
                sendMethodNotAllowed(exchange);
            }
        } catch (Exception e) {
            e.printStackTrace();
            sendError(exchange, 500, "Internal server error");
        }
    }
}
