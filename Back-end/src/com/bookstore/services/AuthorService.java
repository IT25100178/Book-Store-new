package com.bookstore.services;

import com.bookstore.models.Author;
import com.bookstore.storage.FileStorage;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

public class AuthorService {
    private static final String FILE_PATH = "authors.txt";

    public List<Author> getAllAuthors() {
        return FileStorage.readLines(FILE_PATH).stream()
                .map(Author::fromString)
                .filter(a -> a != null)
                .collect(Collectors.toList());
    }

    public Author createAuthor(Author author) {
        author.setId(UUID.randomUUID().toString());
        FileStorage.appendLine(FILE_PATH, author.toString());
        return author;
    }

    public Author updateAuthor(String id, Author updatedData) {
        List<Author> authors = getAllAuthors();
        Author updated = null;
        for (Author a : authors) {
            if (a.getId().equals(id)) {
                a.setName(updatedData.getName());
                a.setRole(updatedData.getRole());
                a.setBio(updatedData.getBio());
                a.setImageUrl(updatedData.getImageUrl());
                a.setTimeline(updatedData.getTimeline());
                a.setQuote(updatedData.getQuote());
                a.setMasterpiece(updatedData.getMasterpiece());
                updated = a;
                break;
            }
        }
        if (updated != null) {
            List<String> lines = authors.stream().map(Author::toString).collect(Collectors.toList());
            FileStorage.writeLines(FILE_PATH, lines);
        }
        return updated;
    }

    public boolean deleteAuthor(String id) {
        List<Author> authors = getAllAuthors();
        boolean removed = authors.removeIf(a -> a.getId().equals(id));
        if (removed) {
            List<String> lines = authors.stream().map(Author::toString).collect(Collectors.toList());
            FileStorage.writeLines(FILE_PATH, lines);
        }
        return removed;
    }
}
