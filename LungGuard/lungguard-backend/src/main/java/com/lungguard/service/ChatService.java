package com.lungguard.service;

import com.lungguard.dto.ChatRequest;
import com.lungguard.dto.ChatResponse;
import org.springframework.stereotype.Service;

@Service
public class ChatService {

    private final AiClientService aiClientService;

    public ChatService(AiClientService aiClientService) {
        this.aiClientService = aiClientService;
    }

    public ChatResponse askQuestion(ChatRequest request) {

        String reply = aiClientService.askAi(request.getMessage());

        return ChatResponse.builder()
                .reply(reply)
                .build();
    }
}