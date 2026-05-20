package com.bookstore.models;

/**
 * OOP Model – Review
 * Represents a user's review of a book.
 * Data is serialized to / deserialized from reviews.txt
 */
public class Review {

    private String id;
    private String userId;
    private String bookId;
    private int    rating;
    private String comment;
    private String date;
    private String userName; // denormalized for display
    private boolean approved = true; // default to true

    // ── Constructors ─────────────────────────────────────────────────────────

    public Review() {}

    public Review(String id, String userId, String bookId, int rating,
                  String comment, String date, String userName) {
        this.id       = id;
        this.userId   = userId;
        this.bookId   = bookId;
        this.rating   = rating;
        this.comment  = comment;
        this.date     = date;
        this.userName = userName;
        this.approved = true;
    }

    public Review(String id, String userId, String bookId, int rating,
                  String comment, String date, String userName, boolean approved) {
        this.id       = id;
        this.userId   = userId;
        this.bookId   = bookId;
        this.rating   = rating;
        this.comment  = comment;
        this.date     = date;
        this.userName = userName;
        this.approved = approved;
    }

    // ── Getters & Setters ────────────────────────────────────────────────────

    public String getId()                   { return id; }
    public void   setId(String id)          { this.id = id; }

    public String getUserId()                   { return userId; }
    public void   setUserId(String userId)      { this.userId = userId; }

    public String getBookId()                   { return bookId; }
    public void   setBookId(String bookId)      { this.bookId = bookId; }

    public int    getRating()                   { return rating; }
    public void   setRating(int rating)         { this.rating = rating; }

    public String getComment()                      { return comment; }
    public void   setComment(String comment)        { this.comment = comment; }

    public String getDate()                 { return date; }
    public void   setDate(String date)      { this.date = date; }

    public String getUserName()                     { return userName; }
    public void   setUserName(String userName)      { this.userName = userName; }

    public boolean isApproved()                     { return approved; }
    public void    setApproved(boolean approved)    { this.approved = approved; }

    // ── Serialization ─────────────────────────────────────────────────────────

    /** Format: id|userId|bookId|rating|comment|date|userName|approved */
    public String toFileLine() {
        return String.join("|",
            safe(id), safe(userId), safe(bookId),
            String.valueOf(rating), safe(comment), safe(date), safe(userName),
            String.valueOf(approved)
        );
    }

    public static Review fromFileLine(String line) {
        String[] p = line.split("\\|", -1);
        if (p.length < 7) return null;
        try {
            boolean approvedVal = true;
            if (p.length >= 8) {
                approvedVal = Boolean.parseBoolean(p[7]);
            }
            return new Review(p[0], p[1], p[2], Integer.parseInt(p[3]), p[4], p[5], p[6], approvedVal);
        } catch (NumberFormatException e) {
            return null;
        }
    }

    public String toJson() {
        return "{"
            + "\"id\":\""        + esc(id)       + "\","
            + "\"userId\":\""    + esc(userId)   + "\","
            + "\"bookId\":\""    + esc(bookId)   + "\","
            + "\"rating\":"      + rating        + ","
            + "\"comment\":\""   + esc(comment)  + "\","
            + "\"date\":\""      + esc(date)     + "\","
            + "\"userName\":\""  + esc(userName) + "\","
            + "\"approved\":"    + approved      + ""
            + "}";
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    private String safe(String s) { return s == null ? "" : s; }
    private String esc(String s)  {
        return s == null ? "" : s.replace("\\", "\\\\").replace("\"", "\\\"");
    }

    @Override
    public String toString() { return toJson(); }
}
