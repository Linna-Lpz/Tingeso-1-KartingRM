package com.example.demo.TestService;

import com.example.demo.entities.EntityKard;
import com.example.demo.repositories.RepoKard;
import com.example.demo.services.ServiceKard;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;

import java.util.Optional;

import static org.mockito.Mockito.*;

public class TestServiceKard {


    @Mock
    private RepoKard repoKard;

    @InjectMocks
    private ServiceKard serviceKard;

    private EntityKard kard;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);

        // Crear una instancia de EntityKard para las pruebas
        kard = new EntityKard();
        kard.setCoding("K001");
    }

    // ----------------------------Test-SaveKard--------------------------------
    @Test
    void whenSaveKardWithNewId_thenKardIsSaved() {
        // Given
        when(repoKard.findById("K001")).thenReturn(Optional.empty());

        // When
        serviceKard.saveKard(kard);

        // Then
        verify(repoKard, times(1)).save(kard);
    }

    @Test
    void whenSaveKardWithExistingId_thenKardIsNotSaved() {
        // Given
        when(repoKard.findById("K001")).thenReturn(Optional.of(new EntityKard()));

        // When
        serviceKard.saveKard(kard);

        // Then
        verify(repoKard, never()).save(kard);
    }

    @Test
    void whenSaveMultipleKards_thenOnlyUniqueKardsAreSaved() {
        // Given
        EntityKard kard1 = new EntityKard();
        kard1.setCoding("K001");

        EntityKard kard2 = new EntityKard();
        kard2.setCoding("K002");

        EntityKard kard3 = new EntityKard();
        kard3.setCoding("K001"); // Duplicate of kard1

        when(repoKard.findById("K001")).thenReturn(Optional.empty()).thenReturn(Optional.of(kard1));
        when(repoKard.findById("K002")).thenReturn(Optional.empty());

        // When
        serviceKard.saveKard(kard1);
        serviceKard.saveKard(kard2);
        serviceKard.saveKard(kard3);

        // Then
        verify(repoKard, times(1)).save(kard1);
        verify(repoKard, times(1)).save(kard2);
        verify(repoKard, never()).save(kard3);
    }

    @Test
    void whenSaveKardWithNullId_thenRepositoryIsQueried() {
        // Given
        kard.setCoding(null);
        when(repoKard.findById(null)).thenReturn(Optional.empty());

        // When
        serviceKard.saveKard(kard);

        // Then
        verify(repoKard, times(1)).findById(null);
    }

    @Test
    void whenSaveKardWithEmptyId_thenRepositoryIsQueried() {
        // Given
        kard.setCoding("");
        when(repoKard.findById("")).thenReturn(Optional.empty());

        // When
        serviceKard.saveKard(kard);

        // Then
        verify(repoKard, times(1)).findById("");
    }

    @Test
    void whenSaveKardWithSpecialCharacters_thenRepositoryIsQueriedWithExactId() {
        // Given
        String specialId = "K001-!@#$%^&*()";
        kard.setCoding(specialId);
        when(repoKard.findById(specialId)).thenReturn(Optional.empty());

        // When
        serviceKard.saveKard(kard);

        // Then
        verify(repoKard, times(1)).findById(specialId);
        verify(repoKard, times(1)).save(kard);
    }
}