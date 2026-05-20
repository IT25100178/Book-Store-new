package com.bookstore.handlers;

import com.bookstore.server.BaseHandler;
import com.bookstore.services.UserService;
import com.bookstore.storage.FileStorage;
import com.sun.net.httpserver.HttpExchange;

import java.io.IOException;
import java.util.Map;

/**
 * ReviewHandler – Handles review replies and review reporting.
 * Routes:
 *   POST /api/reviews/{id}/reply
 *   POST /api/reviews/{id}/report
 */
public class ReviewHandler extends BaseHandler {
    private final UserService userService = new UserService();

    @Override
    public void handle(HttpExchange exchange) throws IOException {
        if (handlePreflight(exchange)) return;

        String path = exchange.getRequestURI().getPath();
        String method = exchange.getRequestMethod().toUpperCase();
        String sub = path.replaceFirst("^/api/reviews", ""); // ex: "/{id}/reply"

        try {
            if (sub.matches("/[^/]+/reply") && "POST".equals(method)) {
                String reviewId = sub.split("/")[1];
                handleReply(exchange, reviewId);
            } else if (sub.matches("/[^/]+/report") && "POST".equals(method)) {
                String reviewId = sub.split("/")[1];
                handleReport(exchange, reviewId);
            } else {
                sendNotFound(exchange, "Review endpoint");
            }
        } catch (Exception e) {
            sendError(exchange, 500, "Internal error: " + e.getMessage());
        }
    }

    private void handleReply(HttpExchange exchange, String reviewId) throws IOException {
        Map<String, String> data = FileStorage.parseJsonBody(readBody(exchange));
        String userId = data.get("userId");
        String replyText = data.get("adminReply");
        if (replyText == null) {
            replyText = data.get("reply");
        }

        if (userId == null || replyText == null || replyText.trim().isEmpty()) {
            sendBadRequest(exchange, "userId and reply text are required");
            return;
        }

        Map<String, Object> result = userService.replyToReview(reviewId, userId, replyText);

        if (Boolean.TRUE.equals(result.get("success"))) {
            sendSuccess(exchange, "{\"success\":true,\"message\":\"" + result.get("message") + "\"}");
        } else {
            sendBadRequest(exchange, (String) result.get("message"));
        }
    }

    private void handleReport(HttpExchange exchange, String reviewId) throws IOException {
        Map<String, String> data = FileStorage.parseJsonBody(readBody(exchange));
        String userId = data.get("userId");
        String reason = data.get("reportReason");
        if (reason == null) {
            reason = data.get("reason");
        }

        if (userId == null || reason == null || reason.trim().isEmpty()) {
            sendBadRequest(exchange, "userId and reportReason are required");
            return;
        }

        Map<String, Object> result = userService.reportReview(reviewId, userId, reason);

        if (Boolean.TRUE.equals(result.get("success"))) {
            sendSuccess(exchange, "{\"success\":true,\"message\":\"" + result.get("message") + "\"}");
        } else {
            sendBadRequest(exchange, (String) result.get("message"));
        }
    }
}
