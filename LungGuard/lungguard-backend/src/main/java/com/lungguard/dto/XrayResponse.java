package com.lungguard.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class XrayResponse{
    private String fileName;

    private String prediction;

    private Double confidence;

    private String message;

    private String clinicalSummary;

    private String recommendation;

    private String heatmapBase64;

}