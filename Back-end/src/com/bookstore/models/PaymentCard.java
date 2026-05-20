package com.bookstore.models;

/**
 * OOP Model – PaymentCard
 * Represents a securely tokenized saved card for future payments.
 */
public class PaymentCard {

    private String id;
    private String userId;
    private String cardToken;
    private String last4;
    private String brand;
    private String expiry;
    private String cardNickname;
    private boolean isDefault;

    public PaymentCard() {}

    public PaymentCard(String id, String userId, String cardToken, String last4, String brand, String expiry, String cardNickname, boolean isDefault) {
        this.id = id;
        this.userId = userId;
        this.cardToken = cardToken;
        this.last4 = last4;
        this.brand = brand;
        this.expiry = expiry;
        this.cardNickname = cardNickname;
        this.isDefault = isDefault;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getUserId() { return userId; }
    public void setUserId(String userId) { this.userId = userId; }

    public String getCardToken() { return cardToken; }
    public void setCardToken(String cardToken) { this.cardToken = cardToken; }

    public String getLast4() { return last4; }
    public void setLast4(String last4) { this.last4 = last4; }

    public String getBrand() { return brand; }
    public void setBrand(String brand) { this.brand = brand; }

    public String getExpiry() { return expiry; }
    public void setExpiry(String expiry) { this.expiry = expiry; }

    public String getCardNickname() { return cardNickname; }
    public void setCardNickname(String cardNickname) { this.cardNickname = cardNickname; }

    public boolean isDefault() { return isDefault; }
    public void setDefault(boolean isDefault) { this.isDefault = isDefault; }

    /** Format: id|userId|cardToken|last4|brand|expiry|cardNickname|isDefault */
    public String toFileLine() {
        return String.join("|",
            safe(id), safe(userId), safe(cardToken),
            safe(last4), safe(brand), safe(expiry)
            , safe(cardNickname), String.valueOf(isDefault)
        );
    }

    public static PaymentCard fromFileLine(String line) {
        String[] p = line.split("\\|", -1);
        if (p.length < 8) return null;
        return new PaymentCard(p[0], p[1], p[2], p[3], p[4], p[5], p[6], Boolean.parseBoolean(p[7]));
    }

    public String toJson() {
        return "{"
            + "\"id\":\"" + esc(id) + "\","
            + "\"userId\":\"" + esc(userId) + "\","
            + "\"cardToken\":\"" + esc(cardToken) + "\"," 
            + "\"last4\":\"" + esc(last4) + "\"," 
            + "\"brand\":\"" + esc(brand) + "\"," 
            + "\"expiry\":\"" + esc(expiry) + "\"," 
            + "\"cardNickname\":\"" + esc(cardNickname) + "\"," 
            + "\"isDefault\":" + isDefault
            + "}";
    }

    private String safe(String s) { return s == null ? "" : s; }
    private String esc(String s) { return s == null ? "" : s.replace("\\", "\\\\").replace("\"", "\\\""); }
}
