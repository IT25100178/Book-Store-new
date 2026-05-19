package com.bookstore.models;

public class Message {
    private String id;
    private String name;
    private String email;
    private String subject;
    private String body;
    private String status;
    private String createdAt;

    public Message() {}

    public Message(String id, String name, String email, String subject, String body, String status, String createdAt) {
        this.id = id;
        this.name = name;
        this.email = email;
        this.subject = subject;
        this.body = body;
        this.status = status;
        this.createdAt = createdAt;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getSubject() { return subject; }
    public void setSubject(String subject) { this.subject = subject; }
    public String getBody() { return body; }
    public void setBody(String body) { this.body = body; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public String getCreatedAt() { return createdAt; }
    public void setCreatedAt(String createdAt) { this.createdAt = createdAt; }

    @Override
    public String toString() {
        return id + "|" + name + "|" + email + "|" + subject + "|" + body.replace("\n", "\\n") + "|" + status + "|" + createdAt;
    }

    public static Message fromString(String line) {
        String[] parts = line.split("\\|", 7);
        if (parts.length < 7) return null;
        return new Message(parts[0], parts[1], parts[2], parts[3], parts[4].replace("\\n", "\n"), parts[5], parts[6]);
    }

    public String toJson() {
        return "{"
            + "\"id\":\"" + esc(id) + "\","
            + "\"name\":\"" + esc(name) + "\","
            + "\"email\":\"" + esc(email) + "\","
            + "\"subject\":\"" + esc(subject) + "\","
            + "\"body\":\"" + esc(body) + "\","
            + "\"status\":\"" + esc(status) + "\","
            + "\"createdAt\":\"" + esc(createdAt) + "\""
            + "}";
    }

    private String esc(String s) {
        return s == null ? "" : s.replace("\\", "\\\\").replace("\"", "\\\"").replace("\n", "\\n");
    }
}
