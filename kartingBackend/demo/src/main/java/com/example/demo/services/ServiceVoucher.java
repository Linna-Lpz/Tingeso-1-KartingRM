package com.example.demo.services;

import com.example.demo.entities.EntityBooking;
import com.example.demo.repositories.RepoBooking;
import com.itextpdf.text.BaseColor;
import com.itextpdf.text.Document;
import com.itextpdf.text.Phrase;
import com.itextpdf.text.pdf.PdfPCell;
import com.itextpdf.text.pdf.PdfPTable;
import com.itextpdf.text.pdf.PdfWriter;
import org.apache.tomcat.util.http.fileupload.ByteArrayOutputStream;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;

import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;

@Service
public class ServiceVoucher {
    @Autowired
    RepoBooking repoBooking;

    /**
     * Método para exportar el comprobante a Excel
     * @param bookingId ID de la reserva
     * @return ResponseEntity con el archivo Excel
     */
    public ResponseEntity<byte[]> exportVoucherToExcel(Long bookingId) {
        EntityBooking booking = repoBooking.findById(bookingId)
                .orElseThrow(() -> new RuntimeException("Reserva no encontrada con ID: " + bookingId));

        try (Workbook workbook = new XSSFWorkbook()) {
            Sheet sheet = workbook.createSheet("Comprobante");

            CellStyle headerStyle = workbook.createCellStyle();
            Font headerFont = workbook.createFont();
            headerFont.setBold(true);
            headerStyle.setFont(headerFont);
            headerStyle.setFillForegroundColor(IndexedColors.LIGHT_CORNFLOWER_BLUE.getIndex());
            headerStyle.setFillPattern(FillPatternType.SOLID_FOREGROUND);

            Row headerRow = sheet.createRow(0);
            String[] columns = {
                    "ID Reserva", "Fecha de Reserva", "Hora de Reserva",
                    "Vueltas o tiempo reservado", "Personas incluidas",
                    "Cliente que realizó la Reserva", "Nombre del Cliente",
                    "Precio Base", "Descuento", "Precio Total", "IVA (%)", "Total con IVA"
            };

            for (int i = 0; i < columns.length; i++) {
                Cell cell = headerRow.createCell(i);
                cell.setCellValue(columns[i]);
                cell.setCellStyle(headerStyle);
                sheet.autoSizeColumn(i);
            }

            DateTimeFormatter dateFormatter = DateTimeFormatter.ofPattern("dd/MM/yyyy");
            DateTimeFormatter timeFormatter = DateTimeFormatter.ofPattern("HH:mm");

            String[] clientNames = booking.getClientsNames().split(",");
            String[] discounts = booking.getDiscounts().split(",");
            String[] totalPrices = booking.getTotalPrice().split(",");
            String[] totalWithIva = booking.getTotalWithIva().split(",");

            for (int j = 0; j < booking.getNumOfPeople(); j++) {
                Row dataRow = sheet.createRow(j + 1);

                dataRow.createCell(0).setCellValue(booking.getId() != null ? booking.getId() : 0);
                dataRow.createCell(1).setCellValue(booking.getBookingDate() != null ? booking.getBookingDate().format(dateFormatter) : "");
                dataRow.createCell(2).setCellValue(booking.getBookingTime() != null ? booking.getBookingTime().format(timeFormatter) : "");
                dataRow.createCell(3).setCellValue(booking.getLapsOrMaxTimeAllowed() != null ? booking.getLapsOrMaxTimeAllowed() : 0);
                dataRow.createCell(4).setCellValue(booking.getNumOfPeople() != null ? booking.getNumOfPeople() : 0);
                dataRow.createCell(5).setCellValue(clientNames.length > 0 ? clientNames[0] : "");
                dataRow.createCell(6).setCellValue(clientNames.length > j ? clientNames[j] : "");
                dataRow.createCell(7).setCellValue(booking.getPrice() != null ? booking.getPrice() : "");
                dataRow.createCell(8).setCellValue(discounts.length > j ? discounts[j] : "");
                dataRow.createCell(9).setCellValue(totalPrices.length > j ? totalPrices[j] : "");
                dataRow.createCell(10).setCellValue(booking.getIva() != null ? booking.getIva() : 0);
                dataRow.createCell(11).setCellValue(totalWithIva.length > j ? totalWithIva[j] : "");
            }

            for (int i = 0; i < columns.length; i++) {
                sheet.autoSizeColumn(i);
            }

            ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
            workbook.write(outputStream);

            byte[] excelBytes = outputStream.toByteArray();

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"));
            headers.setContentDispositionFormData("attachment", "Comprobante_" + booking.getId() + ".xlsx");

            return ResponseEntity
                    .ok()
                    .headers(headers)
                    .body(excelBytes);

        } catch (IOException e) {
            throw new RuntimeException("Error al generar el archivo Excel del comprobante: " + e.getMessage());
        }
    }

    /**
     * Método para exportar el comprobante a PDF
     * @return ResponseEntity con el archivo PDF
     */
    public ResponseEntity<byte[]> convertExcelToPdf(Long bookingId) {
        ResponseEntity<byte[]> excelResponse = exportVoucherToExcel(bookingId);

        try (InputStream is = new ByteArrayInputStream(Objects.requireNonNull(excelResponse.getBody()));
             Workbook workbook = new XSSFWorkbook(is);
             ByteArrayOutputStream pdfOutputStream = new ByteArrayOutputStream()) {

            Sheet sheet = workbook.getSheetAt(0);

            Document document = new Document();
            PdfWriter.getInstance(document, pdfOutputStream);
            document.open();

            // Extract the header row
            Row headerRow = sheet.getRow(0);
            List<String> headers = new ArrayList<>();
            for (Cell cell : headerRow) {
                headers.add(getCellValueAsString(cell));
            }

            for (int rowIndex = 1; rowIndex <= sheet.getLastRowNum(); rowIndex++) { // Skip header row
                Row row = sheet.getRow(rowIndex);

                if (row == null) continue;

                PdfPTable pdfTable = new PdfPTable(row.getLastCellNum());
                pdfTable.setWidthPercentage(100);

                // Add header row to the table
                for (String header : headers) {
                    PdfPCell headerCell = new PdfPCell(new Phrase(header));
                    headerCell.setBackgroundColor(new BaseColor(230, 230, 250)); // Optional: Add background color
                    pdfTable.addCell(headerCell);
                }

                // Add data row to the table
                for (Cell cell : row) {
                    String value = getCellValueAsString(cell);
                    PdfPCell pdfCell = new PdfPCell(new Phrase(value));
                    pdfTable.addCell(pdfCell);
                }

                document.add(pdfTable);
                document.newPage(); // Add a new page for the next row
            }

            document.close();

            byte[] pdfBytes = pdfOutputStream.toByteArray();

            HttpHeaders headersHttp = new HttpHeaders();
            headersHttp.setContentType(MediaType.APPLICATION_PDF);
            headersHttp.setContentDispositionFormData("attachment", "Comprobante_" + bookingId + ".pdf");

            return ResponseEntity
                    .ok()
                    .headers(headersHttp)
                    .body(pdfBytes);

        } catch (Exception e) {
            throw new RuntimeException("Error al convertir Excel a PDF: " + e.getMessage());
        }
    }

    private String getCellValueAsString(Cell cell) {
        if (cell == null) return "";
        return switch (cell.getCellType()) {
            case STRING -> cell.getStringCellValue();
            case NUMERIC -> DateUtil.isCellDateFormatted(cell)
                    ? cell.getDateCellValue().toString()
                    : String.valueOf(cell.getNumericCellValue());
            case BOOLEAN -> String.valueOf(cell.getBooleanCellValue());
            case FORMULA -> cell.getCellFormula();
            default -> "";
        };
    }

    /**
     * Método para enviar un pdf por correo
     */
}