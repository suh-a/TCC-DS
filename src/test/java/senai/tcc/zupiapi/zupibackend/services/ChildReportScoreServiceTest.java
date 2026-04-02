package senai.tcc.zupiapi.zupibackend.services;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import static org.mockito.ArgumentMatchers.any;
import org.mockito.Captor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import org.mockito.junit.jupiter.MockitoExtension;

import senai.tcc.zupiapi.zupibackend.dto.mapper.ChildReportScoreMapper;
import senai.tcc.zupiapi.zupibackend.dto.request.ChildReportScoreRequest;
import senai.tcc.zupiapi.zupibackend.exceptions.ResourceNotFoundException;
import senai.tcc.zupiapi.zupibackend.model.ChildReport;
import senai.tcc.zupiapi.zupibackend.model.ChildReportScore;
import senai.tcc.zupiapi.zupibackend.model.SkillArea;
import senai.tcc.zupiapi.zupibackend.repositories.ChildReportScoreRepository;
import senai.tcc.zupiapi.zupibackend.repositories.SkillAreaRepository;

/**
 * Testes do serviço ChildReportScoreService.
 * Autor: Ana Luiza Rios
 * Data: 01/04/2026
 */
@ExtendWith(MockitoExtension.class)
class ChildReportScoreServiceTest {

    @InjectMocks
    private ChildReportScoreService service;

    @Mock
    private ChildReportScoreRepository scoreRepository;

    @Mock
    private SkillAreaRepository skillAreaRepository;

    @Mock
    private ChildReportScoreMapper mapper;

    @Captor
    private ArgumentCaptor<ChildReportScore> scoreCaptor;

    private ChildReportScoreRequest request;
    private ChildReport childReport;
    private SkillArea skillArea;
    private ChildReportScore score;

    @BeforeEach
    void setup() {
        request = mock(ChildReportScoreRequest.class);
        childReport = new ChildReport();
        skillArea = new SkillArea();
        score = new ChildReportScore();
    }

    /**
     * Teste 1: Verifica se um score é salvo corretamente.
     */
    @Test
    void testSaveScoreSuccessfully() {
        when(request.themeId()).thenReturn(1L);
        when(skillAreaRepository.findById(1L)).thenReturn(Optional.of(skillArea));
        when(mapper.toEntity(request)).thenReturn(score);
        when(scoreRepository.save(any())).thenReturn(score);

        ChildReportScore result = service.save(request, childReport);

        assertNotNull(result);
        verify(scoreRepository).save(scoreCaptor.capture());
        assertEquals(childReport, scoreCaptor.getValue().getChildReport());
        assertEquals(skillArea, scoreCaptor.getValue().getSkillArea());
    }

    /**
     * Teste 2: Verifica se o mapper é chamado uma vez durante o salvamento.
     */
    @Test
    void testMapperCalledOnce() {
        when(request.themeId()).thenReturn(1L);
        when(skillAreaRepository.findById(1L)).thenReturn(Optional.of(skillArea));
        when(mapper.toEntity(request)).thenReturn(score);

        service.save(request, childReport);

        verify(mapper, times(1)).toEntity(request);
    }

    /**
     * Teste 3: Verifica se o repositório é chamado uma vez para salvar.
     */
    @Test
    void testRepositoryCalledOnce() {
        when(request.themeId()).thenReturn(1L);
        when(skillAreaRepository.findById(1L)).thenReturn(Optional.of(skillArea));
        when(mapper.toEntity(request)).thenReturn(score);

        service.save(request, childReport);

        verify(scoreRepository, times(1)).save(score);
    }

    /**
     * Teste 4: Verifica se lança exceção quando a SkillArea não existe.
     */
    @Test
    void testThrowExceptionWhenSkillAreaMissing() {
        when(request.themeId()).thenReturn(99L);
        when(skillAreaRepository.findById(99L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class,
                () -> service.save(request, childReport));

        verify(scoreRepository, never()).save(any());
    }

    /**
     * Teste 5: Garante que o mapper não é chamado quando a SkillArea não existe.
     */
    @Test
    void testMapperNotCalledWhenSkillAreaMissing() {
        when(request.themeId()).thenReturn(99L);
        when(skillAreaRepository.findById(99L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class,
                () -> service.save(request, childReport));

        verify(mapper, never()).toEntity(any());
    }

    /**
     * Teste 6: Verifica se o ChildReport é corretamente associado ao score.
     */
    @Test
    void testChildReportAssociation() {
        when(request.themeId()).thenReturn(1L);
        when(skillAreaRepository.findById(1L)).thenReturn(Optional.of(skillArea));
        when(mapper.toEntity(request)).thenReturn(score);

        service.save(request, childReport);

        assertEquals(childReport, score.getChildReport());
    }

    /**
     * Teste 7: Verifica se a SkillArea é corretamente associada ao score.
     */
    @Test
    void testSkillAreaAssociation() {
        when(request.themeId()).thenReturn(1L);
        when(skillAreaRepository.findById(1L)).thenReturn(Optional.of(skillArea));
        when(mapper.toEntity(request)).thenReturn(score);

        service.save(request, childReport);

        assertEquals(skillArea, score.getSkillArea());
    }

    /**
     * Teste 8: Verifica comportamento quando o mapper retorna objeto vazio.
     */
    @Test
    void testEmptyEntityFromMapper() {
        ChildReportScore emptyScore = new ChildReportScore();

        when(request.themeId()).thenReturn(1L);
        when(skillAreaRepository.findById(1L)).thenReturn(Optional.of(skillArea));
        when(mapper.toEntity(request)).thenReturn(emptyScore);

        service.save(request, childReport);

        assertNotNull(emptyScore.getChildReport());
        assertNotNull(emptyScore.getSkillArea());
    }

    /**
     * Teste 9: Verifica consistência ao salvar múltiplas vezes.
     */
    @Test
    void testConsistencyMultipleCalls() {
        when(request.themeId()).thenReturn(1L);
        when(skillAreaRepository.findById(1L)).thenReturn(Optional.of(skillArea));
        when(mapper.toEntity(request)).thenReturn(score);

        service.save(request, childReport);
        service.save(request, childReport);

        verify(scoreRepository, times(2)).save(score);
    }

    /**
     * Teste 10: Verifica se o objeto original score não é modificado.
     */
    @Test
    void testOriginalScoreNotModified() {
        when(request.themeId()).thenReturn(1L);
        when(skillAreaRepository.findById(1L)).thenReturn(Optional.of(skillArea));
        when(mapper.toEntity(request)).thenReturn(score);

        service.save(request, childReport);

        assertEquals(childReport, score.getChildReport());
        assertEquals(skillArea, score.getSkillArea());
    }

    /**
     * Teste 11: Verifica exceção quando o request é nulo.
     */
    @Test
    void testExceptionIfRequestNull() {
        assertThrows(NullPointerException.class, () -> service.save(null, childReport));
    }

    /**
     * Teste 12: Verifica exceção quando o ChildReport é nulo.
     */
    @Test
    void testExceptionIfChildReportNull() {
        when(request.themeId()).thenReturn(1L);
        when(skillAreaRepository.findById(1L)).thenReturn(Optional.of(skillArea));
        when(mapper.toEntity(request)).thenReturn(score);

        assertThrows(NullPointerException.class, () -> service.save(request, null));
    }

    /**
     * Teste 13: Verifica que score não é salvo se mapper retorna null.
     */
    @Test
    void testNotSavedIfMapperReturnsNull() {
        when(request.themeId()).thenReturn(1L);
        when(skillAreaRepository.findById(1L)).thenReturn(Optional.of(skillArea));
        when(mapper.toEntity(request)).thenReturn(null);

        assertThrows(NullPointerException.class, () -> service.save(request, childReport));
        verify(scoreRepository, never()).save(any());
    }

    /**
     * Teste 14: Verifica salvamento de múltiplas SkillAreas para o mesmo ChildReport.
     */
    @Test
    void testMultipleSkillAreasForChild() {
        SkillArea area2 = new SkillArea();
        ChildReportScore score2 = new ChildReportScore();

        when(request.themeId()).thenReturn(1L);
        when(skillAreaRepository.findById(1L)).thenReturn(Optional.of(skillArea));
        when(mapper.toEntity(request)).thenReturn(score);

        service.save(request, childReport);

        when(request.themeId()).thenReturn(2L);
        when(skillAreaRepository.findById(2L)).thenReturn(Optional.of(area2));
        when(mapper.toEntity(request)).thenReturn(score2);

        service.save(request, childReport);

        assertEquals(skillArea, score.getSkillArea());
        assertEquals(area2, score2.getSkillArea());
    }

    /**
     * Teste 15: Verifica salvamento de múltiplos scores para o mesmo ChildReport.
     */
    @Test
    void testMultipleScoresSameChild() {
        ChildReportScore score2 = new ChildReportScore();
        when(request.themeId()).thenReturn(1L);
        when(skillAreaRepository.findById(1L)).thenReturn(Optional.of(skillArea));
        when(mapper.toEntity(request)).thenReturn(score, score2);

        service.save(request, childReport);
        service.save(request, childReport);

        verify(scoreRepository, times(2)).save(any());
    }

    /**
     * Teste 16: Verifica que o repositório é chamado com o objeto correto.
     */
    @Test
    void testRepositoryCalledWithCorrectObject() {
        when(request.themeId()).thenReturn(1L);
        when(skillAreaRepository.findById(1L)).thenReturn(Optional.of(skillArea));
        when(mapper.toEntity(request)).thenReturn(score);

        service.save(request, childReport);

        verify(scoreRepository).save(scoreCaptor.capture());
        assertEquals(childReport, scoreCaptor.getValue().getChildReport());
    }

    /**
     * Teste 17: Verifica que repositório não é chamado se SkillArea não existe.
     */
    @Test
    void testRepositoryNotCalledIfSkillAreaMissing() {
        when(request.themeId()).thenReturn(99L);
        when(skillAreaRepository.findById(99L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> service.save(request, childReport));
        verify(scoreRepository, never()).save(any());
    }

    /**
     * Teste 18: Verifica que é possível salvar score mesmo com scores existentes no ChildReport.
     */
    @Test
    void testSaveScoreEvenIfChildHasScores() {
        ChildReportScore score2 = new ChildReportScore();
        when(request.themeId()).thenReturn(1L);
        when(skillAreaRepository.findById(1L)).thenReturn(Optional.of(skillArea));
        when(mapper.toEntity(request)).thenReturn(score2);

        service.save(request, childReport);
        assertEquals(childReport, score2.getChildReport());
    }

    /**
     * Teste 19: Verifica que múltiplas execuções com mesma SkillArea mantêm consistência.
     */
    @Test
    void testMultipleExecutionsSameSkillArea() {
        when(request.themeId()).thenReturn(1L);
        when(skillAreaRepository.findById(1L)).thenReturn(Optional.of(skillArea));
        when(mapper.toEntity(request)).thenReturn(score);

        service.save(request, childReport);
        service.save(request, childReport);

        verify(scoreRepository, times(2)).save(any());
    }

    /**
     * Teste 20: Verifica comportamento com SkillArea válida e ChildReport nulo (exceção).
     */
    @Test
    void testExceptionIfChildReportNullWithValidSkillArea() {
        when(request.themeId()).thenReturn(1L);
        when(skillAreaRepository.findById(1L)).thenReturn(Optional.of(skillArea));
        when(mapper.toEntity(request)).thenReturn(score);

        assertThrows(NullPointerException.class, () -> service.save(request, null));
    }
}
