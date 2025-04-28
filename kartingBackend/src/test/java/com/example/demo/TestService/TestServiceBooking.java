package com.example.demo.TestService;

import com.example.demo.entities.EntityBooking;
import com.example.demo.entities.EntityClient;
import com.example.demo.repositories.RepoBooking;
import com.example.demo.repositories.RepoClient;
import com.example.demo.services.ServiceBooking;
import com.example.demo.services.ServiceVoucher;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.mockito.Spy;
import org.springframework.test.util.ReflectionTestUtils;

import java.time.LocalDate;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyInt;
import static org.mockito.Mockito.*;

class TestServiceBooking {

    @Mock
    private RepoBooking repoBooking;

    @Mock
    private RepoClient repoClient;

    @Spy
    @InjectMocks
    private ServiceBooking serviceBooking;

    @Mock
    private ServiceVoucher serviceVoucher;

    private EntityBooking booking;
    private EntityClient client;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);

        // Inicializar un objeto de EntityBooking para las pruebas
        booking = new EntityBooking();
        booking.setLapsOrMaxTimeAllowed(10);
        booking.setNumOfPeople(3);
        booking.setBookingDate(LocalDate.now());
        booking.setBookingTime(LocalTime.of(15, 0));
        booking.setClientsRUT("12345678-9");
        booking.setClientsNames("Test Client");
        booking.setClientsEmails("test@example.com");
        booking.setIva("19");

        client = new EntityClient();
        client.setClientRUT("12345678-9");
        client.setClientName("Test Client");
        client.setVisistsPerMonth(3);
    }

    // --------------------------------Test-SaveBooking--------------------------------------------
    @Test
    void whenSaveBooking_WithInvalidLapsOrMaxTimeAllowed_thenDoesNotSaveBooking() {
        // Given
        booking.setLapsOrMaxTimeAllowed(5); // Invalid value
        booking.setNumOfPeople(3);

        // When
        serviceBooking.saveBooking(booking);

        // Then
        verify(repoBooking, never()).save(any(EntityBooking.class));
    }

    @Test
    void whenSaveBooking_WithLapsOrMaxTimeAllowed10_thenAssignsCorrectValues() {
        // Given
        booking.setLapsOrMaxTimeAllowed(10);
        booking.setBookingDate(LocalDate.of(2025, 4, 25));
        booking.setBookingTime(LocalTime.of(15, 0));

        // Mock dependencias
        doReturn(true).when(serviceBooking).isBookingTimeValid(any(EntityBooking.class), anyInt(), any(RepoBooking.class));
        doReturn(true).when(serviceBooking).validateClientWhoMadeReservation(any(String[].class));

        // When
        serviceBooking.saveBooking(booking);

        // Then
        assertThat(booking.getPrice()).isEqualTo("15000");
        verify(repoBooking).save(booking);
    }

    @Test
    void whenSaveBooking_WithLapsOrMaxTimeAllowed15_thenAssignsCorrectValues() {
        // Given
        booking.setLapsOrMaxTimeAllowed(15);
        booking.setBookingDate(LocalDate.of(2025, 4, 25));
        booking.setBookingTime(LocalTime.of(15, 0));

        // Mock dependencies
        doReturn(true).when(serviceBooking).isBookingTimeValid(any(EntityBooking.class), anyInt(), any(RepoBooking.class));
        doReturn(true).when(serviceBooking).validateClientWhoMadeReservation(any(String[].class));

        // When
        serviceBooking.saveBooking(booking);

        // Then
        assertThat(booking.getPrice()).isEqualTo("20000");
        verify(repoBooking).save(booking);
    }

    @Test
    void whenSaveBooking_WithLapsOrMaxTimeAllowed20_thenAssignsCorrectValues() {
        // Given
        booking.setLapsOrMaxTimeAllowed(20);
        booking.setBookingDate(LocalDate.of(2025, 4, 25)); // Ensure valid date
        booking.setBookingTime(LocalTime.of(15, 0)); // Ensure valid time

        // Mock dependencias
        doReturn(true).when(serviceBooking).isBookingTimeValid(any(EntityBooking.class), anyInt(), any(RepoBooking.class));
        doReturn(true).when(serviceBooking).validateClientWhoMadeReservation(any(String[].class));

        // When
        serviceBooking.saveBooking(booking);

        // Then
        assertThat(booking.getPrice()).isEqualTo("25000");
        verify(repoBooking).save(booking);
    }

    @Test
    void whenSaveBooking_WithTooManyPeople_thenDoesNotSaveBooking() {
        // Given
        booking.setLapsOrMaxTimeAllowed(10);
        booking.setNumOfPeople(20);

        // When
        serviceBooking.saveBooking(booking);

        // Then
        verify(repoBooking, never()).save(any(EntityBooking.class));
    }

    @Test
    void whenSaveBooking_WithMissingFields_thenDoesNotSaveBooking() {
        // Given
        booking.setClientsRUT("");
        booking.setClientsNames("");

        // When
        serviceBooking.saveBooking(booking);

        // Then
        verify(repoBooking, never()).save(any(EntityBooking.class));
    }

    @Test
    void whenSaveBooking_WithOverlappingTimes_thenDoesNotSaveBooking() {
        // Given
        booking.setBookingDate(LocalDate.of(2025, 2, 10));
        booking.setBookingTime(LocalTime.of(16, 0));
        booking.setLapsOrMaxTimeAllowed(10);

        EntityBooking existingBooking = new EntityBooking();
        existingBooking.setBookingTime(LocalTime.of(15, 45));
        existingBooking.setBookingTimeEnd(LocalTime.of(16, 15));

        when(repoBooking.findByBookingDate(any(LocalDate.class))).thenReturn(List.of(existingBooking));

        // When
        serviceBooking.saveBooking(booking);

        // Then
        verify(repoBooking, never()).save(any(EntityBooking.class));
    }

    // --------------------------------Test-ValidateBookingFields--------------------------------------------
    @Test
    void whenValidateBookingFields_WithValidFields_thenReturnsTrue() {
        // Given
        booking.setBookingDate(LocalDate.of(2025, 2, 10));
        booking.setBookingTime(LocalTime.of(16, 0));
        booking.setLapsOrMaxTimeAllowed(10);
        booking.setNumOfPeople(3);
        booking.setClientsRUT("12345678-9");
        booking.setClientsNames("Test Client");
        booking.setClientsEmails("test@example.com");

        doReturn(true).when(serviceBooking).isBookingTimeValid(any(EntityBooking.class), anyInt(), any(RepoBooking.class));

        // When
        boolean result = serviceBooking.validateBookingFields(booking, 30);

        // Then
        assertThat(result).isTrue();
    }

    @Test
    void whenValidateBookingFields_WithMissingFields_thenReturnsFalse() {
        // Given
        booking.setBookingDate(null);

        // When
        boolean result = serviceBooking.validateBookingFields(booking, 30);

        // Then
        assertThat(result).isFalse();
    }

    @Test
    void whenValidateBookingFields_WithTooManyPeople_thenReturnsFalse() {
        // Given
        booking.setNumOfPeople(20); // Maximum is 15

        // When
        boolean result = serviceBooking.validateBookingFields(booking, 30);

        // Then
        assertThat(result).isFalse();
    }

    // --------------------------------Test-IsBookingTimeValid--------------------------------------------
    @Test
    void whenIsBookingTimeValid_WithValidTime_AndNoConflict_thenReturnsTrue() {
        // Given
        booking.setBookingDate(LocalDate.of(2025, 2, 10)); // Not a holiday
        booking.setBookingTime(LocalTime.of(15, 0));
        List<EntityBooking> existingBookings = new ArrayList<>();
        when(repoBooking.findByBookingDate(any(LocalDate.class))).thenReturn(existingBookings);

        // When
        boolean result = serviceBooking.isBookingTimeValid(booking, 30, repoBooking);

        // Then
        assertThat(result).isTrue();
        assertThat(booking.getBookingTimeEnd()).isEqualTo(LocalTime.of(15, 30));
    }

    @Test
    void whenIsBookingTimeValid_WithTimeBeforeOpeningHours_thenReturnsFalse() {
        // Given
        booking.setBookingDate(LocalDate.of(2025, 2, 10)); // Not a holiday
        booking.setBookingTime(LocalTime.of(13, 0)); // Before opening at 14:00

        // When
        boolean result = serviceBooking.isBookingTimeValid(booking, 30, repoBooking);

        // Then
        assertThat(result).isFalse();
    }

    @Test
    void whenIsBookingTimeValid_WithTimeAfterClosingHours_thenReturnsFalse() {
        // Given
        booking.setBookingDate(LocalDate.of(2025, 2, 10));
        booking.setBookingTime(LocalTime.of(22, 30)); // After closing at 22:00

        // When
        boolean result = serviceBooking.isBookingTimeValid(booking, 30, repoBooking);

        // Then
        assertThat(result).isFalse();
    }

    @Test
    void whenIsBookingTimeValid_WithConflictingBooking_thenReturnsFalse() {
        // Given
        booking.setBookingDate(LocalDate.of(2025, 2, 10));
        booking.setBookingTime(LocalTime.of(16, 0));

        EntityBooking existingBooking = new EntityBooking();
        existingBooking.setBookingTime(LocalTime.of(15, 45));
        existingBooking.setBookingTimeEnd(LocalTime.of(16, 15));

        List<EntityBooking> existingBookings = List.of(existingBooking);
        when(repoBooking.findByBookingDate(any(LocalDate.class))).thenReturn(existingBookings);

        // When
        boolean result = serviceBooking.isBookingTimeValid(booking, 30, repoBooking);

        // Then
        assertThat(result).isFalse();
    }

    // --------------------------------Test-CheckIfHoliday--------------------------------------------

    @Test
    void whenCheckIfHoliday_thenReturnsCorrectResult() {
        // Given
        LocalDate holidayDate = LocalDate.of(2025, 1, 1); // New Year's Day
        LocalDate nonHolidayDate = LocalDate.of(2025, 1, 2);

        // When
        boolean isHoliday1 = serviceBooking.checkIfHoliday(holidayDate);
        boolean isHoliday2 = serviceBooking.checkIfHoliday(nonHolidayDate);

        // Then
        assertThat(isHoliday1).isTrue();
        assertThat(isHoliday2).isFalse();
    }

    // --------------------------------Test-ValidateClientWhoMadeReservation--------------------------------------------
    @Test
    void whenValidateClientWhoMadeReservation_WithRegisteredClient_thenReturnsTrue() {
        // Given
        String[] clientRuts = {"12345678-9"};
        when(repoClient.findByClientRUT("12345678-9")).thenReturn(client);

        // When
        boolean result = serviceBooking.validateClientWhoMadeReservation(clientRuts);

        // Then
        assertThat(result).isTrue();
    }

    @Test
    void whenValidateClientWhoMadeReservation_WithUnregisteredClient_thenReturnsFalse() {
        // Given
        String[] clientRuts = {"98765432-1"};
        when(repoClient.findByClientRUT("98765432-1")).thenReturn(null);
        when(repoClient.findByClientRUT("98765432-2")).thenReturn(null);
        when(repoClient.findByClientRUT("98765432-3")).thenReturn(null);
        when(repoClient.findByClientRUT("98765432-4")).thenReturn(null);
        when(repoClient.findByClientRUT("98765432-5")).thenReturn(null);
        when(repoClient.findByClientRUT("98765432-6")).thenReturn(null);
        when(repoClient.findByClientRUT("98765432-8")).thenReturn(null);
        when(repoClient.findByClientRUT("98765432-9")).thenReturn(null);
        when(repoClient.findByClientRUT("98765432-0")).thenReturn(null);

        // When
        boolean result = serviceBooking.validateClientWhoMadeReservation(clientRuts);

        // Then
        assertThat(result).isFalse();
    }

    @Test
    void whenValidateClientWhoMadeReservation_WithEmptyRutList_thenReturnsFalse() {
        // Given
        String[] clientRuts = {};

        // When
        boolean result = serviceBooking.validateClientWhoMadeReservation(clientRuts);

        // Then
        assertThat(result).isFalse();
    }

    // --------------------------------Test-discountsApplied--------------------------------------------
    @Test
    void whenDiscountsApplied_ForSmallGroup_WithFrequentVisitor_thenReturnsCorrectDiscounts() {
        // Given
        booking.setNumOfPeople(2);
        booking.setBookingDate(LocalDate.now());
        String[] clientRuts = {"12345678-9", "98765432-1"};

        EntityClient client1 = new EntityClient();
        client1.setClientRUT("12345678-9");
        client1.setVisistsPerMonth(3);

        EntityClient client2 = new EntityClient();
        client2.setClientRUT("98765432-1");
        client2.setVisistsPerMonth(6);

        when(repoClient.findByClientRUT("12345678-9")).thenReturn(client1);
        when(repoClient.findByClientRUT("98765432-1")).thenReturn(client2);

        // When
        String discounts = serviceBooking.discountsApplied(clientRuts, booking, repoClient);

        // Then
        assertThat(discounts).isEqualTo("10,20,");
        assertThat(booking.getDiscounts()).isEqualTo("visitas,visitas,");
    }

    @Test
    void whenDiscountsApplied_ForSmallGroup_WithFrequentVisitor7_thenReturnsCorrectDiscounts() {
        // Given
        booking.setNumOfPeople(2);
        booking.setBookingDate(LocalDate.now());
        String[] clientRuts = {"12345678-9"};

        EntityClient client1 = new EntityClient();
        client1.setClientRUT("12345678-9");
        client1.setVisistsPerMonth(7);

        when(repoClient.findByClientRUT("12345678-9")).thenReturn(client1);

        // When
        String discounts = serviceBooking.discountsApplied(clientRuts, booking, repoClient);

        // Then
        assertThat(discounts).isEqualTo("30,");
        assertThat(booking.getDiscounts()).isEqualTo("visitas,");
    }

    @Test
    void whenDiscountsApplied_ForSmallGroup_WithUnregisteredMembers_thenReturnsCorrectDiscounts() {
        // Given
        booking.setNumOfPeople(2);
        booking.setBookingDate(LocalDate.now());
        String[] clientRuts = {"12345678-9", "11111111-1"};

        EntityClient client1 = new EntityClient();
        client1.setClientRUT("12345678-9");
        client1.setVisistsPerMonth(3);

        EntityClient client2 = new EntityClient();
        client2.setClientRUT("98765432-1");
        client2.setVisistsPerMonth(6);

        when(repoClient.findByClientRUT("12345678-9")).thenReturn(client1);
        when(repoClient.findByClientRUT("98765432-1")).thenReturn(client2);

        // When
        String discounts = serviceBooking.discountsApplied(clientRuts, booking, repoClient);

        // Then
        assertThat(discounts).isEqualTo("10,0,");
        assertThat(booking.getDiscounts()).isEqualTo("visitas,no,");
    }

    @Test
    void whenDiscountsApplied_ForMediumGroup_WithBirthday_thenReturnsCorrectDiscounts() {
        // Given
        booking.setNumOfPeople(5);
        LocalDate today = LocalDate.now();
        booking.setBookingDate(today);
        String todayFormatted = today.format(DateTimeFormatter.ofPattern("dd-MM"));
        String[] clientRuts = {"12345678-9", "98765432-1"};

        EntityClient client1 = new EntityClient();
        client1.setClientRUT("12345678-9");
        client1.setVisistsPerMonth(2);
        client1.setClientBirthday(todayFormatted + "-1980");

        EntityClient client2 = new EntityClient();
        client2.setClientRUT("98765432-1");
        client2.setVisistsPerMonth(3);
        client2.setClientBirthday("01-01-1990");

        when(repoClient.findByClientRUT("12345678-9")).thenReturn(client1);
        when(repoClient.findByClientRUT("98765432-1")).thenReturn(client2);

        // When
        String discounts = serviceBooking.discountsApplied(clientRuts, booking, repoClient);

        // Then
        assertThat(discounts).isEqualTo("50,10,");
        assertThat(booking.getDiscounts()).isEqualTo("cumpleaños,integrantes,");
    }

    @Test
    void whenDiscountsApplied_ForMediumGroup2_WithOneBirthday_thenReturnsCorrectDiscounts() {
        // Given
        booking.setNumOfPeople(6);
        booking.setBookingDate(LocalDate.now());
        String[] clientRuts = {"12345678-9", "98765432-1", "11111111-1", "22222222-2", "33333333-3", "44444444-4"};

        for (String rut : clientRuts) {
            EntityClient client = new EntityClient();
            client.setClientRUT(rut);
            client.setVisistsPerMonth(7); // Frequent visitor
            when(repoClient.findByClientRUT(rut)).thenReturn(client);
        }

        // When
        String discounts = serviceBooking.discountsApplied(clientRuts, booking, repoClient);

        // Then
        assertThat(discounts).isEqualTo("30,30,30,30,30,30,");
        assertThat(booking.getDiscounts()).isEqualTo("visitas,visitas,visitas,visitas,visitas,visitas,");

    }

    @Test
    void whenGroupOf6To10_WithThreeBirthdays_thenApplyBirthdayDiscounts() {
        // Given
        booking.setNumOfPeople(8);
        booking.setBookingDate(LocalDate.now());
        String todayFormatted = LocalDate.now().format(DateTimeFormatter.ofPattern("dd-MM"));
        String[] clientRuts = {"12345678-9", "98765432-1", "11111111-1", "22222222-2", "33333333-3", "44444444-4", "55555555-5", "66666666-6"};

        for (int i = 0; i < clientRuts.length; i++) {
            EntityClient client = new EntityClient();
            client.setClientRUT(clientRuts[i]);
            client.setVisistsPerMonth(5); // Moderate visitor
            if (i < 3) {
                client.setClientBirthday(todayFormatted + "-1990"); // First 3 clients have birthdays
            }
            when(repoClient.findByClientRUT(clientRuts[i])).thenReturn(client);
        }

        // When
        String discounts = serviceBooking.discountsApplied(clientRuts, booking, repoClient);

        // Then
        assertThat(discounts).isEqualTo("50,50,50,20,20,20,20,20,");
        assertThat(booking.getDiscounts()).isEqualTo("cumpleaños,cumpleaños,cumpleaños,integrantes,integrantes,integrantes,integrantes,integrantes,");
    }

    @Test
    void whenGroupOf6To10_WithoutBirthdays_thenApplyVisitAndGroupDiscounts() {
        // Given
        booking.setNumOfPeople(7);
        booking.setBookingDate(LocalDate.now());
        String[] clientRuts = {"12345678-9", "98765432-1", "11111111-1", "22222222-2", "33333333-3", "44444444-4", "55555555-5"};

        for (String rut : clientRuts) {
            EntityClient client = new EntityClient();
            client.setClientRUT(rut);
            client.setVisistsPerMonth(8);
            when(repoClient.findByClientRUT(rut)).thenReturn(client);
        }

        // When
        String discounts = serviceBooking.discountsApplied(clientRuts, booking, repoClient);

        // Then
        assertThat(discounts).isEqualTo("30,30,30,30,30,30,30,");
        assertThat(booking.getDiscounts()).isEqualTo("visitas,visitas,visitas,visitas,visitas,visitas,visitas,");
    }

    @Test
    void whenGroupOf11To15_AllRegistered_thenApplyGroupDiscounts() {
        // Given
        booking.setNumOfPeople(12);
        booking.setBookingDate(LocalDate.now());
        String[] clientRuts = {"12345678-9", "98765432-1", "11111111-1", "22222222-2", "33333333-3", "44444444-4",
                                "55555555-5", "66666666-6", "77777777-7", "88888888-8", "99999999-9", "00000000-0"};

        for (String rut : clientRuts) {
            EntityClient client = new EntityClient();
            client.setClientRUT(rut);
            client.setVisistsPerMonth(3); // Moderate visitor
            when(repoClient.findByClientRUT(rut)).thenReturn(client);
        }

        // When
        String discounts = serviceBooking.discountsApplied(clientRuts, booking, repoClient);

        // Then
        assertThat(discounts).isEqualTo("30,30,30,30,30,30,30,30,30,30,30,30,");
        assertThat(booking.getDiscounts()).isEqualTo("integrantes,integrantes,integrantes,integrantes,integrantes,integrantes,integrantes,integrantes,integrantes,integrantes,integrantes,integrantes,");
    }

    @Test
    void whenGroupWithUnregisteredMembers_thenNoDiscountForUnregistered() {
        // Given
        booking.setNumOfPeople(8);
        booking.setBookingDate(LocalDate.now());
        String[] clientRuts = {"12345678-9", "98765432-1", "11111111-1", "22222222-2", "33333333-3", "44444444-4", "55555555-5", "66666666-6"};

        for (int i = 0; i < clientRuts.length; i++) {
            if (i < 5) {
                EntityClient client = new EntityClient();
                client.setClientRUT(clientRuts[i]);
                client.setVisistsPerMonth(4);
                when(repoClient.findByClientRUT(clientRuts[i])).thenReturn(client);
            } else {
                when(repoClient.findByClientRUT(clientRuts[i])).thenReturn(null); // Unregistered members
            }
        }

        // When
        String discounts = serviceBooking.discountsApplied(clientRuts, booking, repoClient);

        // Then
        assertThat(discounts).isEqualTo("20,20,20,20,20,0,0,0,");
        assertThat(booking.getDiscounts()).isEqualTo("integrantes,integrantes,integrantes,integrantes,integrantes,no,no,no,");
    }

    // --------------------------------Test-TotalPriceWithDiscount--------------------------------------------
    @Test
    void whenTotalPriceWithDiscount_thenReturnsCorrectPrices() {
        // Given
        Integer basePrice = 20000;
        String discountsList = "10,20,30,";

        // When
        String totalPrice = serviceBooking.totalPriceWithDiscount(basePrice, discountsList);

        // Then
        assertThat(totalPrice).isEqualTo("18000,16000,14000,");
    }

    // --------------------------------Test-CalculateTotalWithIva--------------------------------------------
    @Test
    void whenCalculateTotalWithIva_thenReturnsCorrectPrices() {
        // Given
        String totalPrice = "18000,16000,14000";
        String iva = "19";

        // When
        String totalWithIva = serviceBooking.calculateTotalWithIva(totalPrice, iva);

        // Then
        assertThat(totalWithIva).isEqualTo("21420,19040,16660");
    }

    // --------------------------------Test-CalculateTotalPrice--------------------------------------------
    @Test
    void whenCalculateTotalPrice_thenReturnsCorrectSum() {
        // Given
        String totalWithIva = "21420,19040,16660";

        // When
        Integer totalPrice = serviceBooking.calculateTotalPrice(totalWithIva);

        // Then
        assertThat(totalPrice).isEqualTo(57120);
    }

    // --------------------------------Test-ConfirmBooking--------------------------------------------
    @Test
    void whenConfirmBooking_thenStatusIsUpdated() {
        // Given
        Long bookingId = 1L;
        EntityBooking existingBooking = new EntityBooking();
        existingBooking.setBookingStatus("sin confirmar");

        when(repoBooking.findById(bookingId)).thenReturn(Optional.of(existingBooking));

        // Set the mock serviceVoucher into serviceBooking
        ReflectionTestUtils.setField(serviceBooking, "serviceVoucher", serviceVoucher);

        // When
        serviceBooking.confirmBooking(bookingId);

        // Then
        verify(repoBooking).save(existingBooking);
        verify(serviceVoucher).sendVoucherByEmail(bookingId);
        assertThat(existingBooking.getBookingStatus()).isEqualTo("confirmada");
    }

    // --------------------------------Test-CancelBooking--------------------------------------------
    @Test
    void whenCancelBooking_thenStatusIsUpdated() {
        // Given
        Long bookingId = 1L;
        EntityBooking existingBooking = new EntityBooking();
        existingBooking.setBookingStatus("sin confirmar");

        when(repoBooking.findById(bookingId)).thenReturn(Optional.of(existingBooking));

        // When
        serviceBooking.cancelBooking(bookingId);

        // Then
        verify(repoBooking).save(existingBooking);
        assertThat(existingBooking.getBookingStatus()).isEqualTo("cancelada");
    }

    // --------------------------------Test-GetBookingsByUserRut--------------------------------------------
    @Test
    void whenGetBookingsByUserRut_WithNoBookings_thenReturnsEmptyList() {
        // Given
        String clientRut = "12345678-9";
        when(repoBooking.findByClientsRUTContains(clientRut)).thenReturn(new ArrayList<>());

        // When
        List<EntityBooking> result = serviceBooking.getBookingsByUserRut(clientRut);

        // Then
        assertThat(result).isEmpty();
        verify(repoBooking).findByClientsRUTContains(clientRut);
    }

    @Test
    void whenGetBookingsByUserRut_WithValidRut_thenReturnsFilteredBookings() {
        // Given
        String clientRut = "12345678-9";

        EntityBooking booking1 = new EntityBooking();
        booking1.setClientsRUT("12345678-9,98765432-1");

        EntityBooking booking2 = new EntityBooking();
        booking2.setClientsRUT("98765432-1,12345678-9");

        List<EntityBooking> allBookings = List.of(booking1, booking2);
        when(repoBooking.findByClientsRUTContains(clientRut)).thenReturn(allBookings);

        // When
        List<EntityBooking> result = serviceBooking.getBookingsByUserRut(clientRut);

        // Then
        assertThat(result).hasSize(1);
        assertThat(result.get(0)).isEqualTo(booking1);
    }

    // --------------------------------Test-GetBookings--------------------------------------------
    @Test
    void whenGetBookings_thenReturnsConfirmedBookings() {
        // Given
        List<EntityBooking> confirmedBookings = new ArrayList<>();
        confirmedBookings.add(new EntityBooking());

        when(repoBooking.findByBookingStatusContains("confirmada")).thenReturn(confirmedBookings);

        // When
        List<EntityBooking> result = serviceBooking.getBookings();

        // Then
        assertThat(result).isEqualTo(confirmedBookings);
    }

    // --------------------------------Test-GetTimesByDate--------------------------------------------
    @Test
    void whenGetTimesByDate_thenReturnsBookingTimes() {
        // Given
        LocalDate date = LocalDate.now();

        EntityBooking booking1 = new EntityBooking();
        booking1.setBookingTime(LocalTime.of(15, 0));

        EntityBooking booking2 = new EntityBooking();
        booking2.setBookingTime(LocalTime.of(16, 30));

        List<EntityBooking> bookings = List.of(booking1, booking2);
        when(repoBooking.findByBookingDate(date)).thenReturn(bookings);

        // When
        List<LocalTime> result = serviceBooking.getTimesByDate(date);

        // Then
        assertThat(result).containsExactly(LocalTime.of(15, 0), LocalTime.of(16, 30));
    }

    // --------------------------------Test-GetTimesEndByDate--------------------------------------------
    @Test
    void whenGetTimesEndByDate_thenReturnsBookingEndTimes() {
        // Given
        LocalDate date = LocalDate.now();

        EntityBooking booking1 = new EntityBooking();
        booking1.setBookingTimeEnd(LocalTime.of(15, 30));

        EntityBooking booking2 = new EntityBooking();
        booking2.setBookingTimeEnd(LocalTime.of(17, 0));

        List<EntityBooking> bookings = List.of(booking1, booking2);
        when(repoBooking.findByBookingDate(date)).thenReturn(bookings);

        // When
        List<LocalTime> result = serviceBooking.getTimesEndByDate(date);

        // Then
        assertThat(result).containsExactly(LocalTime.of(15, 30), LocalTime.of(17, 0));
    }

    // --------------------------------Test-GetConfirmedBookings--------------------------------------------
    @Test
    void whenGetConfirmedBookings_thenReturnsConfirmedBookings() {
        // Given
        EntityBooking booking1 = new EntityBooking();
        booking1.setBookingStatus("confirmada");

        EntityBooking booking2 = new EntityBooking();
        booking2.setBookingStatus("confirmada");

        List<EntityBooking> confirmedBookings = List.of(booking1, booking2);
        when(repoBooking.findByBookingStatusContains("confirmada")).thenReturn(confirmedBookings);

        // When
        List<EntityBooking> result = serviceBooking.getConfirmedBookings();

        // Then
        assertThat(result).hasSize(2);
        assertThat(result).isEqualTo(confirmedBookings);
        verify(repoBooking).findByBookingStatusContains("confirmada");
    }
}