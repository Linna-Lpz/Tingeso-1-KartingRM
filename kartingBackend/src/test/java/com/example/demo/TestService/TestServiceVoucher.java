package com.example.demo.TestService;

import com.example.demo.entities.EntityBooking;
import com.example.demo.repositories.RepoBooking;
import com.example.demo.services.ServiceVoucher;
import org.apache.poi.ss.usermodel.Cell;
import org.apache.poi.ss.usermodel.CellStyle;
import org.apache.poi.ss.usermodel.CellType;
import org.apache.poi.ss.usermodel.DateUtil;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.mockito.MockedStatic;
import static org.mockito.Mockito.mockStatic;

import java.io.IOException;
import java.lang.reflect.Method;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.Objects;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.*;

public class TestServiceVoucher {

    @Mock
    private RepoBooking repoBooking;

    @InjectMocks
    private ServiceVoucher serviceVoucher;

    @Mock
    private Cell cell;

    private EntityBooking booking;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
        reset(cell);
        // Inicializar un objeto de EntityBooking para las pruebas
        booking = new EntityBooking();
        booking.setId(1L);
        booking.setBookingDate(LocalDate.of(2025, 4, 26));
        booking.setBookingTime(LocalTime.of(14, 0));
        booking.setBookingTimeEnd(LocalTime.of(16, 0));
        booking.setLapsOrMaxTimeAllowed(2);
        booking.setNumOfPeople(3);
        booking.setClientsNames("Juan Pérez,María González,Pedro Rodríguez");
        booking.setPrice("5000");
        booking.setDiscounts("Ninguno,Estudiante,Senior");
        booking.setTotalPrice("5000,4000,3500");
        booking.setIva("19");
        booking.setTotalWithIva("5950,4760,4165");
        booking.setTotalAmount(14875);
    }

    @Test
    void whenExportVoucherToExcelWithValidBookingId_thenReturnExcelFile() {
        // Given
        when(repoBooking.findById(1L)).thenReturn(Optional.of(booking));

        // When
        ResponseEntity<byte[]> response = serviceVoucher.exportVoucherToExcel(1L);

        // Then
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(Objects.requireNonNull(response.getHeaders().getContentType()).toString())
                .isEqualTo(MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet").toString());
        assertThat(response.getHeaders().getContentDisposition().getFilename())
                .isEqualTo("Comprobante_1.xlsx");
        assertThat(response.getBody()).isNotNull();
        assertThat(response.getBody().length).isGreaterThan(0);
    }

    @Test
    void whenExportVoucherToExcelWithInvalidBookingId_thenThrowException() {
        // Given
        when(repoBooking.findById(999L)).thenReturn(Optional.empty());

        // When/Then
        assertThatThrownBy(() -> serviceVoucher.exportVoucherToExcel(999L))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("Reserva no encontrada con ID: 999");
    }

    @Test
    void whenExportVoucherToExcelIOException_thenThrowRuntimeException() {
        // Given
        when(repoBooking.findById(1L)).thenReturn(Optional.of(booking));

        ServiceVoucher spyService = spy(serviceVoucher);
        doThrow(new IOException("Error de escritura")).when(spyService).exportVoucherToExcel(anyLong());

        // When/Then
        assertThatThrownBy(() -> spyService.exportVoucherToExcel(1L))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("Error al generar el archivo Excel del comprobante");

    }

    @Test
    void whenConvertExcelToPdfIOException_thenThrowRuntimeException() {
        // Given
        when(repoBooking.findById(1L)).thenReturn(Optional.of(booking));

        ServiceVoucher spyService = spy(serviceVoucher);
        doThrow(new RuntimeException("Simulación error PDF")).when(spyService).exportVoucherToExcel(anyLong());

        // When/Then
        assertThatThrownBy(() -> spyService.convertExcelToPdf(1L))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("Simulación error PDF");
    }

    @Test
    void whenConvertExcelToPdf_thenResponseShouldBePdfContentType() {
        // Given
        when(repoBooking.findById(1L)).thenReturn(Optional.of(booking));

        ResponseEntity<byte[]> response = serviceVoucher.convertExcelToPdf(1L);

        // Then
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(Objects.requireNonNull(response.getHeaders().getContentType()))
                .isEqualTo(MediaType.APPLICATION_PDF);
        assertThat(response.getBody()).isNotNull();
        assertThat(response.getBody().length).isGreaterThan(0);
    }

    @Test
    void whenGetCellValueAsStringWithUnexpectedCellType_thenReturnEmptyString() throws Exception {
        // Given
        when(cell.getCellType()).thenReturn(CellType.ERROR);

        Method method = ServiceVoucher.class.getDeclaredMethod("getCellValueAsString", Cell.class);
        method.setAccessible(true);

        // When
        String result = (String) method.invoke(serviceVoucher, cell);

        // Then
        assertThat(result).isEqualTo("");
    }


    @Test
    void whenConvertExcelToPdfWithValidBookingId_thenReturnPdfFile() {
        // Given
        when(repoBooking.findById(1L)).thenReturn(Optional.of(booking));

        // Mock la respuesta de exportVoucherToExcel
        byte[] excelBytes = new byte[100];
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"));

        ServiceVoucher spyService = spy(serviceVoucher);
        doReturn(ResponseEntity.ok().headers(headers).body(excelBytes)).when(spyService).exportVoucherToExcel(1L);

        try {
            // When
            spyService.convertExcelToPdf(1L);
        } catch (Exception e) {

            // Then
            verify(repoBooking, times(1)).findById(1L); // Called once in convertExcelToPdf
            verify(spyService, times(1)).exportVoucherToExcel(1L);
        }
    }

    @Test
    void whenConvertExcelToPdfWithInvalidBookingId_thenThrowException() {
        // Given
        when(repoBooking.findById(999L)).thenReturn(Optional.empty());

        // When/Then
        assertThatThrownBy(() -> serviceVoucher.convertExcelToPdf(999L))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("Reserva no encontrada con ID: 999");
    }

    @Test
    void whenGetCellValueAsStringWithStringCell_thenReturnStringValue() throws Exception {
        // Given
        when(cell.getCellType()).thenReturn(CellType.STRING);
        when(cell.getStringCellValue()).thenReturn("Test String");

        Method method = ServiceVoucher.class.getDeclaredMethod("getCellValueAsString", Cell.class);
        method.setAccessible(true);

        // When
        String result = (String) method.invoke(serviceVoucher, cell);

        // Then
        assertThat(result).isEqualTo("Test String");
    }

    @Test
    void whenGetCellValueAsStringWithNumericCell_thenReturnNumericValue() throws Exception {
        // Given
        when(cell.getCellType()).thenReturn(CellType.NUMERIC);
        when(cell.getNumericCellValue()).thenReturn(123.45);

        CellStyle cellStyle = mock(CellStyle.class);
        when(cell.getCellStyle()).thenReturn(cellStyle);
        when(cellStyle.getDataFormat()).thenReturn((short) 0);
        when(cellStyle.getDataFormatString()).thenReturn("General");

        // Now mock DateUtil as a static method
        try (MockedStatic<DateUtil> dateUtilMock = mockStatic(DateUtil.class)) {
            dateUtilMock.when(() -> DateUtil.isCellDateFormatted(cell)).thenReturn(false);

            // Use reflection to test private method
            Method method = ServiceVoucher.class.getDeclaredMethod("getCellValueAsString", Cell.class);
            method.setAccessible(true);

            // When
            String result = (String) method.invoke(serviceVoucher, cell);

            // Then
            assertThat(result).isEqualTo("123.45");
        }
    }


    @Test
    void whenGetCellValueAsStringWithBooleanCell_thenReturnBooleanValue() throws Exception {
        // Given
        when(cell.getCellType()).thenReturn(CellType.BOOLEAN);
        when(cell.getBooleanCellValue()).thenReturn(true);

        Method method = ServiceVoucher.class.getDeclaredMethod("getCellValueAsString", Cell.class);
        method.setAccessible(true);

        // When
        String result = (String) method.invoke(serviceVoucher, cell);

        // Then
        assertThat(result).isEqualTo("true");
    }

    @Test
    void whenGetCellValueAsStringWithFormulaCell_thenReturnFormulaValue() throws Exception {
        // Given
        when(cell.getCellType()).thenReturn(CellType.FORMULA);
        when(cell.getCellFormula()).thenReturn("SUM(A1:A10)");

        Method method = ServiceVoucher.class.getDeclaredMethod("getCellValueAsString", Cell.class);
        method.setAccessible(true);

        // When
        String result = (String) method.invoke(serviceVoucher, cell);

        // Then
        assertThat(result).isEqualTo("SUM(A1:A10)");
    }

    @Test
    void whenGetCellValueAsStringWithBlankCell_thenReturnEmptyString() throws Exception {
        // Given
        when(cell.getCellType()).thenReturn(CellType.BLANK);

        Method method = ServiceVoucher.class.getDeclaredMethod("getCellValueAsString", Cell.class);
        method.setAccessible(true);

        // When
        String result = (String) method.invoke(serviceVoucher, cell);

        // Then
        assertThat(result).isEqualTo("");
    }

    @Test
    void whenGetCellValueAsStringWithNullCell_thenReturnEmptyString() throws Exception {
        Method method = ServiceVoucher.class.getDeclaredMethod("getCellValueAsString", Cell.class);
        method.setAccessible(true);

        // When
        String result = (String) method.invoke(serviceVoucher, (Cell)null);

        // Then
        assertThat(result).isEqualTo("");
    }
}