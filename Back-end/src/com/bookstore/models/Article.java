package com.bookstore.models;

public class Article {
    private String id;
    private String title;
    private String tag;
    private String date;
    private String readTime;
    private String excerpt;
    private String imageUrl;
    private String content;

    public Article() {}

    public Article(String id, String title, String tag, String date, String readTime, String excerpt, String imageUrl, String content) {
        this.id = id;
        this.title = title;
        this.tag = tag;
        this.date = date;
        this.readTime = readTime;
        this.excerpt = excerpt;
        this.imageUrl = imageUrl;
        this.content = content;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getTag() { return tag; }
    public void setTag(String tag) { this.tag = tag; }
    public String getDate() { return date; }
    public void setDate(String date) { this.date = date; }
    public String getReadTime() { return readTime; }
    public void setReadTime(String readTime) { this.readTime = readTime; }
    public String getExcerpt() { return excerpt; }
    public void setExcerpt(String excerpt) { this.excerpt = excerpt; }
    public String getImageUrl() { return imageUrl; }
    public void setImageUrl(String imageUrl) { this.imageUrl = imageUrl; }
    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }

    @Override
    public String toString() {
        return id + "|" 
            + title.replace("\n", "\\n") + "|" 
            + tag + "|" 
            + date + "|" 
            + readTime + "|" 
            + excerpt.replace("\n", "\\n") + "|" 
            + imageUrl + "|" 
            + content.replace("\n", "\\n");
    }

    public static Article fromString(String line) {
        String[] parts = line.split("\\|", 8);
        if (parts.length < 8) return null;
        return new Article(
            parts[0], 
            parts[1].replace("\\n", "\n"), 
            parts[2], 
            parts[3], 
            parts[4], 
            parts[5].replace("\\n", "\n"), 
            parts[6], 
            parts[7].replace("\\n", "\n")
        );
    }

    public String toJson() {
        return "{"
            + "\"id\":\"" + esc(id) + "\","
            + "\"title\":\"" + esc(title) + "\","
            + "\"tag\":\"" + esc(tag) + "\","
            + "\"date\":\"" + esc(date) + "\","
            + "\"readTime\":\"" + esc(readTime) + "\","
            + "\"excerpt\":\"" + esc(excerpt) + "\","
            + "\"imageUrl\":\"" + esc(imageUrl) + "\","
            + "\"content\":\"" + esc(content) + "\""
            + "}";
    }

    private String esc(String s) {
        return s == null ? "" : s.replace("\\", "\\\\").replace("\"", "\\\"").replace("\n", "\\n");
    }
}
