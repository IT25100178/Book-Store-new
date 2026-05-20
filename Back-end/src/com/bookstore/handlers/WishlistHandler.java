package com.bookstore.handlers;

import com.bookstore.models.Book;
import com.bookstore.models.WishlistItem;
import com.bookstore.server.BaseHandler;
import com.bookstore.services.BookService;
import com.bookstore.services.UserService;
import com.bookstore.storage.FileStorage;
import com.sun.net.httpserver.HttpExchange;

import java.io.IOException;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * WishlistHandler – manages user wishlist CRUD and lookup.
 * Routes:
 *   GET    /api/wishlist               → get wishlist items with book details
 *   POST   /api/wishlist/add           → add a book to a user's wishlist
 *   DELETE /api/wishlist/remove/{id}   → remove a book from a user's wishlist
 */
public class WishlistHandler extends BaseHandler {
    private final UserService userService = new UserService();
    private final BookService bookService = new BookService();

    @Override
    public void handle(HttpExchange exchange) throws IOException {
        if (handlePreflight(exchange)) return;

        String path   = exchange.getRequestURI().getPath();
        String method = exchange.getRequestMethod().toUpperCase();
        String sub    = path.replaceFirst("^/api/wishlist", "");

        try {
            if (sub.isEmpty() || sub.equals("/")) {
                if ("GET".equals(method)) handleGetWishlist(exchange);
                else sendMethodNotAllowed(exchange);
            } else if (sub.equals("/add") && "POST".equals(method)) {
                handleAddWishlist(exchange);
            } else if (sub.matches("/remove/[^/]+") && "DELETE".equals(method)) {
                String bookId = sub.split("/")[2];
                handleRemoveWishlist(exchange, bookId);
            } else {
                sendNotFound(exchange, "Wishlist endpoint");
            }
        } catch (Exception e) {
            sendError(exchange, 500, "Internal error: " + e.getMessage());
        }
    }

    private void handleGetWishlist(HttpExchange exchange) throws IOException {
        Map<String, String> query = parseQuery(exchange.getRequestURI().getRawQuery());
        String userId = query.get("userId");
        if (userId == null || userId.isBlank()) {
            sendBadRequest(exchange, "userId query parameter is required");
            return;
        }

        List<WishlistItem> items = userService.getWishlistByUser(userId);
        List<Book> books = bookService.getAllBooks();
        Map<String, Book> bookMap = new HashMap<>();
        for (Book book : books) {
            bookMap.put(book.getId(), book);
        }

        List<String> jsons = items.stream()
            .map(item -> item.toJson(bookMap.get(item.getBookId())))
            .collect(Collectors.toList());

        sendSuccess(exchange, toJsonArray(jsons));
    }

    private void handleAddWishlist(HttpExchange exchange) throws IOException {
        Map<String, String> data = FileStorage.parseJsonBody(readBody(exchange));
        String userId = data.get("userId");
        String bookId = data.get("bookId");

        if (userId == null || bookId == null || userId.isBlank() || bookId.isBlank()) {
            sendBadRequest(exchange, "userId and bookId are required");
            return;
        }

        Map<String, Object> result = userService.addToWishlist(userId, bookId);
        if (Boolean.TRUE.equals(result.get("success"))) {
            sendCreated(exchange, "{\"success\":true,\"message\":\"" + result.get("message") + "\"}");
        } else {
            sendBadRequest(exchange, (String) result.get("message"));
        }
    }

    private void handleRemoveWishlist(HttpExchange exchange, String bookId) throws IOException {
        Map<String, String> query = parseQuery(exchange.getRequestURI().getRawQuery());
        String userId = query.get("userId");

        if (userId == null || userId.isBlank()) {
            sendBadRequest(exchange, "userId query parameter is required");
            return;
        }

        Map<String, Object> result = userService.removeFromWishlist(userId, bookId);
        if (Boolean.TRUE.equals(result.get("success"))) {
            sendSuccess(exchange, "{\"success\":true,\"message\":\"" + result.get("message") + "\"}");
        } else {
            sendNotFound(exchange, "Wishlist item");
        }
    }
}
