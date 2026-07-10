package com.lungguard.service;

import com.lowagie.text.Document;
import com.lowagie.text.DocumentException;
import com.lowagie.text.Font;
import com.lowagie.text.FontFactory;
import com.lowagie.text.Paragraph;
import com.lowagie.text.pdf.PdfWriter;
import com.lungguard.model.XrayReport;
import org.springframework.stereotype.Service;

import java.awt.Color;
import java.io.ByteArrayOutputStream;
import java.time.format.DateTimeFormatter;

@Service
public class XrayReportPdfService {

    public byte[] generatePdf(XrayReport report) {
        try (ByteArrayOutputStream outputStream = new ByteArrayOutputStream()) {
            Document document = new Document();
            PdfWriter.getInstance(document, outputStream);
            document.open();

            Font titleFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 18, Color.BLACK);
            Font headerFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 12, Color.DARK_GRAY);
            Font contentFont = FontFactory.getFont(FontFactory.HELVETICA, 12, Color.BLACK);
            Font disclaimerFont = FontFactory.getFont(FontFactory.HELVETICA_OBLIQUE, 10, Color.GRAY);

            document.add(new Paragraph("LungGuard AI X-Ray Analysis Report", titleFont));
            document.add(new Paragraph(" "));

            DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");

            document.add(new Paragraph("Patient Information", headerFont));
            document.add(new Paragraph("Name: " + report.getPatientName(), contentFont));
            document.add(new Paragraph("Scan Date: " + (report.getScanDate() != null ? report.getScanDate().format(formatter) : "N/A"), contentFont));
            document.add(new Paragraph(" "));

            document.add(new Paragraph("File Details", headerFont));
            document.add(new Paragraph("File Name: " + report.getFileName(), contentFont));
            document.add(new Paragraph("File Type: " + report.getFileType(), contentFont));
            document.add(new Paragraph(" "));

            document.add(new Paragraph("AI Classification", headerFont));
            document.add(new Paragraph("Prediction: " + report.getPrediction(), contentFont));
            document.add(new Paragraph("Confidence: " + report.getConfidence() + "%", contentFont));
            document.add(new Paragraph(" "));

            document.add(new Paragraph("Clinical Summary", headerFont));
            document.add(new Paragraph(report.getClinicalSummary(), contentFont));
            document.add(new Paragraph(" "));

            document.add(new Paragraph("Recommendation", headerFont));
            document.add(new Paragraph(report.getRecommendation(), contentFont));
            document.add(new Paragraph(" "));

            document.add(new Paragraph("Medical Disclaimer", headerFont));
            document.add(new Paragraph(report.getDisclaimer(), disclaimerFont));

            document.close();
            return outputStream.toByteArray();
        } catch (Exception e) {
            throw new RuntimeException("Failed to generate PDF", e);
        }
    }
}
