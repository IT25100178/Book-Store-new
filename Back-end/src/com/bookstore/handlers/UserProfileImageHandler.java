package com.bookstore.handlers;

import com.bookstore.models.User;
import com.bookstore.server.BaseHandler;
import com.bookstore.services.UserService;
import com.bookstore.storage.FileStorage;
import com.sun.net.httpserver.HttpExchange;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Base64;
import java.util.HashMap;
import java.util.Map;
import java.util.Set;
import java.util.UUID;

public class UserProfileImageHandler extends BaseHandler {

    private static final Path UPLOAD_FOLDER = Paths.get("Back-end/uploads/profile-images");
    private static final String PUBLIC_PREFIX = "/uploads/profile-images/";
    private static final String PUBLIC_BASE_URL = "http://localhost:8080" + PUBLIC_PREFIX;
    private static final Set<String> ALLOWED_MIMES = Set.of("image/png", "image/jpeg", "image/jpg");

    private final UserService userService = new UserService();
    private final boolean adminRoute;

    public UserProfileImageHandler(boolean adminRoute) {
        this.adminRoute = adminRoute;
    }

    @Override
    public void handle(HttpExchange exchange) throws IOException {
        if (handlePreflight(exchange)) return;

        String method = exchange.getRequestMethod().toUpperCase();
        String path   = exchange.getRequestURI().getPath();

        if (path.endsWith("/upload-profile-image") && "POST".equals(method)) {
            handleUpload(exchange);
        } else if (path.endsWith("/profile/upload-image") && "POST".equals(method)) {
            handleUpload(exchange);
        } else if (path.endsWith("/profile/update-image") && "PUT".equals(method)) {
            handleUpload(exchange);
        } else if (path.endsWith("/remove-profile-image") && "DELETE".equals(method)) {
            handleRemove(exchange);
        } else if (path.endsWith("/profile/remove-image") && "DELETE".equals(method)) {
            handleRemove(exchange);
        } else {
            sendMethodNotAllowed(exchange);
        }
    }

    private void handleUpload(HttpExchange exchange) throws IOException {
        Map<String, String> data = FileStorage.parseJsonBody(readBody(exchange));
        String idKey = adminRoute ? "adminId" : "userId";
        String userId = data.get(idKey);
        String fileName = data.get("fileName");
        String fileData = data.get("fileData");

        if (userId == null || fileName == null || fileData == null) {
            sendBadRequest(exchange, "userId/adminId, fileName, and fileData are required");
            return;
        }

        User user = userService.findById(userId);
        if (user == null) {
            sendNotFound(exchange, "User");
            return;
        }

        if (adminRoute && !"ADMIN".equals(user.getRole())) {
            sendError(exchange, 403, "Forbidden. Admin role required.");
            return;
        }

        try {
            String imageUrl = saveProfileImage(user, fileName, fileData);
            Map<String, String> update = new HashMap<>();
            update.put("avatar", imageUrl);
            userService.updateProfile(userId, update);
            sendSuccess(exchange, String.format("{\"success\":true,\"avatar\":\"%s\"}", esc(imageUrl)));
        } catch (IllegalArgumentException ex) {
            sendBadRequest(exchange, ex.getMessage());
        } catch (IOException ex) {
            sendError(exchange, 500, "Unable to process image upload.");
        }
    }

    private void handleRemove(HttpExchange exchange) throws IOException {
        Map<String, String> data = FileStorage.parseJsonBody(readBody(exchange));
        String idKey = adminRoute ? "adminId" : "userId";
        String userId = data.get(idKey);

        if (userId == null) {
            sendBadRequest(exchange, "userId/adminId is required");
            return;
        }

        User user = userService.findById(userId);
        if (user == null) {
            sendNotFound(exchange, "User");
            return;
        }

        if (adminRoute && !"ADMIN".equals(user.getRole())) {
            sendError(exchange, 403, "Forbidden. Admin role required.");
            return;
        }

        deleteExistingAvatar(user.getAvatar());
        Map<String, String> update = new HashMap<>();
        update.put("avatar", "");
        userService.updateProfile(userId, update);
        sendSuccess(exchange, "{\"success\":true,\"message\":\"Profile image removed\"}");
    }

    private String saveProfileImage(User user, String originalName, String base64Data) throws IOException {
        String payload = base64Data.trim();
        String mimeType = null;
        String encoded = payload;

        if (payload.startsWith("data:")) {
            int comma = payload.indexOf(',');
            if (comma < 0) throw new IllegalArgumentException("Invalid image upload format.");
            String meta = payload.substring(5, comma);
            int semicolon = meta.indexOf(';');
            mimeType = (semicolon >= 0) ? meta.substring(0, semicolon) : meta;
            encoded = payload.substring(comma + 1);
        }

        if (mimeType == null) {
            mimeType = inferMimeTypeFromFilename(originalName);
        }

        if (mimeType == null || !ALLOWED_MIMES.contains(mimeType.toLowerCase())) {
            throw new IllegalArgumentException("Only JPG, JPEG, and PNG images are supported.");
        }

        byte[] fileBytes;
        try {
            fileBytes = Base64.getDecoder().decode(encoded);
        } catch (IllegalArgumentException ex) {
            throw new IllegalArgumentException("Invalid base64 image data.");
        }

        if (fileBytes.length > 3 * 1024 * 1024) {
            throw new IllegalArgumentException("Image must be smaller than 3 MB.");
        }

        Files.createDirectories(UPLOAD_FOLDER);
        deleteExistingAvatar(user.getAvatar());

        String extension = mimeType.equals("image/png") ? ".png" : ".jpg";
        String safeName = UUID.randomUUID().toString() + extension;
        Path target = UPLOAD_FOLDER.resolve(safeName);
        Files.write(target, fileBytes);

        return PUBLIC_BASE_URL + safeName;
    }

    private String inferMimeTypeFromFilename(String fileName) {
        String lower = fileName.toLowerCase();
        if (lower.endsWith(".png")) return "image/png";
        if (lower.endsWith(".jpg") || lower.endsWith(".jpeg")) return "image/jpeg";
        return null;
    }

    private void deleteExistingAvatar(String avatarUrl) {
        if (avatarUrl == null || avatarUrl.isBlank()) return;
        String key = avatarUrl;
        if (key.startsWith(PUBLIC_BASE_URL)) {
            key = key.substring(PUBLIC_BASE_URL.length());
        } else if (key.startsWith(PUBLIC_PREFIX)) {
            key = key.substring(PUBLIC_PREFIX.length());
        } else {
            return;
        }
        Path file = UPLOAD_FOLDER.resolve(key).normalize();
        if (file.startsWith(UPLOAD_FOLDER) && Files.exists(file)) {
            try { Files.delete(file); } catch (IOException ignored) {}
        }
    }

    private String esc(String s) {
        return s == null ? "" : s.replace("\\", "\\\\").replace("\"", "\\\"");
    }
}
