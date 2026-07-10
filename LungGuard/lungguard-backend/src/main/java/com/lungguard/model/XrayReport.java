package com.lungguard.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "xray_reports")

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class XrayReport {

    /*
     * Primary Key
     */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /*
     * Uploaded file name
     * Example:
     * chest_xray.jpg
     */
    private String fileName;

    /*
     * File type
     * Example:
     * image/jpeg
     * image/png
     */
    private String fileType;

    /*
     * File location
     * Example:
     * uploads/chest_xray.jpg
     */
    private String filePath;

    /*
     * AI Prediction
     * Examples:
     * Normal
     * Pneumonia
     * Lung Cancer
     * Pending AI Analysis
     */
    private String prediction;

    /*
     * AI Confidence Score
     * Example:
     * 92.5
     */
    private Double confidence;

    /*
     * Response message
     */
    @Column(length = 1000)
    private String message;

    /*
     * Upload timestamp
     */
    private LocalDateTime uploadedAt;

    /*
     * Patient Name (from User)
     */
    private String patientName;

    /*
     * Exact scan timestamp
     */
    private LocalDateTime scanDate;

    /*
     * Clinical Summary
     */
    @Column(length = 2000)
    private String clinicalSummary;

    /*
     * Recommendation
     */
    @Column(length = 2000)
    private String recommendation;

    /*
     * Medical Disclaimer
     */
    @Column(length = 2000)
    private String disclaimer;

    /*
     * Grad-CAM heatmap overlay (Base64-encoded PNG)
     */
    @Column(columnDefinition = "LONGTEXT")
    private String heatmapBase64;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;
}