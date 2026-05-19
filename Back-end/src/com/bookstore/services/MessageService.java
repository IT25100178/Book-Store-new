package com.bookstore.services;

import com.bookstore.models.Message;
import com.bookstore.storage.FileStorage;

import java.time.Instant;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

public class MessageService {
    private static final String FILE_PATH = "messages.txt";

    public List<Message> getAllMessages() {
        return FileStorage.readLines(FILE_PATH).stream()
                .map(Message::fromString)
                .filter(m -> m != null)
                .collect(Collectors.toList());
    }

    public Message createMessage(Message message) {
        message.setId(UUID.randomUUID().toString());
        message.setStatus("NEW");
        message.setCreatedAt(Instant.now().toString());
        FileStorage.appendLine(FILE_PATH, message.toString());
        return message;
    }

    public Message updateMessageStatus(String id, String newStatus) {
        List<Message> messages = getAllMessages();
        Message updated = null;
        for (Message m : messages) {
            if (m.getId().equals(id)) {
                m.setStatus(newStatus);
                updated = m;
                break;
            }
        }
        if (updated != null) {
            List<String> lines = messages.stream().map(Message::toString).collect(Collectors.toList());
            FileStorage.writeLines(FILE_PATH, lines);
        }
        return updated;
    }

    public boolean deleteMessage(String id) {
        List<Message> messages = getAllMessages();
        boolean removed = messages.removeIf(m -> m.getId().equals(id));
        if (removed) {
            List<String> lines = messages.stream().map(Message::toString).collect(Collectors.toList());
            FileStorage.writeLines(FILE_PATH, lines);
        }
        return removed;
    }
}
