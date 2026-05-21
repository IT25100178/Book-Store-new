package com.bookstore.handlers;

import com.bookstore.models.Review;
import com.bookstore.server.BaseHandler;
import com.bookstore.services.UserService;
import com.bookstore.storage.FileStorage;
import com.sun.net.httpserver.HttpExchange;

import java.io.IOException;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * AdminReviewHandler handles administrative review operations:
 *   GET    /api/admin/reviews                  → List all reviews
 *   PUT    /api/admin/reviews/{id}/approve      → Approve a review
 *   DELETE /api/admin/reviews/{id}              → Delete a review
 */
public class AdminReviewHandler extends BaseHandler {

    private final UserService userService = new UserService();

    @Override
    public void handle(HttpExchange exchange) throws IOException {
        if (handlePreflight(exchange)) return;

        String path   = exchange.getRequestURI().getPath();
        String method = exchange.getRequestMethod().toUpperCase();
        String sub    = path.replaceFirst("^/api/admin/reviews", "");

        try {
            if (sub.isEmpty() || sub.equals("/")) {
                if ("GET".equals(method)) {
                    handleListReviews(exchange);
                } else {
                    sendMethodNotAllowed(exchange);
                }
                return;
            }

            // Sub paths: /{id}/approve, /{id}/reply, /{id}/complain or /{id}
            String[] parts = sub.split("/");
            // parts[0]="" parts[1]=reviewId parts[2]=action
            if (parts.length < 2) {
                sendNotFound(exchange, "Admin Reviews endpoint");
                return;
            }

            String reviewId = parts[1];
            String action   = (parts.length > 2) ? parts[2] : "";

            if ("approve".equals(action) && "PUT".equals(method)) {
                handleApproveReview(exchange, reviewId);
            } else if ("reply".equals(action) && ("POST".equals(method) || "PUT".equals(method))) {
                handleReplyReview(exchange, reviewId);
            } else if ("complain".equals(action) && "POST".equals(method)) {
                handleComplainReview(exchange, reviewId);
            } else if (action.isEmpty() && "DELETE".equals(method)) {
                handleDeleteReview(exchange, reviewId);
            } else {
                sendMethodNotAllowed(exchange);
            }

        } catch (Exception e) {
            sendError(exchange, 500, "Internal error: " + e.getMessage());
        }
    }

    private void handleReplyReview(HttpExchange exchange, String reviewId) throws IOException {
        String body = readBody(exchange);
        Map<String, String> data = FileStorage.parseJsonBody(body);

        String replyText = data.get("reply");
        if (replyText == null) {
            replyText = data.get("adminReply");
        }

        if (replyText == null || replyText.trim().isEmpty()) {
            sendBadRequest(exchange, "Reply message cannot be empty");
            return;
        }

        // Retrieve adminId from request
        String adminId = exchange.getRequestHeaders().getFirst("X-Admin-Id");
        if (adminId == null || adminId.isEmpty()) {
            adminId = exchange.getRequestHeaders().getFirst("Authorization");
        }
        if (adminId == null || adminId.isEmpty()) {
            String query = exchange.getRequestURI().getQuery();
            Map<String, String> queryMap = parseQuery(query);
            adminId = queryMap.get("adminId");
        }
        if (adminId == null || adminId.isEmpty()) {
            adminId = data.get("adminId");
        }

        if (adminId == null || adminId.isEmpty()) {
            sendError(exchange, 401, "Unauthorized. Admin ID is required.");
            return;
        }

        if (!isAdminUser(adminId)) {
            sendError(exchange, 403, "Forbidden. Active admin role required.");
            return;
        }

        Map<String, Object> result = userService.replyToReview(reviewId, adminId, replyText);
        if (Boolean.TRUE.equals(result.get("success"))) {
            Review updatedReview = (Review) result.get("review");
            if (updatedReview != null) {
                sendSuccess(exchange, updatedReview.toJson());
            } else {
                sendSuccess(exchange, "{\"success\":true}");
            }
        } else {
            sendBadRequest(exchange, (String) result.get("message"));
        }
    }

    private void handleComplainReview(HttpExchange exchange, String reviewId) throws IOException {
        String body = readBody(exchange);
        Map<String, String> data = FileStorage.parseJsonBody(body);
        String adminId = data.get("adminId");
        String reason = data.get("reason");

        if (adminId == null || adminId.isEmpty()) {
            String query = exchange.getRequestURI().getQuery();
            Map<String, String> queryMap = parseQuery(query);
            adminId = queryMap.get("adminId");
        }
        if (adminId == null || adminId.isEmpty()) {
            adminId = exchange.getRequestHeaders().getFirst("X-Admin-Id");
        }
        if (adminId == null || adminId.isEmpty()) {
            adminId = exchange.getRequestHeaders().getFirst("Authorization");
        }

        if (adminId == null || reason == null || reason.trim().isEmpty()) {
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
    }

    private boolean isAdminUser(String adminId) {
        if (adminId == null) return false;
        com.bookstore.models.User user = userService.findById(adminId);
        return user != null && "ADMIN".equals(user.getRole()) && !user.isBlocked();
    }

    private void handleListReviews(HttpExchange exchange) throws IOException {
        List<Review> reviews = userService.getAllReviews();
        List<String> jsons   = reviews.stream().map(Review::toJson).collect(Collectors.toList());
        sendSuccess(exchange, toJsonArray(jsons));
    }

    private void handleApproveReview(HttpExchange exchange, String reviewId) throws IOException {
        Map<String, Object> result = userService.approveReview(reviewId);
        if (Boolean.TRUE.equals(result.get("success"))) {
            sendSuccess(exchange, "{\"success\":true,\"message\":\"" + result.get("message") + "\"}");
        } else {
            sendNotFound(exchange, "Review");
        }
    }

    private void handleDeleteReview(HttpExchange exchange, String reviewId) throws IOException {
        Map<String, Object> result = userService.deleteReview(reviewId, "admin");
        if (Boolean.TRUE.equals(result.get("success"))) {
            sendSuccess(exchange, "{\"success\":true,\"message\":\"" + result.get("message") + "\"}");
        } else {
            sendNotFound(exchange, "Review");
        }
    }
}
