package com.lungguard.service;

import com.lungguard.dto.AiChatRequest;
import com.lungguard.dto.AiChatResponse;
import com.lungguard.dto.RiskRequest;
import com.lungguard.dto.RiskResponse;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import com.lungguard.dto.XrayResponse;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.http.*;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.multipart.MultipartFile;

@Service
public class AiClientService {

    private final RestTemplate restTemplate;

    public AiClientService(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
    }

    public XrayResponse analyzeXray(MultipartFile file) {

        String url = "http://localhost:8000/analyze-xray";

        try {
            ByteArrayResource fileResource = new ByteArrayResource(file.getBytes()) {
                @Override
                public String getFilename() {
                    return file.getOriginalFilename();
                }
            };

            MultiValueMap<String, Object> body = new LinkedMultiValueMap<>();
            body.add("file", fileResource);

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.MULTIPART_FORM_DATA);

            HttpEntity<MultiValueMap<String, Object>> requestEntity =
                    new HttpEntity<>(body, headers);

            XrayResponse response =
                    restTemplate.postForObject(
                            url,
                            requestEntity,
                            XrayResponse.class
                    );

            if (response == null) {
                return XrayResponse.builder()
                        .fileName(file.getOriginalFilename())
                        .prediction("ERROR")
                        .confidence(0.0)
                        .message("AI X-ray service is not responding.")
                        .clinicalSummary("N/A")
                        .recommendation("N/A")
                        .heatmapBase64(null)
                        .build();
            }

            return response;

        } catch (Exception e) {
            return XrayResponse.builder()
                    .fileName(file.getOriginalFilename())
                    .prediction("ERROR")
                    .confidence(0.0)
                    .message("Failed to send X-ray to AI service.")
                    .clinicalSummary("N/A")
                    .recommendation("N/A")
                    .heatmapBase64(null)
                    .build();
        }
    }

    public String askAi(String message) {

        String url = "http://localhost:8000/chat";

        AiChatRequest request = new AiChatRequest(message);

        AiChatResponse response =
                restTemplate.postForObject(
                        url,
                        request,
                        AiChatResponse.class
                );

        if (response == null) {
            return "AI service is not responding.";
        }

        return response.getReply();
    }

    public RiskResponse predictRisk(RiskRequest request) {

        String url = "http://localhost:8000/predict-risk";

        RiskResponse response =
                restTemplate.postForObject(
                        url,
                        request,
                        RiskResponse.class
                );

        if (response == null) {
            return RiskResponse.builder()
                    .lungRiskScore(0)
                    .liverRiskScore(0)
                    .riskCategory("ERROR")
                    .recommendation("AI risk service is not responding.")
                    .build();
        }

        return response;
    }
}