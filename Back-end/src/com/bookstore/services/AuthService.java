package com.bookstore.services;

import com.bookstore.models.User;
import com.bookstore.storage.FileStorage;

import java.time.LocalDate;
import java.util.*;

/**
 * AuthService – Member 1 (Athethan)
 *
 * Handles user registration, login, and forgot-password logic.
 * All users are stored in Back-end/data/users.txt
 */
public class AuthService {

    private static final String FILE = "users.txt";

    // ── Read all users ────────────────────────────────────────────────────────

    public List<User> getAllUsers() {
        List<User> users = new ArrayList<>();
        for (String line : FileStorage.readLines(FILE)) {
            User u = User.fromFileLine(line);
            if (u != null) users.add(u);
        }
        return users;
    }

    // ── Find by email ─────────────────────────────────────────────────────────

    public User findByEmail(String email) {
        for (User u : getAllUsers()) {
            if (u.getEmail().equalsIgnoreCase(email)) return u;
        }
        return null;
    }

    public User findById(String id) {
        for (User u : getAllUsers()) {
            if (u.getId().equals(id)) return u;
        }
        return null;
    }

    // ── Register ──────────────────────────────────────────────────────────────

    /**
     * Validates and registers a new user.
     * Returns a result map: { success: true/false, message: "...", user: {...} }
     */
    public Map<String, Object> register(String name, String email,
                                        String password, String phone) {
        // Fallback for legacy calls (like seeders)
        String countryCode = "";
        String contactNumber = "";
        if (phone != null && !phone.isEmpty()) {
            if (phone.startsWith("+94")) {
                countryCode = "+94";
                contactNumber = phone.substring(3);
            } else if (phone.startsWith("+91")) {
                countryCode = "+91";
                contactNumber = phone.substring(3);
            } else if (phone.startsWith("+65")) {
                countryCode = "+65";
                contactNumber = phone.substring(3);
            } else if (phone.startsWith("+44")) {
                countryCode = "+44";
                contactNumber = phone.substring(3);
            } else if (phone.startsWith("+1")) {
                countryCode = "+1";
                contactNumber = phone.substring(2);
            } else {
                contactNumber = phone;
            }
        }
        return register(name, email, password, countryCode, contactNumber);
    }

    public Map<String, Object> register(String name, String email,
                                        String password, String countryCode, String contactNumber) {
        Map<String, Object> result = new LinkedHashMap<>();

        // ── Validation ───────────────────────────────────────────────────────
        if (name == null || name.trim().length() < 2) {
            result.put("success", false);
            result.put("message", "Name must be at least 2 characters");
            return result;
        }
        if (email == null || !email.contains("@") || !email.contains(".")) {
            result.put("success", false);
            result.put("message", "Please enter a valid email address");
            return result;
        }
        if (password == null || password.length() < 6) {
            result.put("success", false);
            result.put("message", "Password must be at least 6 characters");
            return result;
        }

        // Check duplicate email
        if (findByEmail(email) != null) {
            result.put("success", false);
            result.put("message", "Email is already registered");
            return result;
        }

        // Phone Validation (required for new registrations)
        if (countryCode == null || countryCode.trim().isEmpty()) {
            result.put("success", false);
            result.put("message", "Country code is required");
            return result;
        }
        if (contactNumber == null || contactNumber.trim().isEmpty()) {
            result.put("success", false);
            result.put("message", "Contact number is required");
            return result;
        }

        // Trim input values
        String cleanCountry = countryCode.trim();
        String cleanNumber = contactNumber.trim();

        // 1. Accept only digits. Reject if there are symbols, spaces, letters
        if (!cleanNumber.matches("^\\d+$")) {
            result.put("success", false);
            result.put("message", "Contact number must contain only digits.");
            return result;
        }

        // 2. Validate phone number based on selected country
        int expectedLength = -1;
        if ("+94".equals(cleanCountry)) {
            expectedLength = 9; // Sri Lanka
        } else if ("+91".equals(cleanCountry)) {
            expectedLength = 10; // India
        } else if ("+65".equals(cleanCountry)) {
            expectedLength = 8; // Singapore
        } else if ("+44".equals(cleanCountry)) {
            expectedLength = 10; // UK
        } else if ("+1".equals(cleanCountry)) {
            expectedLength = 10; // US
        }

        if (expectedLength != -1 && cleanNumber.length() != expectedLength) {
            result.put("success", false);
            result.put("message", "Invalid phone number for selected country.");
            return result;
        }

        // ── Create user ───────────────────────────────────────────────────────
        String id      = "USR" + System.currentTimeMillis();
        String avatar  = "https://ui-avatars.com/api/?background=D4AF37&color=fff&name=" +
                         name.replace(" ", "+");
        String joined  = LocalDate.now().toString();
        String fullPhone = cleanCountry + cleanNumber;

        User user = new User(id, name.trim(), email.toLowerCase().trim(),
                             password, fullPhone, "", "USER", avatar, joined);

        FileStorage.appendLine(FILE, user.toFileLine());

        result.put("success", true);
        result.put("message", "Registration successful!");
        result.put("user", user.toJson());
        return result;
    }

    // ── Login ─────────────────────────────────────────────────────────────────

    public Map<String, Object> login(String email, String password) {
        Map<String, Object> result = new LinkedHashMap<>();

        if (email == null || email.isBlank()) {
            result.put("success", false);
            result.put("message", "Email is required");
            return result;
        }
        if (password == null || password.isBlank()) {
            result.put("success", false);
            result.put("message", "Password is required");
            return result;
        }

        User user = findByEmail(email);
        if (user == null || !user.getPassword().equals(password)) {
            result.put("success", false);
            result.put("message", "Invalid email or password");
            return result;
        }

        if (user.isBlocked()) {
            result.put("success", false);
            result.put("message", "Your account has been blocked. Access denied.");
            return result;
        }

        result.put("success", true);
        result.put("message", "Login successful!");
        result.put("user", user.toJson());
        return result;
    }

    // ── Forgot Password (reset) ───────────────────────────────────────────────

    /**
     * Resets the password if the email exists.
     * In a real system this would send an email; here it accepts a new password directly.
     */
    public Map<String, Object> resetPassword(String email, String newPassword) {
        Map<String, Object> result = new LinkedHashMap<>();

        if (email == null || email.isBlank()) {
            result.put("success", false);
            result.put("message", "Email is required");
            return result;
        }
        if (newPassword == null || newPassword.length() < 6) {
            result.put("success", false);
            result.put("message", "New password must be at least 6 characters");
            return result;
        }

        List<User> users    = getAllUsers();
        boolean    found    = false;
        List<String> lines  = new ArrayList<>();

        for (User u : users) {
            if (u.getEmail().equalsIgnoreCase(email)) {
                u.setPassword(newPassword);
                found = true;
            }
            lines.add(u.toFileLine());
        }

        if (!found) {
            result.put("success", false);
            result.put("message", "No account found with this email");
            return result;
        }

        FileStorage.writeLines(FILE, lines);
        result.put("success", true);
        result.put("message", "Password has been reset successfully");
        return result;
    }
}
