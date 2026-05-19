package com.bookstore.models;

public class Author {
    private String id;
    private String name;
    private String role;
    private String bio;
    private String imageUrl;
    private String timeline;
    private String quote;
    private String masterpiece;

    public Author() {}

    public Author(String id, String name, String role, String bio, String imageUrl, String timeline, String quote, String masterpiece) {
        this.id = id;
        this.name = name;
        this.role = role;
        this.bio = bio;
        this.imageUrl = imageUrl;
        this.timeline = timeline;
        this.quote = quote;
        this.masterpiece = masterpiece;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }
    public String getBio() { return bio; }
    public void setBio(String bio) { this.bio = bio; }
    public String getImageUrl() { return imageUrl; }
    public void setImageUrl(String imageUrl) { this.imageUrl = imageUrl; }
    public String getTimeline() { return timeline; }
    public void setTimeline(String timeline) { this.timeline = timeline; }
    public String getQuote() { return quote; }
    public void setQuote(String quote) { this.quote = quote; }
    public String getMasterpiece() { return masterpiece; }
    public void setMasterpiece(String masterpiece) { this.masterpiece = masterpiece; }

    @Override
    public String toString() {
        return id + "|" + name + "|" + role + "|" + bio.replace("\n", "\\n") + "|" + imageUrl + "|" + timeline + "|" + quote.replace("\n", "\\n") + "|" + masterpiece;
    }

    public static Author fromString(String line) {
        String[] parts = line.split("\\|", 8);
        if (parts.length < 5) return null;
        
        String id = parts[0];
        String name = parts[1];
        String role = parts[2];
        String bio = parts[3].replace("\\n", "\n");
        String imageUrl = parts[4];
        String timeline = parts.length > 5 ? parts[5] : "";
        String quote = parts.length > 6 ? parts[6].replace("\\n", "\n") : "";
        String masterpiece = parts.length > 7 ? parts[7] : "";

        return new Author(id, name, role, bio, imageUrl, timeline, quote, masterpiece);
    }

    public String toJson() {
        return "{"
            + "\"id\":\"" + esc(id) + "\","
            + "\"name\":\"" + esc(name) + "\","
            + "\"role\":\"" + esc(role) + "\","
            + "\"bio\":\"" + esc(bio) + "\","
            + "\"imageUrl\":\"" + esc(imageUrl) + "\","
            + "\"timeline\":\"" + esc(timeline) + "\","
            + "\"quote\":\"" + esc(quote) + "\","
            + "\"masterpiece\":\"" + esc(masterpiece) + "\""
            + "}";
    }

    private String esc(String s) {
        return s == null ? "" : s.replace("\\", "\\\\").replace("\"", "\\\"").replace("\n", "\\n");
    }
}
