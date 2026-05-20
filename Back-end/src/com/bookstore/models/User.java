package com.bookstore.models;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

/**
 * OOP Model – User
 * Represents a registered user or admin in the system.
 * Data is serialized to / deserialized from users.txt
 */
public class User {

    // ── Fields ──────────────────────────────────────────────────────────────
    private String id;
    private String name;
    private String email;
    private String password;
    private String phone;
    private String address;
    private String role;        // "USER" | "ADMIN"
    private String avatar;
    private String joinDate;
    private String bio;
    private List<String> wishlist = new ArrayList<>();
    private boolean isBlocked = false;

    // ── Constructors ─────────────────────────────────────────────────────────

    public User() {}

    public User(String id, String name, String email, String password,
                String phone, String address, String role,
                String avatar, String joinDate) {
        this(id, name, email, password, phone, address, role, avatar, joinDate, "");
    }

    public User(String id, String name, String email, String password,
                String phone, String address, String role,
                String avatar, String joinDate, String bio) {
        this.id       = id;
        this.name     = name;
        this.email    = email;
        this.password = password;
        this.phone    = phone;
        this.address  = address;
        this.role     = role;
        this.avatar   = avatar;
        this.joinDate = joinDate;
        this.bio      = bio;
    }

    // ── Getters & Setters ────────────────────────────────────────────────────

    public String getId()                  { return id; }
    public void   setId(String id)         { this.id = id; }

    public String getName()                { return name; }
    public void   setName(String name)     { this.name = name; }

    public String getEmail()               { return email; }
    public void   setEmail(String email)   { this.email = email; }

    public String getPassword()                    { return password; }
    public void   setPassword(String password)     { this.password = password; }

    public String getPhone()               { return phone; }
    public void   setPhone(String phone)   { this.phone = phone; }

    public String getAddress()                   { return address; }
    public void   setAddress(String address)     { this.address = address; }

    public String getRole()                { return role; }
    public void   setRole(String role)     { this.role = role; }

    public String getAvatar()                  { return avatar; }
    public void   setAvatar(String avatar)     { this.avatar = avatar; }

    public String getJoinDate()                    { return joinDate; }
    public void   setJoinDate(String joinDate)     { this.joinDate = joinDate; }

    public String getBio()                 { return bio; }
    public void   setBio(String bio)       { this.bio = bio; }

    public List<String> getWishlist()              { return wishlist; }
    public void         setWishlist(List<String> wishlist) {
        this.wishlist = wishlist == null ? new ArrayList<>() : wishlist;
    }

    public boolean isBlocked() { return isBlocked; }
    public void setBlocked(boolean isBlocked) { this.isBlocked = isBlocked; }

    // ── Serialization ─────────────────────────────────────────────────────────

    /**
     * Serialize to a pipe-delimited line for users.txt
     * Format: id|name|email|password|phone|address|role|avatar|joinDate|bio|isBlocked
     */
    public String toFileLine() {
        return String.join("|",
            safe(id), safe(name), safe(email), safe(password),
            safe(phone), safe(address), safe(role), safe(avatar), safe(joinDate), safe(bio),
            String.valueOf(isBlocked)
        );
    }

    /**
     * Deserialize from a pipe-delimited line read from users.txt
     */
    public static User fromFileLine(String line) {
        String[] parts = line.split("\\|", -1);
        if (parts.length < 9) return null;
        String bio = (parts.length > 9) ? parts[9] : "";
        User u = new User(
            parts[0], parts[1], parts[2], parts[3],
            parts[4], parts[5], parts[6], parts[7], parts[8], bio
        );
        if (parts.length >= 11) {
            u.setBlocked(Boolean.parseBoolean(parts[10]));
        }
        return u;
    }

    /**
     * Build a safe JSON representation (omits password for API responses)
     */
    public String toJson() {
        return "{"
            + "\"id\":\""       + esc(id)       + "\","
            + "\"name\":\""     + esc(name)     + "\","
            + "\"email\":\""    + esc(email)    + "\","
            + "\"phone\":\""    + esc(phone)    + "\","
            + "\"address\":\""  + esc(address)  + "\","
            + "\"role\":\""     + esc(role)     + "\","
            + "\"avatar\":\""   + esc(avatar)   + "\","
            + "\"joinDate\":\"" + esc(joinDate) + "\","
            + "\"bio\":\""      + esc(bio)      + "\","
            + "\"isBlocked\":"  + isBlocked     + ","
            + "\"wishlist\":"   + listToJsonArray(wishlist)
            + "}";
    }

    // ── Helpers ───────────────────────────────────────────────────────────────
    
    private String listToJsonArray(java.util.List<String> values) {
        if (values == null || values.isEmpty()) return "[]";
        return "[" + values.stream()
            .map(v -> "\"" + esc(v) + "\"")
            .collect(java.util.stream.Collectors.joining(",")) + "]";
    }

    private String safe(String s) { return s == null ? "" : s; }
    private String esc(String s)  { return s == null ? "" : s.replace("\\", "\\\\").replace("\"", "\\\""); }

    @Override
    public String toString() { return toJson(); }
}
