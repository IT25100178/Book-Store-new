package com.bookstore.handlers;

import com.bookstore.models.Author;
import com.bookstore.services.AuthorService;
import com.bookstore.server.BaseHandler;
import com.bookstore.storage.FileStorage;
import com.sun.net.httpserver.HttpExchange;

import java.io.IOException;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

public class AuthorHandler extends BaseHandler {
    private final AuthorService authorService = new AuthorService();

    @Override
    public void handle(HttpExchange exchange) throws IOException {
        if (handlePreflight(exchange)) return;

        String method = exchange.getRequestMethod().toUpperCase();
        String path = exchange.getRequestURI().getPath();

        try {
            if ("GET".equals(method)) {
                List<Author> authors = authorService.getAllAuthors();
                List<String> jsons = authors.stream().map(Author::toJson).collect(Collectors.toList());
                sendSuccess(exchange, toJsonArray(jsons));
            } else if ("POST".equals(method)) {
                Map<String, String> data = FileStorage.parseJsonBody(readBody(exchange));
                if (!data.containsKey("name")) {
                    sendBadRequest(exchange, "Name is required");
                    return;
                }
                Author author = new Author(
                    null, 
                    data.get("name"), 
                    data.getOrDefault("role", ""), 
                    data.getOrDefault("bio", ""), 
                    data.getOrDefault("imageUrl", ""),
                    data.getOrDefault("timeline", ""),
                    data.getOrDefault("quote", ""),
                    data.getOrDefault("masterpiece", "")
                );
                Author created = authorService.createAuthor(author);
                sendCreated(exchange, created.toJson());
            } else if ("PUT".equals(method) && path.matches("/api/authors/.+")) {
                String id = path.substring(path.lastIndexOf('/') + 1);
                Map<String, String> data = FileStorage.parseJsonBody(readBody(exchange));
                Author author = new Author(
                    null, 
                    data.get("name"), 
                    data.getOrDefault("role", ""), 
                    data.getOrDefault("bio", ""), 
                    data.getOrDefault("imageUrl", ""),
                    data.getOrDefault("timeline", ""),
                    data.getOrDefault("quote", ""),
                    data.getOrDefault("masterpiece", "")
                );
                Author updated = authorService.updateAuthor(id, author);
                if (updated != null) sendSuccess(exchange, updated.toJson());
                else sendNotFound(exchange, "Author");
            } else if ("DELETE".equals(method) && path.matches("/api/authors/.+")) {
                String id = path.substring(path.lastIndexOf('/') + 1);
                if (authorService.deleteAuthor(id)) sendSuccess(exchange, "{\"message\":\"Deleted successfully\"}");
                else sendNotFound(exchange, "Author");
            } else {
                sendMethodNotAllowed(exchange);
            }
        } catch (Exception e) {
            e.printStackTrace();
            sendError(exchange, 500, "Internal server error");
        }
    }
}
