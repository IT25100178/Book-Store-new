package com.bookstore.services;

import com.bookstore.models.Article;
import com.bookstore.storage.FileStorage;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

public class ArticleService {
    private static final String FILE_PATH = "articles.txt";

    public List<Article> getAllArticles() {
        return FileStorage.readLines(FILE_PATH).stream()
                .map(Article::fromString)
                .filter(a -> a != null)
                .collect(Collectors.toList());
    }

    public Article createArticle(Article article) {
        article.setId(UUID.randomUUID().toString());
        if (article.getDate() == null || article.getDate().trim().isEmpty()) {
            article.setDate(new java.text.SimpleDateFormat("MMMM dd, yyyy").format(new java.util.Date()));
        }
        FileStorage.appendLine(FILE_PATH, article.toString());
        return article;
    }

    public Article updateArticle(String id, Article updatedData) {
        List<Article> articles = getAllArticles();
        Article updated = null;
        for (Article a : articles) {
            if (a.getId().equals(id)) {
                a.setTitle(updatedData.getTitle());
                a.setTag(updatedData.getTag());
                if (updatedData.getDate() != null && !updatedData.getDate().trim().isEmpty()) {
                    a.setDate(updatedData.getDate());
                }
                a.setReadTime(updatedData.getReadTime());
                a.setExcerpt(updatedData.getExcerpt());
                a.setImageUrl(updatedData.getImageUrl());
                a.setContent(updatedData.getContent());
                updated = a;
                break;
            }
        }
        if (updated != null) {
            List<String> lines = articles.stream().map(Article::toString).collect(Collectors.toList());
            FileStorage.writeLines(FILE_PATH, lines);
        }
        return updated;
    }

    public boolean deleteArticle(String id) {
        List<Article> articles = getAllArticles();
        boolean removed = articles.removeIf(a -> a.getId().equals(id));
        if (removed) {
            List<String> lines = articles.stream().map(Article::toString).collect(Collectors.toList());
            FileStorage.writeLines(FILE_PATH, lines);
        }
        return removed;
    }
}
