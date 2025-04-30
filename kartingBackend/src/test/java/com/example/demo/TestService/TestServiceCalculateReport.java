package com.example.demo.TestService;

import com.example.demo.entities.EntityBooking;
import com.example.demo.repositories.RepoBooking;
import com.example.demo.repositories.RepoClient;
import com.example.demo.services.ServiceCalculateReport;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.mockito.Spy;

import java.util.Arrays;
import java.util.Collections;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.*;
import static org.mockito.Mockito.doReturn;

public class TestServiceCalculateReport {

    @Mock
    private RepoBooking repoBooking;

    @Mock
    private RepoClient repoClient;

    @Spy
    @InjectMocks
    private ServiceCalculateReport serviceCalculateReport;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);

    }
    // -------------------------------Test-GetIncomesForMonthOfLaps---------------------------------------------

    @Test
    void whenGetIncomesForMonthOfLaps_thenReturnsCorrectList() {
        // Given
        Integer lapsOrTimeMax = 15;

        // Mock getIncomesForTimeAndMonth method to return specific values for months
        doReturn(0).when(serviceCalculateReport).getIncomesForTimeAndMonth(eq(lapsOrTimeMax), anyString()); // Default for other months
        doReturn(1000).when(serviceCalculateReport).getIncomesForTimeAndMonth(eq(lapsOrTimeMax), eq("01"));
        doReturn(2000).when(serviceCalculateReport).getIncomesForTimeAndMonth(eq(lapsOrTimeMax), eq("02"));
        doReturn(3000).when(serviceCalculateReport).getIncomesForTimeAndMonth(eq(lapsOrTimeMax), eq("03"));

        // When
        List<Integer> result = serviceCalculateReport.getIncomesForMonthOfLaps(lapsOrTimeMax);

        // Then
        assertThat(result).hasSize(14); // lapsOrTimeMax + 12 months + total
        assertThat(result.get(0)).isEqualTo(lapsOrTimeMax);
        assertThat(result.get(1)).isEqualTo(1000); // January
        assertThat(result.get(2)).isEqualTo(2000); // February
        assertThat(result.get(3)).isEqualTo(3000); // March
        assertThat(result.get(13)).isEqualTo(6000); // Total of all months

        // Verify the method was called for each month
        verify(serviceCalculateReport, times(12)).getIncomesForTimeAndMonth(eq(lapsOrTimeMax), anyString());
    }

    // -------------------------------Test-GetIncomesForTimeAndMonth--------------------------------------------
    @Test
    void whenGetIncomesForTimeAndMonth_thenReturnsCorrectIncome() {
        // Given
        Integer lapsOrTimeMax = 10;
        String month = "05"; // May

        EntityBooking booking1 = new EntityBooking();
        booking1.setNumOfPeople(3);
        booking1.setPrice("15000");

        EntityBooking booking2 = new EntityBooking();
        booking2.setNumOfPeople(2);
        booking2.setPrice("15000");

        List<EntityBooking> bookings = List.of(booking1, booking2);
        when(repoBooking.findByStatusAndDayAndLapsOrMaxTime("confirmada", month, lapsOrTimeMax))
                .thenReturn(bookings);

        // When
        Integer result = serviceCalculateReport.getIncomesForTimeAndMonth(lapsOrTimeMax, month);

        // Then
        // Expected: (3 * 15000) + (2 * 15000) = 75000
        assertThat(result).isEqualTo(75000);
        verify(repoBooking).findByStatusAndDayAndLapsOrMaxTime("confirmada", month, lapsOrTimeMax);
    }

    @Test
    void whenGetIncomesForTimeAndMonthWithNoBookings_thenReturnsZero() {
        // Given
        Integer lapsOrTimeMax = 10;
        String month = "06"; // June

        when(repoBooking.findByStatusAndDayAndLapsOrMaxTime("confirmada", month, lapsOrTimeMax))
                .thenReturn(Collections.emptyList());

        // When
        Integer result = serviceCalculateReport.getIncomesForTimeAndMonth(lapsOrTimeMax, month);

        // Then
        assertThat(result).isEqualTo(0);
    }

    // --------------------------------Test-GetIncomesForLapsOfMonth---------------------------------------------
    @Test
    void whenGetIncomesForLapsOfMonth_thenReturnsCorrectTotals() {
        // Given
        List<Integer> incomes10 = Arrays.asList(10, 1000, 2000, 3000, 4000, 5000, 6000, 7000, 8000, 9000, 10000, 11000, 12000, 78000);
        List<Integer> incomes15 = Arrays.asList(15, 2000, 3000, 4000, 5000, 6000, 7000, 8000, 9000, 10000, 11000, 12000, 13000, 90000);
        List<Integer> incomes20 = Arrays.asList(20, 3000, 4000, 5000, 6000, 7000, 8000, 9000, 10000, 11000, 12000, 13000, 14000, 102000);

        doReturn(incomes10).when(serviceCalculateReport).getIncomesForMonthOfLaps(10);
        doReturn(incomes15).when(serviceCalculateReport).getIncomesForMonthOfLaps(15);
        doReturn(incomes20).when(serviceCalculateReport).getIncomesForMonthOfLaps(20);

        // When
        List<Integer> result = serviceCalculateReport.getIncomesForLapsOfMonth();

        // Then
        assertThat(result).hasSize(13); // 12 months + total
        assertThat(result.get(0)).isEqualTo(6000);  // 1000 + 2000 + 3000
        assertThat(result.get(1)).isEqualTo(9000);  // 2000 + 3000 + 4000
        assertThat(result.get(11)).isEqualTo(39000); // 12000 + 13000 + 14000
        assertThat(result.get(12)).isEqualTo(270000); // 78000 + 90000 + 102000
    }
}
