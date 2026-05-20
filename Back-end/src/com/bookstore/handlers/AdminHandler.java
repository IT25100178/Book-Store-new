package com.bookstore.handlers;

import com.bookstore.models.Review;
import com.bookstore.server.BaseHandler;
import com.bookstore.services.UserService;
import com.bookstore.storage.FileStorage;
import com.sun.net.httpserver.HttpExchange;

import java.io.IOException;
import java.util.*;
import java.util.stream.Collectors;

/**
 * AdminHandler – Connects reviews fetch, approval, and deletion.
 */
public class AdminHandler extends BaseHandler {
    private final UserService userService = new UserService();

    @Override
    public void handle(HttpExchange exchange) throws IOException {
        if (handlePreflight(exchange)) return;

        String path   = exchange.getRequestURI().getPath(); // /api/admin/...
        String method = exchange.getRequestMethod().toUpperCase();
        String sub    = path.replaceFirst("^/api/admin", ""); // "/reviews", "/reviews/{id}/approve"

        try {
            if (sub.equals("/reviews")) {
                if ("GET".equals(method)) {
                    List<Review> reviews = userService.getAllReviews();
                    List<String> jsons = reviews.stream().map(Review::toJson).collect(Collectors.toList());
                    sendSuccess(exchange, toJsonArray(jsons));
                } else {
                    sendMethodNotAllowed(exchange);
                }
            } else if (sub.matches("/reviews/[^/]+/approve") && "POST".equals(method)) {
                String[] parts = sub.split("/");
                String reviewId = parts[2];
                Map<String, Object> result = userService.approveReview(reviewId);
                if (Boolean.TRUE.equals(result.get("success"))) {
                    sendSuccess(exchange, "{\"success\":true,\"message\":\"Review approved\"}");
                } else {
                    sendNotFound(exchange, "Review");
                }
            } else if (sub.matches("/reviews/[^/]+/reply") && "POST".equals(method)) {
                String[] parts = sub.split("/");
                String reviewId = parts[2];
                Map<String, String> data = FileStorage.parseJsonBody(readBody(exchange));
                String adminId = data.get("adminId");
                String replyText = data.get("adminReply");
                if (adminId == null || replyText == null) {
                    sendBadRequest(exchange, "adminId and adminReply are required");
                    return;
                }
                if (!isAdminUser(adminId)) {
                    sendError(exchange, 403, "Forbidden. Admin role required.");
                    return;
                }
                Map<String, Object> result = userService.replyToReview(reviewId, adminId, replyText);
                if (Boolean.TRUE.equals(result.get("success"))) {
                    sendSuccess(exchange, "{\"success\":true,\"message\":\"Reply submitted successfully\"}");
                } else {
                    sendBadRequest(exchange, (String) result.get("message"));
                }
            } else if (sub.matches("/reviews/[^/]+/complain") && "POST".equals(method)) {
                String[] parts = sub.split("/");
                String reviewId = parts[2];
                Map<String, String> data = FileStorage.parseJsonBody(readBody(exchange));
                String adminId = data.get("adminId");
                String reason = data.get("reason");
                if (adminId == null || reason == null) {
                    sendBadRequest(exchange, "adminId and reason are required");
                    return;
                }
                if (!isAdminUser(adminId)) {
                    sendError(exchange, 403, "Forbidden. Admin role required.");
                    return;
                }
                Map<String, Object> result = userService.flagReview(reviewId, reason);
                if (Boolean.TRUE.equals(result.get("success"))) {
                    sendSuccess(exchange, "{\"success\":true,\"message\":\"Review flagged as violent/inappropriate\"}");
                } else {
                    sendBadRequest(exchange, (String) result.get("message"));
                }
            } else if (sub.matches("/users/[^/]+/block") && "PUT".equals(method)) {
                String[] parts = sub.split("/");
                String userId = parts[2];
                Map<String, String> data = FileStorage.parseJsonBody(readBody(exchange));
                String adminId = data.get("adminId");
                String blockStr = data.get("block");
                if (adminId == null || blockStr == null) {
                    sendBadRequest(exchange, "adminId and block are required");
                    return;
                }
                if (!isAdminUser(adminId)) {
                    sendError(exchange, 403, "Forbidden. Admin role required.");
                    return;
                }
                boolean block = Boolean.parseBoolean(blockStr);
                Map<String, Object> result = userService.blockUser(userId, block);
                if (Boolean.TRUE.equals(result.get("success"))) {
                    sendSuccess(exchange, "{\"success\":true,\"message\":\"User block status updated\"}");
                } else {
                    sendBadRequest(exchange, (String) result.get("message"));
                }
            } else if (sub.matches("/reviews/[^/]+") && "DELETE".equals(method)) {
                String[] parts = sub.split("/");
                String reviewId = parts[2];
                Map<String, Object> result = userService.deleteReview(reviewId, "admin");
                if (Boolean.TRUE.equals(result.get("success"))) {
                    sendSuccess(exchange, "{\"success\":true,\"message\":\"Review deleted\"}");
                } else {
                    sendNotFound(exchange, "Review");
                }
            } else {
                sendNotFound(exchange, "Admin endpoint");
            }
        } catch (Exception e) {
            sendError(exchange, 500, "Internal error: " + e.getMessage());
        }
    }

    private boolean isAdminUser(String adminId) {
        if (adminId == null) return false;
        com.bookstore.models.User user = userService.findById(adminId);
        return user != null && "ADMIN".equals(user.getRole()) && !user.isBlocked();
    }
}
