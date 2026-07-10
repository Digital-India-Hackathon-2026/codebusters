package com.lungguard.service;

import com.lowagie.text.*;
import com.lowagie.text.pdf.PdfWriter;
import com.lungguard.dto.comparison.ScanComparisonResponse;
import com.lungguard.dto.comparison.ScanReportData;
import org.springframework.stereotype.Service;

import java.awt.Color;
import java.io.ByteArrayOutputStream;
import java.time.format.DateTimeFormatter;

@Service
public class ScanComparisonPdfService {

    public byte[] generatePdf(ScanComparisonResponse comparisonData, String patientName) {
        try (ByteArrayOutputStream outputStream = new ByteArrayOutputStream()) {
            Document document = new Document();
            PdfWriter.getInstance(document, outputStream);
            document.open();

            Font titleFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 18, Color.BLACK);
            Font headerFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 14, Color.DARK_GRAY);
            Font subHeaderFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 12, Color.BLACK);
            Font contentFont = FontFactory.getFont(FontFactory.HELVETICA, 12, Color.BLACK);
            Font disclaimerFont = FontFactory.getFont(FontFactory.HELVETICA_OBLIQUE, 10, Color.GRAY);

            document.add(new Paragraph("LungGuard AI Scan Comparison Report", titleFont));
            document.add(new Paragraph(" "));

            DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");

            document.add(new Paragraph("Patient Information", headerFont));
            document.add(new Paragraph("Name: " + (patientName != null ? patientName : "N/A"), contentFont));
            document.add(new Paragraph("Scan Type: " + comparisonData.getScanType(), contentFont));
            document.add(new Paragraph(" "));

            // Older Scan
            ScanReportData older = comparisonData.getOlderScan();
            document.add(new Paragraph("Previous Scan", headerFont));
            document.add(new Paragraph("Date: " + (older.getScanDate() != null ? older.getScanDate().format(formatter) : "N/A"), contentFont));
            document.add(new Paragraph("Prediction: " + older.getPrediction(), subHeaderFont));
            document.add(new Paragraph("Confidence: " + older.getConfidence() + "%", contentFont));
            document.add(new Paragraph(" "));

            // Newer Scan
            ScanReportData newer = comparisonData.getNewerScan();
            document.add(new Paragraph("Current Scan", headerFont));
            document.add(new Paragraph("Date: " + (newer.getScanDate() != null ? newer.getScanDate().format(formatter) : "N/A"), contentFont));
            document.add(new Paragraph("Prediction: " + newer.getPrediction(), subHeaderFont));
            document.add(new Paragraph("Confidence: " + newer.getConfidence() + "%", contentFont));
            document.add(new Paragraph(" "));

            // Comparison Metrics
            document.add(new Paragraph("Comparison Analysis", headerFont));
            if (comparisonData.getComparison().getSamePrediction()) {
                document.add(new Paragraph("AI Prediction remained: " + newer.getPrediction(), contentFont));
            } else {
                document.add(new Paragraph("AI Prediction changed from " + older.getPrediction() + " to " + newer.getPrediction(), contentFont));
            }
            document.add(new Paragraph("Confidence Difference: " + comparisonData.getComparison().getConfidenceDifference() + " percentage points (" + comparisonData.getComparison().getConfidenceDirection() + ")", contentFont));
            document.add(new Paragraph("Time between scans: " + comparisonData.getComparison().getDaysBetweenScans() + " days", contentFont));
            document.add(new Paragraph(" "));

            // AI Summary
            document.add(new Paragraph("AI Comparison Summary", subHeaderFont));
            document.add(new Paragraph(comparisonData.getComparisonSummary(), contentFont));
            document.add(new Paragraph(" "));

            // Recommendations
            document.add(new Paragraph("Latest Recommendation", subHeaderFont));
            document.add(new Paragraph(newer.getRecommendation(), contentFont));
            document.add(new Paragraph(" "));

            // Disclaimer
            document.add(new Paragraph("Medical Disclaimer", headerFont));
            document.add(new Paragraph(comparisonData.getDisclaimer(), disclaimerFont));

            document.close();
            return outputStream.toByteArray();
        } catch (Exception e) {
            throw new RuntimeException("Failed to generate Comparison PDF", e);
        }
    }
}
