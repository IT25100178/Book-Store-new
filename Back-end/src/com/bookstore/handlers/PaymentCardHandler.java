package com.bookstore.handlers;

import com.bookstore.models.PaymentCard;
import com.bookstore.server.BaseHandler;
import com.bookstore.services.PaymentCardService;
import com.bookstore.storage.FileStorage;
import com.sun.net.httpserver.HttpExchange;

import java.io.IOException;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * PaymentCardHandler
 * Routes:
 *   GET    /api/cards/{userId}    -> Get user's saved cards
 *   PUT    /api/cards/{id}        -> Edit card details (expiry)
 *   DELETE /api/cards/{id}        -> Delete saved card
 */
public class PaymentCardHandler extends BaseHandler {

    private final PaymentCardService cardService = new PaymentCardService();

    @Override
    public void handle(HttpExchange exchange) throws IOException {
        if (handlePreflight(exchange)) return;

        String path = exchange.getRequestURI().getPath();
        String method = exchange.getRequestMethod().toUpperCase();
        String sub = path.replaceFirst("^/api/(cards|payment/cards)", ""); // "/{userId}" or "/{id}"

        try {
            if ("POST".equals(method) && (sub.isEmpty() || "/".equals(sub))) {
                handleSaveCard(exchange);
            } else if (sub.matches("/[^/]+") && "GET".equals(method)) {
                String userId = sub.substring(1);
                handleGetCards(exchange, userId);

            } else if (sub.matches("/[^/]+") && "PUT".equals(method)) {
                String cardId = sub.substring(1);
                handleUpdateCard(exchange, cardId);

            } else if (sub.matches("/[^/]+") && "DELETE".equals(method)) {
                String cardId = sub.substring(1);
                handleDeleteCard(exchange, cardId);

            } else {
                sendNotFound(exchange, "Card endpoint");
            }
        } catch (Exception e) {
            sendError(exchange, 500, "Internal error: " + e.getMessage());
        }
    }

    private void handleSaveCard(HttpExchange exchange) throws IOException {
        Map<String, String> data = FileStorage.parseJsonBody(readBody(exchange));
        String userId = data.get("userId");
        String cardNumber = data.get("cardNumber");
        String expiryDate = data.get("expiryDate");
        String cardNickname = data.get("cardNickname");
        boolean isDefault = Boolean.parseBoolean(data.getOrDefault("isDefault", "false"));

        if (userId == null || cardNumber == null || expiryDate == null) {
            sendBadRequest(exchange, "userId, cardNumber, and expiryDate are required");
            return;
        }

        Map<String, Object> result = cardService.saveCard(userId, cardNumber, expiryDate, cardNickname, isDefault);
        if (Boolean.TRUE.equals(result.get("success"))) {
            sendCreated(exchange, "{\"success\":true,\"message\":\"" + result.get("message") + "\",\"card\":" + result.get("card") + "}");
        } else {
            sendBadRequest(exchange, (String) result.get("message"));
        }
    }

    private void handleGetCards(HttpExchange exchange, String userId) throws IOException {
        List<PaymentCard> cards = cardService.getCardsByUser(userId);
        List<String> jsons = cards.stream().map(PaymentCard::toJson).collect(Collectors.toList());
        sendSuccess(exchange, toJsonArray(jsons));
    }

    private void handleUpdateCard(HttpExchange exchange, String cardId) throws IOException {
        Map<String, String> data = FileStorage.parseJsonBody(readBody(exchange));
        String userId = data.get("userId");
        String newExpiry = data.get("expiryDate");
        String cardNickname = data.get("cardNickname");
        boolean isDefault = Boolean.parseBoolean(data.getOrDefault("isDefault", "false"));

        if (userId == null || newExpiry == null) {
            sendBadRequest(exchange, "userId and expiryDate are required");
            return;
        }

        Map<String, Object> result = cardService.updateCard(cardId, userId, newExpiry, cardNickname, isDefault);
        if (Boolean.TRUE.equals(result.get("success"))) {
            sendSuccess(exchange, "{\"success\":true,\"message\":\"" + result.get("message") + "\"}");
        } else {
            sendBadRequest(exchange, (String) result.get("message"));
        }
    }

    private void handleDeleteCard(HttpExchange exchange, String cardId) throws IOException {
        Map<String, String> data = FileStorage.parseJsonBody(readBody(exchange));
        String userId = data.get("userId");

        if (userId == null) {
            sendBadRequest(exchange, "userId is required for deletion");
            return;
        }

        Map<String, Object> result = cardService.deleteCard(cardId, userId);
        if (Boolean.TRUE.equals(result.get("success"))) {
            sendSuccess(exchange, "{\"success\":true,\"message\":\"" + result.get("message") + "\"}");
        } else {
            sendBadRequest(exchange, (String) result.get("message"));
        }
    }
}
