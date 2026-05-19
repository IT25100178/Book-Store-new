package com.bookstore.handlers;

import com.bookstore.models.FAQ;
import com.bookstore.services.FAQService;
import com.bookstore.server.BaseHandler;
import com.bookstore.storage.FileStorage;
import com.sun.net.httpserver.HttpExchange;

import java.io.IOException;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

public class FAQHandler extends BaseHandler {
    private final FAQService faqService = new FAQService();

    @Override
    public void handle(HttpExchange exchange) throws IOException {
        if (handlePreflight(exchange)) return;

        String method = exchange.getRequestMethod().toUpperCase();
        String path = exchange.getRequestURI().getPath();

        try {
            if ("GET".equals(method)) {
                List<FAQ> faqs = faqService.getAllFAQs();
                List<String> jsons = faqs.stream().map(FAQ::toJson).collect(Collectors.toList());
                sendSuccess(exchange, toJsonArray(jsons));
            } else if ("POST".equals(method)) {
                Map<String, String> data = FileStorage.parseJsonBody(readBody(exchange));
                if (!data.containsKey("question") || !data.containsKey("answer")) {
                    sendBadRequest(exchange, "Question and Answer are required");
                    return;
                }
                FAQ faq = new FAQ(null, data.get("question"), data.get("answer"), data.getOrDefault("category", "CURATION"));
                FAQ created = faqService.createFAQ(faq);
                sendCreated(exchange, created.toJson());
            } else if ("PUT".equals(method) && path.matches("/api/faqs/.+")) {
                String id = path.substring(path.lastIndexOf('/') + 1);
                Map<String, String> data = FileStorage.parseJsonBody(readBody(exchange));
                FAQ faq = new FAQ(null, data.get("question"), data.get("answer"), data.getOrDefault("category", "CURATION"));
                FAQ updated = faqService.updateFAQ(id, faq);
                if (updated != null) sendSuccess(exchange, updated.toJson());
                else sendNotFound(exchange, "FAQ");
            } else if ("DELETE".equals(method) && path.matches("/api/faqs/.+")) {
                String id = path.substring(path.lastIndexOf('/') + 1);
                if (faqService.deleteFAQ(id)) sendSuccess(exchange, "{\"message\":\"Deleted successfully\"}");
                else sendNotFound(exchange, "FAQ");
            } else {
                sendMethodNotAllowed(exchange);
            }
        } catch (Exception e) {
            e.printStackTrace();
            sendError(exchange, 500, "Internal server error");
        }
    }
}
