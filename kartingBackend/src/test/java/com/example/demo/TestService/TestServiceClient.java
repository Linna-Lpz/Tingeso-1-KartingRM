package com.example.demo.TestService;

import com.example.demo.entities.EntityClient;
import com.example.demo.repositories.RepoClient;
import com.example.demo.services.ServiceClient;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

public class TestServiceClient {

    @Mock
    private RepoClient repoClient;

    @InjectMocks
    private ServiceClient serviceClient;

    private EntityClient client;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
        client = new EntityClient();
    }

    @Test
    void whenSaveClientWithValidData_thenClientIsSaved() {
        // Given
        client.setClientRUT("12.345.678-9");
        client.setClientName("John Doe");
        client.setClientEmail("john.doe@example.com");
        client.setClientBirthday("1990-01-01");

        when(repoClient.findByClientRUT("12.345.678-9")).thenReturn(null);

        // When
        serviceClient.saveClient(client);

        // Then
        verify(repoClient, times(1)).save(client);
        assertThat(client.getVisistsPerMonth()).isEqualTo(0);
    }

    @Test
    void whenSaveClientWithExistingRUT_thenClientIsNotSaved() {
        // Given
        client.setClientRUT("12.345.678-9");
        client.setClientName("John Doe");
        client.setClientEmail("john.doe@example.com");
        client.setClientBirthday("1990-01-01");

        when(repoClient.findByClientRUT("12.345.678-9")).thenReturn(new EntityClient());

        // When
        serviceClient.saveClient(client);

        // Then
        verify(repoClient, never()).save(any(EntityClient.class));
    }

    @Test
    void whenSaveClientWithMissingRUT_thenClientIsNotSaved() {
        // Given
        client.setClientRUT("");
        client.setClientName("John Doe");
        client.setClientEmail("john.doe@example.com");
        client.setClientBirthday("1990-01-01");

        // When
        serviceClient.saveClient(client);

        // Then
        verify(repoClient, never()).save(any(EntityClient.class));
    }

    @Test
    void whenSaveClientWithMissingName_thenClientIsNotSaved() {
        // Given
        client.setClientRUT("12.345.678-9");
        client.setClientName("");
        client.setClientEmail("john.doe@example.com");
        client.setClientBirthday("1990-01-01");

        // When
        serviceClient.saveClient(client);

        // Then
        verify(repoClient, never()).save(any(EntityClient.class));
    }

    @Test
    void whenSaveClientWithMissingEmail_thenClientIsNotSaved() {
        // Given
        client.setClientRUT("12.345.678-9");
        client.setClientName("John Doe");
        client.setClientEmail("");
        client.setClientBirthday("1990-01-01");

        // When
        serviceClient.saveClient(client);

        // Then
        verify(repoClient, never()).save(any(EntityClient.class));
    }

    @Test
    void whenSaveClientWithMissingBirthday_thenClientIsNotSaved() {
        // Given
        client.setClientRUT("12.345.678-9");
        client.setClientName("John Doe");
        client.setClientEmail("john.doe@example.com");
        client.setClientBirthday("");

        // When
        serviceClient.saveClient(client);

        // Then
        verify(repoClient, never()).save(any(EntityClient.class));
    }

    @Test
    void whenGetClientByRutWithExistingRUT_thenReturnClient() {
        // Given
        EntityClient existingClient = new EntityClient();
        existingClient.setClientRUT("12.345.678-9");
        existingClient.setClientName("John Doe");

        when(repoClient.findByClientRUT("12.345.678-9")).thenReturn(existingClient);

        // When
        EntityClient result = serviceClient.getClientByRut("12.345.678-9");

        // Then
        assertThat(result).isNotNull();
        assertThat(result.getClientRUT()).isEqualTo("12.345.678-9");
        assertThat(result.getClientName()).isEqualTo("John Doe");
    }

    @Test
    void whenGetClientByRutWithNonExistingRUT_thenReturnNull() {
        // Given
        when(repoClient.findByClientRUT("99.999.999-9")).thenReturn(null);

        // When
        EntityClient result = serviceClient.getClientByRut("99.999.999-9");

        // Then
        assertThat(result).isNull();
    }
}
