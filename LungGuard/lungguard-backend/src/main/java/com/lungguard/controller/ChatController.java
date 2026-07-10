package com.lungguard.controller;

import com.lungguard.dto.ChatRequest;
import com.lungguard.dto.ChatResponse;
import com.lungguard.service.ChatService;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/chat")
public class ChatController {

    private final ChatService chatService;

    public ChatController(ChatService chatService) {
        this.chatService = chatService;
    }

    @PostMapping("/ask")
    public ChatResponse askQuestion(
            @RequestBody ChatRequest request) {

        return chatService.askQuestion(request);
    }
}