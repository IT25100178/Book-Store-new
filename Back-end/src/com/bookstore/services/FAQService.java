package com.bookstore.services;

import com.bookstore.models.FAQ;
import com.bookstore.storage.FileStorage;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

public class FAQService {
    private static final String FILE_PATH = "faqs.txt";

    public List<FAQ> getAllFAQs() {
        return FileStorage.readLines(FILE_PATH).stream()
                .map(FAQ::fromString)
                .filter(f -> f != null)
                .collect(Collectors.toList());
    }

    public FAQ createFAQ(FAQ faq) {
        faq.setId(UUID.randomUUID().toString());
        FileStorage.appendLine(FILE_PATH, faq.toString());
        return faq;
    }

    public FAQ updateFAQ(String id, FAQ updatedData) {
        List<FAQ> faqs = getAllFAQs();
        FAQ updated = null;
        for (FAQ f : faqs) {
            if (f.getId().equals(id)) {
                f.setQuestion(updatedData.getQuestion());
                f.setAnswer(updatedData.getAnswer());
                f.setCategory(updatedData.getCategory());
                updated = f;
                break;
            }
        }
        if (updated != null) {
            List<String> lines = faqs.stream().map(FAQ::toString).collect(Collectors.toList());
            FileStorage.writeLines(FILE_PATH, lines);
        }
        return updated;
    }

    public boolean deleteFAQ(String id) {
        List<FAQ> faqs = getAllFAQs();
        boolean removed = faqs.removeIf(f -> f.getId().equals(id));
        if (removed) {
            List<String> lines = faqs.stream().map(FAQ::toString).collect(Collectors.toList());
            FileStorage.writeLines(FILE_PATH, lines);
        }
        return removed;
    }
}
