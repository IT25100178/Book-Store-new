package com.bookstore.handlers;

import com.bookstore.server.BaseHandler;
import com.sun.net.httpserver.HttpExchange;

import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;

public class StaticFileHandler extends BaseHandler {

    private final Path rootFolder;

    public StaticFileHandler(String rootFolder) {
        this.rootFolder = Paths.get(rootFolder).toAbsolutePath().normalize();
    }

    @Override
    public void handle(HttpExchange exchange) throws IOException {
        if (!"GET".equalsIgnoreCase(exchange.getRequestMethod())) {
            sendMethodNotAllowed(exchange);
            return;
        }

        String requestPath = exchange.getRequestURI().getPath();
        if (!requestPath.startsWith("/uploads/")) {
            sendNotFound(exchange, "File");
            return;
        }

        Path file = rootFolder.resolve(requestPath.substring(1)).normalize();
        if (!file.startsWith(rootFolder) || !Files.exists(file) || Files.isDirectory(file)) {
            sendNotFound(exchange, "File");
            return;
        }

        String contentType = getContentType(file.toString());
        exchange.getResponseHeaders().set("Content-Type", contentType);
        exchange.getResponseHeaders().set("Access-Control-Allow-Origin", "*");
        long length = Files.size(file);
        exchange.sendResponseHeaders(200, length);

        try (OutputStream os = exchange.getResponseBody(); InputStream is = Files.newInputStream(file)) {
            byte[] buffer = new byte[8192];
            int read;
            while ((read = is.read(buffer)) != -1) {
                os.write(buffer, 0, read);
            }
        }
    }

    private String getContentType(String filePath) {
        String lower = filePath.toLowerCase();
        if (lower.endsWith(".png")) return "image/png";
        if (lower.endsWith(".jpg") || lower.endsWith(".jpeg")) return "image/jpeg";
        return "application/octet-stream";
    }
}
