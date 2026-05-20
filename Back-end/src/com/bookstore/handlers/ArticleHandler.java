package com.bookstore.handlers;

import com.bookstore.models.Article;
import com.bookstore.services.ArticleService;
import com.bookstore.server.BaseHandler;
import com.bookstore.storage.FileStorage;
import com.sun.net.httpserver.HttpExchange;

import java.io.IOException;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

public class ArticleHandler extends BaseHandler {
    private final ArticleService articleService = new ArticleService();

    @Override
    public void handle(HttpExchange exchange) throws IOException {
        if (handlePreflight(exchange)) return;

        String method = exchange.getRequestMethod().toUpperCase();
        String path = exchange.getRequestURI().getPath();

        try {
            if ("GET".equals(method)) {
                if (path.matches("/api/articles/.+")) {
                    String id = path.substring(path.lastIndexOf('/') + 1);
                    Article article = articleService.getArticleById(id);
                    if (article != null) {
                        sendSuccess(exchange, article.toJson());
                    } else {
                        sendNotFound(exchange, "Article");
                    }
                } else {
                    List<Article> articles = articleService.getAllArticles();
                    List<String> jsons = articles.stream().map(Article::toJson).collect(Collectors.toList());
                    sendSuccess(exchange, toJsonArray(jsons));
                }
            } else if ("POST".equals(method)) {
                Map<String, String> data = FileStorage.parseJsonBody(readBody(exchange));
                if (!data.containsKey("title") || !data.containsKey("content")) {
                    sendBadRequest(exchange, "Title and Content are required");
                    return;
                }
                Article article = new Article(
                    null,
                    data.get("title"),
                    data.getOrDefault("tag", "CURATION"),
                    data.get("date"),
                    data.getOrDefault("readTime", "5 min read"),
                    data.getOrDefault("excerpt", ""),
                    data.getOrDefault("imageUrl", ""),
                    data.get("content")
                );
                Article created = articleService.createArticle(article);
                sendCreated(exchange, created.toJson());
            } else if ("PUT".equals(method) && path.matches("/api/articles/.+")) {
                String id = path.substring(path.lastIndexOf('/') + 1);
                Map<String, String> data = FileStorage.parseJsonBody(readBody(exchange));
                Article article = new Article(
                    null,
                    data.get("title"),
                    data.getOrDefault("tag", "CURATION"),
                    data.get("date"),
                    data.getOrDefault("readTime", "5 min read"),
                    data.getOrDefault("excerpt", ""),
                    data.getOrDefault("imageUrl", ""),
                    data.get("content")
                );
                Article updated = articleService.updateArticle(id, article);
                if (updated != null) sendSuccess(exchange, updated.toJson());
                else sendNotFound(exchange, "Article");
            } else if ("DELETE".equals(method) && path.matches("/api/articles/.+")) {
                String id = path.substring(path.lastIndexOf('/') + 1);
                if (articleService.deleteArticle(id)) sendSuccess(exchange, "{\"message\":\"Deleted successfully\"}");
                else sendNotFound(exchange, "Article");
            } else {
                sendMethodNotAllowed(exchange);
            }
        } catch (Exception e) {
            e.printStackTrace();
            sendError(exchange, 500, "Internal server error");
        }
    }
}
