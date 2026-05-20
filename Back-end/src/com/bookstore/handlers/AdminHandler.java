package com.bookstore.handlers;

import com.bookstore.models.Review;
import com.bookstore.server.BaseHandler;
import com.bookstore.services.UserService;
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
}
