package com.bookstore.models;

public class FAQ {
    private String id;
    private String question;
    private String answer;
    private String category;

    public FAQ() {}

    public FAQ(String id, String question, String answer, String category) {
        this.id = id;
        this.question = question;
        this.answer = answer;
        this.category = category;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getQuestion() { return question; }
    public void setQuestion(String question) { this.question = question; }
    public String getAnswer() { return answer; }
    public void setAnswer(String answer) { this.answer = answer; }
    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    @Override
    public String toString() {
        return id + "|" + question.replace("\n", "\\n") + "|" + answer.replace("\n", "\\n") + "|" + category;
    }

    public static FAQ fromString(String line) {
        String[] parts = line.split("\\|", 4);
        if (parts.length < 4) return null;
        return new FAQ(parts[0], parts[1].replace("\\n", "\n"), parts[2].replace("\\n", "\n"), parts[3]);
    }

    public String toJson() {
        return "{"
            + "\"id\":\"" + esc(id) + "\","
            + "\"question\":\"" + esc(question) + "\","
            + "\"answer\":\"" + esc(answer) + "\","
            + "\"category\":\"" + esc(category) + "\""
            + "}";
    }

    private String esc(String s) {
        return s == null ? "" : s.replace("\\", "\\\\").replace("\"", "\\\"").replace("\n", "\\n");
    }
}
