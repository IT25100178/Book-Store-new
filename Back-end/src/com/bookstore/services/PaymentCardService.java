package com.bookstore.services;

import com.bookstore.models.PaymentCard;
import com.bookstore.storage.FileStorage;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

public class PaymentCardService {

    private static final String CARDS_FILE = "cards.txt";

    public PaymentCardService() {
        FileStorage.ensureFile(CARDS_FILE);
    }

    private List<PaymentCard> readAllCards() {
        List<PaymentCard> cards = new ArrayList<>();
        for (String line : FileStorage.readLines(CARDS_FILE)) {
            PaymentCard c = PaymentCard.fromFileLine(line);
            if (c != null) cards.add(c);
        }
        return cards;
    }

    private void writeAllCards(List<PaymentCard> cards) {
        List<String> lines = cards.stream()
            .map(PaymentCard::toFileLine)
            .collect(Collectors.toList());
        FileStorage.writeLines(CARDS_FILE, lines);
    }

    public List<PaymentCard> getCardsByUser(String userId) {
        return readAllCards().stream()
            .filter(c -> c.getUserId().equals(userId))
            .collect(Collectors.toList());
    }

    public PaymentCard getCardById(String cardId) {
        for (PaymentCard c : readAllCards()) {
            if (c.getId().equals(cardId)) return c;
        }
        return null;
    }

    private void clearDefaultCardForUser(String userId) {
        List<PaymentCard> all = readAllCards();
        boolean changed = false;
        for (PaymentCard c : all) {
            if (c.getUserId().equals(userId) && c.isDefault()) {
                c.setDefault(false);
                changed = true;
            }
        }
        if (changed) writeAllCards(all);
    }

    public Map<String, Object> saveCard(String userId, String cardNumber, String expiryDate, String cardHolderName, String cardNickname, boolean isDefault, String cvv) {
        Map<String, Object> result = new LinkedHashMap<>();
        
        if (userId == null || userId.isBlank()) {
            result.put("success", false);
            result.put("message", "User ID is required");
            return result;
        }

        if (cardHolderName == null || cardHolderName.isBlank()) {
            result.put("success", false);
            result.put("message", "Card holder name is required");
            return result;
        }

        if (cardNumber == null || cardNumber.isBlank()) {
            result.put("success", false);
            result.put("message", "Card number is required");
            return result;
        }

        if (expiryDate == null || expiryDate.isBlank()) {
            result.put("success", false);
            result.put("message", "Expiry date is required");
            return result;
        }

        String cleanNum = cardNumber.replaceAll("\\D+", "");
        if (cleanNum.length() != 16 || !isValidCardNumber(cleanNum)) {
            result.put("success", false);
            result.put("message", "Invalid card number. Must be exactly 16 digits and pass Luhn validation.");
            return result;
        }

        if (cvv == null || !cvv.matches("^\\d{3}$")) {
            result.put("success", false);
            result.put("message", "CVV must be exactly 3 digits.");
            return result;
        }

        String cleanExpiry = expiryDate.trim();
        if (!cleanExpiry.matches("(0[1-9]|1[0-2])/\\d{2}")) {
            result.put("success", false);
            result.put("message", "Invalid expiry date format. Use MM/YY.");
            return result;
        }

        try {
            int expMonth = Integer.parseInt(cleanExpiry.substring(0, 2));
            int expYear = Integer.parseInt(cleanExpiry.substring(3, 5)) + 2000;
            java.time.LocalDate now = java.time.LocalDate.now();
            int currentYear = now.getYear();
            int currentMonth = now.getMonthValue();

            if (expYear < currentYear || (expYear == currentYear && expMonth < currentMonth)) {
                result.put("success", false);
                result.put("message", "Card has expired.");
                return result;
            }
        } catch (Exception e) {
            result.put("success", false);
            result.put("message", "Invalid expiry date.");
            return result;
        }

        String last4 = cleanNum.substring(cleanNum.length() - 4);
        String brand = cleanNum.startsWith("4") ? "Visa" : 
                       cleanNum.startsWith("5") ? "Mastercard" : 
                       cleanNum.startsWith("3") ? "Amex" : "Other";
        
        String id = "CARD" + System.currentTimeMillis();
        String token = "tok_" + UUIDUtil.random(); // mock token

        PaymentCard card = new PaymentCard(id, userId, token, last4, brand, cardHolderName, cleanExpiry, cardNickname, isDefault);

        if (isDefault) {
            clearDefaultCardForUser(userId);
        }
        FileStorage.appendLine(CARDS_FILE, card.toFileLine());

        result.put("success", true);
        result.put("message", "Card saved successfully");
        result.put("card", card.toJson());
        return result;
    }

    private boolean isValidCardNumber(String number) {
        if (number == null || !number.matches("^\\d{16}$")) {
            return false;
        }
        int sum = 0;
        boolean alternate = false;
        for (int i = number.length() - 1; i >= 0; i--) {
            int n = Integer.parseInt(number.substring(i, i + 1));
            if (alternate) {
                n *= 2;
                if (n > 9) {
                    n -= 9;
                }
            }
            sum += n;
            alternate = !alternate;
        }
        return (sum % 10 == 0);
    }

    public Map<String, Object> updateCard(String cardId, String userId, String cardNumber, String cardHolderName, String newExpiry, String cardNickname, boolean isDefault, String cvv) {
        Map<String, Object> result = new LinkedHashMap<>();
        List<PaymentCard> all = readAllCards();
        boolean found = false;

        if (newExpiry != null && !newExpiry.isBlank() && !newExpiry.matches("(0[1-9]|1[0-2])/\\d{2}")) {
            result.put("success", false);
            result.put("message", "Invalid expiry date format. Use MM/YY.");
            return result;
        }

        for (PaymentCard c : all) {
            if (c.getId().equals(cardId) && c.getUserId().equals(userId)) {
                if (cardNumber != null && !cardNumber.isBlank()) {
                    String cleanNum = cardNumber.replaceAll("\\D+", "");
                    if (cleanNum.length() != 16 || !isValidCardNumber(cleanNum)) {
                        result.put("success", false);
                        result.put("message", "Invalid card number. Must be exactly 16 digits and pass Luhn validation.");
                        return result;
                    }
                    if (cvv == null || !cvv.matches("^\\d{3}$")) {
                        result.put("success", false);
                        result.put("message", "CVV must be exactly 3 digits when changing card number.");
                        return result;
                    }
                    String last4 = cleanNum.substring(cleanNum.length() - 4);
                    String brand = cleanNum.startsWith("4") ? "Visa" : 
                                   cleanNum.startsWith("5") ? "Mastercard" : 
                                   cleanNum.startsWith("3") ? "Amex" : "Other";
                    c.setCardToken("tok_" + UUIDUtil.random());
                    c.setLast4(last4);
                    c.setBrand(brand);
                }

                if (cardHolderName != null && !cardHolderName.isBlank()) {
                    c.setCardHolderName(cardHolderName);
                }
                if (newExpiry != null && !newExpiry.isBlank()) {
                    c.setExpiry(newExpiry);
                }
                if (cardNickname != null) {
                    c.setCardNickname(cardNickname);
                }
                c.setDefault(isDefault);
                found = true;
                break;
            }
        }

        if (isDefault) {
            for (PaymentCard c : all) {
                if (!c.getId().equals(cardId) && c.getUserId().equals(userId)) {
                    c.setDefault(false);
                }
            }
        }

        if (!found) {
            result.put("success", false);
            result.put("message", "Card not found or unauthorized");
            return result;
        }

        writeAllCards(all);
        result.put("success", true);
        result.put("message", "Card updated successfully");
        return result;
    }

    public Map<String, Object> deleteCard(String cardId, String userId) {
        Map<String, Object> result = new LinkedHashMap<>();
        List<PaymentCard> all = readAllCards();
        int before = all.size();

        all.removeIf(c -> c.getId().equals(cardId) && c.getUserId().equals(userId));

        if (all.size() == before) {
            result.put("success", false);
            result.put("message", "Card not found or unauthorized");
            return result;
        }

        writeAllCards(all);
        result.put("success", true);
        result.put("message", "Card deleted successfully");
        return result;
    }
}

class UUIDUtil {
    public static String random() {
        return java.util.UUID.randomUUID().toString().replace("-", "").substring(0, 16);
    }
}
