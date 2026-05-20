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

            // Sub paths: /{id}/approve or /{id}
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
            } else if (action.isEmpty() && "DELETE".equals(method)) {
                handleDeleteReview(exchange, reviewId);
            } else {
                sendMethodNotAllowed(exchange);
            }

        } catch (Exception e) {
            sendError(exchange, 500, "Internal error: " + e.getMessage());
        }
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
