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
    private String adminReply;
    private String adminRepliedAt;
    private boolean isReported = false;
    private String reportReason;
    private String reportedBy;
    private boolean isFlagged = false;
    private String moderationReason = "";

    // ── Constructors ─────────────────────────────────────────────────────────

    public Review() {}

    public Review(String id, String userId, String bookId, int rating,
                  String comment, String date, String userName) {
        this(id, userId, bookId, rating, comment, date, userName, false);
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

    public Review(String id, String userId, String bookId, int rating,
                  String comment, String date, String userName, boolean approved,
                  String adminReply, String adminRepliedAt, boolean isReported,
                  String reportReason, String reportedBy) {
        this.id = id;
        this.userId = userId;
        this.bookId = bookId;
        this.rating = rating;
        this.comment = comment;
        this.date = date;
        this.userName = userName;
        this.approved = approved;
        this.adminReply = adminReply;
        this.adminRepliedAt = adminRepliedAt;
        this.isReported = isReported;
        this.reportReason = reportReason;
        this.reportedBy = reportedBy;
    }

    // ── Getters & Setters ────────────────────────────────────────────────────

    public String getId()                   { return id; }
    public void   setId(String id)          { this.id = id; }

    public String getUserId()                   { return userId; }
    public void   setUserId(String userId)      { this.userId = userId; }

    public String getBookId()                   { return bookId; }
    public void   setBookId(String bookId)      { this.bookId = bookId; }

    public boolean isReported()                     { return isReported; }
    public void    setReported(boolean reported)    { isReported = reported; }

    public String getReportReason()                 { return reportReason; }
    public void   setReportReason(String reportReason) { this.reportReason = reportReason; }

    public String getReportedBy()                   { return reportedBy; }
    public void   setReportedBy(String reportedBy)   { this.reportedBy = reportedBy; }

    public boolean isFlagged()                      { return isFlagged; }
    public void    setFlagged(boolean flagged)      { isFlagged = flagged; }

    public String getModerationReason()             { return moderationReason; }
    public void   setModerationReason(String moderationReason) { this.moderationReason = moderationReason; }

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

    public String getAdminReply()                   { return adminReply; }
    public void setAdminReply(String adminReply) {
        this.adminReply = adminReply;
    }

    public String getAdminRepliedAt()                { return adminRepliedAt; }
    public void setAdminRepliedAt(String adminRepliedAt) {
        this.adminRepliedAt = adminRepliedAt;
    }

    // ── Serialization ─────────────────────────────────────────────────────────

    /** Format: id|userId|bookId|rating|comment|date|userName|approved|adminReply|adminRepliedAt|isReported|reportReason|reportedBy|isFlagged|moderationReason */
    public String toFileLine() {
        return String.join("|",
            safe(id), safe(userId), safe(bookId),
            String.valueOf(rating), safe(comment), safe(date), safe(userName),
            String.valueOf(approved), safe(adminReply), safe(adminRepliedAt),
            String.valueOf(isReported), safe(reportReason), safe(reportedBy),
            String.valueOf(isFlagged), safe(moderationReason)
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
            String adminReplyVal = "";
            String adminRepliedAtVal = "";
            boolean reportedVal = false;
            String reportReasonVal = "";
            String reportedByVal = "";
            if (p.length >= 9) {
                adminReplyVal = p[8];
            }
            if (p.length >= 10) {
                adminRepliedAtVal = p[9];
            }
            if (p.length >= 11) {
                reportedVal = Boolean.parseBoolean(p[10]);
            }
            if (p.length >= 12) {
                reportReasonVal = p[11];
            }
            if (p.length >= 13) {
                reportedByVal = p[12];
            }
            boolean flaggedVal = false;
            String moderationReasonVal = "";
            if (p.length >= 14) {
                flaggedVal = Boolean.parseBoolean(p[13]);
            }
            if (p.length >= 15) {
                moderationReasonVal = p[14];
            }
            Review r = new Review(p[0], p[1], p[2], Integer.parseInt(p[3]), p[4], p[5], p[6], approvedVal,
                adminReplyVal, adminRepliedAtVal, reportedVal, reportReasonVal, reportedByVal);
            r.setFlagged(flaggedVal);
            r.setModerationReason(moderationReasonVal);
            return r;
        } catch (NumberFormatException e) {
            return null;
        }
    }

    public String toJson() {
        return "{"
            + "\"id\":\""        + esc(id)          + "\","
            + "\"userId\":\""    + esc(userId)      + "\","
            + "\"bookId\":\""    + esc(bookId)      + "\","
            + "\"rating\":"      + rating            + ","
            + "\"comment\":\""   + esc(comment)      + "\","
            + "\"date\":\""      + esc(date)         + "\","
            + "\"userName\":\""  + esc(userName)     + "\","
            + "\"approved\":"    + approved          + ","
            + "\"adminReply\":\"" + esc(adminReply)   + "\","
            + "\"adminRepliedAt\":\"" + esc(adminRepliedAt) + "\","
            + "\"isReported\":"  + isReported        + ","
            + "\"reportReason\":\"" + esc(reportReason) + "\","
            + "\"reportedBy\":\"" + esc(reportedBy)   + "\","
            + "\"isFlagged\":"   + isFlagged         + ","
            + "\"moderationReason\":\"" + esc(moderationReason) + "\""
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
