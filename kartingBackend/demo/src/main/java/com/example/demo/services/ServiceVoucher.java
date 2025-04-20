package com.example.demo.services;

import com.example.demo.entities.EntityBooking;
import com.example.demo.repositories.RepoBooking;
import com.itextpdf.text.BaseColor;
import com.itextpdf.text.Document;
import com.itextpdf.text.Paragraph;
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
                    "Nombre integrante", "Tarifa base", "Tipo descuento",
                    "Monto con descuento", "IVA (%)", "Monto total con IVA"
            };

            for (int i = 0; i < columns.length; i++) {
                Cell cell = headerRow.createCell(i);
                cell.setCellValue(columns[i]);
                cell.setCellStyle(headerStyle);
                sheet.autoSizeColumn(i);
            }

            String[] clientNames = booking.getClientsNames().split(",");
            String[] discounts = booking.getDiscounts().split(",");
            String[] totalPrices = booking.getTotalPrice().split(",");
            String[] totalWithIva = booking.getTotalWithIva().split(",");
            Integer totalAmount = booking.getTotalAmount();

            for (int j = 0; j < booking.getNumOfPeople(); j++) {
                Row dataRow = sheet.createRow(j + 1);

                dataRow.createCell(0).setCellValue(clientNames.length > j ? clientNames[j] : "");
                dataRow.createCell(1).setCellValue(booking.getPrice() != null ? booking.getPrice() : "");
                dataRow.createCell(2).setCellValue(discounts.length > j ? discounts[j] : "");
                dataRow.createCell(3).setCellValue(totalPrices.length > j ? totalPrices[j] : "");
                dataRow.createCell(4).setCellValue(booking.getIva() != null ? booking.getIva() : "");
                dataRow.createCell(5).setCellValue(totalWithIva.length > j ? totalWithIva[j] : "");
            }

            for (int i = 0; i < columns.length; i++) {
                sheet.autoSizeColumn(i); // Ajustar el ancho de la columna
            }

            Row amountRow = sheet.createRow(booking.getNumOfPeople() + 2); // Crear fila para "Total a Pagar"
            Cell cell = amountRow.createCell(columns.length - 1);
            cell.setCellValue("Total a Pagar");
            cell.setCellStyle(headerStyle);

            // Crear fila debajo para el valor de totalAmount
            Row totalAmountRow = sheet.createRow(booking.getNumOfPeople() + 3);
            Cell totalAmountCell = totalAmountRow.createCell(columns.length - 1);
            totalAmountCell.setCellValue(totalAmount);

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
        EntityBooking booking = repoBooking.findById(bookingId)
                .orElseThrow(() -> new RuntimeException("Reserva no encontrada con ID: " + bookingId));

        Long id = booking.getId();
        String bookingDate = booking.getBookingDate().format(DateTimeFormatter.ofPattern("dd-MM-yyyy"));
        String bookingTime = booking.getBookingTime().format(DateTimeFormatter.ofPattern("HH:mm"));
        String bookingTimeEnd = booking.getBookingTimeEnd().format(DateTimeFormatter.ofPattern("HH:mm"));
        String lapsOrMaxTimeAllowed = booking.getLapsOrMaxTimeAllowed() != null ? booking.getLapsOrMaxTimeAllowed().toString() : "";
        String numOfPeople = booking.getNumOfPeople() != null ? booking.getNumOfPeople().toString() : "";
        String[] clientsNames = booking.getClientsNames().split(",");
        String totalAmount = booking.getTotalAmount() != null ? booking.getTotalAmount().toString() : "";

        ResponseEntity<byte[]> excelResponse = exportVoucherToExcel(bookingId);

        try (InputStream is = new ByteArrayInputStream(Objects.requireNonNull(excelResponse.getBody()));
             Workbook workbook = new XSSFWorkbook(is);
             ByteArrayOutputStream pdfOutputStream = new ByteArrayOutputStream()) {

            Sheet sheet = workbook.getSheetAt(0);

            Document document = new Document();
            PdfWriter.getInstance(document, pdfOutputStream);
            document.open();

            // Se agregan los datos de la reserva como párrafos antes de la tabla
            document.add(new Paragraph("Código de la reserva: " + id));
            document.add(new Paragraph("Fecha de la reserva: " + bookingDate));
            document.add(new Paragraph("Hora de la reserva: " + bookingTime));
            document.add(new Paragraph("Hora de fin de la reserva: " + bookingTimeEnd));
            document.add(new Paragraph("Vueltas o tiempo reservado: " + lapsOrMaxTimeAllowed));
            document.add(new Paragraph("Personas incluidas: " + numOfPeople));
            document.add(new Paragraph("Cliente que realizó la reserva: " + clientsNames[0]));

            // Se agrega un espacio antes de la tabla
            document.add(new Paragraph("\n"));

            // Se extrae la primera fila como encabezado
            Row headerRow = sheet.getRow(0);
            List<String> headers = new ArrayList<>();
            for (Cell cell : headerRow) {
                headers.add(getCellValueAsString(cell));
            }

            // Se crea una tabla con el número de columnas del encabezado
            PdfPTable pdfTable = new PdfPTable(headerRow.getLastCellNum());
            pdfTable.setWidthPercentage(100);

            // Se añaden los encabezados a la tabla
            for (String header : headers) {
                PdfPCell headerCell = new PdfPCell(new Phrase(header));
                headerCell.setBackgroundColor(new BaseColor(230, 230, 250)); // Color de fondo para los encabezados
                headerCell.setHorizontalAlignment(PdfPCell.ALIGN_CENTER); // Alinear texto al centro
                headerCell.setPadding(8); // Añadir padding
                pdfTable.addCell(headerCell);
            }

            // Se añaden las filas de datos a la tabla
            for (int rowIndex = 1; rowIndex <= sheet.getLastRowNum(); rowIndex++) { // Omite la fila de encabezado
                Row row = sheet.getRow(rowIndex);

                if (row == null) continue;

                for (Cell cell : row) {
                    String value = getCellValueAsString(cell);
                    PdfPCell pdfCell = new PdfPCell(new Phrase(value));
                    pdfCell.setHorizontalAlignment(PdfPCell.ALIGN_CENTER); // Alinear texto al centro
                    pdfCell.setPadding(8); // Añadir padding
                    pdfTable.addCell(pdfCell);
                }
            }

            // Se añade la tabla al documento
            document.add(pdfTable);
            // Se añade el precio total al final del documento
            document.add(new Paragraph("Total a pagar: $" + totalAmount));
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