package senai.tcc.zupiapi.zupibackend.services;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import senai.tcc.zupiapi.zupibackend.dto.ChildScoresAveragesByAreaDTO;
import senai.tcc.zupiapi.zupibackend.dto.mapper.ChildReportMapper;
import senai.tcc.zupiapi.zupibackend.dto.request.ChildReportRequest;
import senai.tcc.zupiapi.zupibackend.dto.request.ChildReportScoreRequest;
import senai.tcc.zupiapi.zupibackend.dto.response.ChildReportResponse;
import senai.tcc.zupiapi.zupibackend.exceptions.ResourceNotFoundException;
import senai.tcc.zupiapi.zupibackend.model.Child;
import senai.tcc.zupiapi.zupibackend.model.ChildReport;
import senai.tcc.zupiapi.zupibackend.model.ChildReportScore;
import senai.tcc.zupiapi.zupibackend.repositories.ChildReportRepository;
import senai.tcc.zupiapi.zupibackend.repositories.ChildRepository;

import java.time.Instant;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertDoesNotThrow;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.ArgumentMatchers.argThat;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;


/***
 * Autor: Auri Jonathan
 * Data: 02/04/2026
 */
@ExtendWith(MockitoExtension.class)
public class ChildReportServiceTest {

    @Mock
    private ChildReportRepository childReportRepository;

    @Mock
    private ChildRepository childRepository;

    @Mock
    private ChildReportScoreService childReportScoreService;

    @Mock
    private ChildReportMapper reportMapper;

    @InjectMocks
    private ChildReportService childReportService;

    private ChildReport childReport;
    private Child child;
    private ChildReportResponse childReportResponse;
    private ChildReportRequest childReportRequest;
    private ChildReportScore childReportScore;

    @BeforeEach
    public void setup() {
        child = new Child();
        child.setId(1L);
        child.setName("Test");
        child.setBirthDate(LocalDate.parse("2020-04-20"));
        child.setSchoolClass("Maternal");
        child.setCondition("Test");

        childReport = new ChildReport();
        childReport.setId(1L);
        childReport.setDate(Instant.parse("2025-03-20T00:00:00Z"));
        childReport.setChild(child);

        childReportRequest = new ChildReportRequest(
                Instant.parse("2025-03-20T00:00:00Z"),
                List.of(new ChildReportScoreRequest(1L, 99))
        );

        childReportResponse = mock(ChildReportResponse.class);
        childReportScore = mock(ChildReportScore.class);
    }

    /**
     * Testes de getChildLast3DaysReports()
     */

    // 1
    @Test
    void shouldCallRepositoryToGetChildLast3DaysReports() {
        when(childReportRepository.findAllByChildIdAndDateAfter(any(), any()))
                .thenReturn(List.of(childReport));
        when(reportMapper.toResponseList(any()))
                .thenReturn(List.of(childReportResponse));

        childReportService.getChildLast3DaysReports(1L);

        verify(childReportRepository, times(1))
                .findAllByChildIdAndDateAfter(anyLong(), any(Instant.class));
    }

    // 2
    @Test
    void shouldRequestReportsFromLast3Days() {
        when(childReportRepository.findAllByChildIdAndDateAfter(anyLong(), any(Instant.class)))
                .thenReturn(List.of(childReport));
        when(reportMapper.toResponseList(any()))
                .thenReturn(List.of(childReportResponse));

        childReportService.getChildLast3DaysReports(1L);

        verify(childReportRepository, times(1))
                .findAllByChildIdAndDateAfter(
                        anyLong(),
                        argThat(date ->
                                date != null &&
                                        date.isBefore(Instant.now()))
                );
    }

    // 3
    @Test
    void shouldReturnChildReportResponseList() {
        when(childReportRepository.findAllByChildIdAndDateAfter(anyLong(), any(Instant.class)))
                .thenReturn(List.of(childReport));
        when(reportMapper.toResponseList(any()))
                .thenReturn(List.of(childReportResponse));

        List<ChildReportResponse> reports = childReportService.getChildLast3DaysReports(1L);

        assertEquals(List.of(childReportResponse), reports);

    }

    // 4
    @Test
    void shouldReturnListEmpty() {
        when(childReportRepository.findAllByChildIdAndDateAfter(anyLong(), any(Instant.class)))
                .thenReturn(List.of());
        when(reportMapper.toResponseList(any()))
                .thenReturn(List.of());

        List<ChildReportResponse> reports = childReportService.getChildLast3DaysReports(1L);

        assertTrue(reports.isEmpty());

    }

    // 5
    @Test
    void shouldCallMapperToGetChildLast3DaysReports() {
        when(childReportRepository.findAllByChildIdAndDateAfter(anyLong(), any(Instant.class)))
                .thenReturn(List.of(childReport));
        when(reportMapper.toResponseList(any()))
                .thenReturn(List.of(childReportResponse));

        childReportService.getChildLast3DaysReports(1L);

        verify(reportMapper, times(1))
                .toResponseList(any());
    }

    /**
     * Testes de getChildScoresAreaAverages()
     */

    // 6
    @Test
    void shouldCallRepositoryToGetChildScoresAreaAverages() {
        when(childReportRepository.findChildScoresAreaAverages(anyLong()))
                .thenReturn(List.of());

        childReportService.getChildScoresAreaAverages(1L);

        verify(childReportRepository, times(1))
                .findChildScoresAreaAverages(anyLong());
    }

    // 7
    @Test
    void shouldReturnListOfChildScoresAveragesByAreaDTO() {
        ChildScoresAveragesByAreaDTO scores = mock(ChildScoresAveragesByAreaDTO.class);

        when(childReportRepository.findChildScoresAreaAverages(anyLong()))
                .thenReturn(List.of(scores));

        List<ChildScoresAveragesByAreaDTO> result = childReportService.getChildScoresAreaAverages(1L);

        verify(childReportRepository, times(1))
                .findChildScoresAreaAverages(anyLong());

        assertEquals(List.of(scores), result);
    }

    /**
     * Testes de saveChildReportByChildId()
     */

    // 8
    @Test
    void shouldCallFindByIdWithCorrectId() {
        when(childRepository.findById(anyLong())).thenReturn(Optional.of(child));
        when(reportMapper.toEntity(any())).thenReturn(childReport);

        childReportService.saveChildReportByChildId(childReportRequest, child.getId());

        verify(childRepository, times(1))
                .findById(child.getId());

    }

    // 9
    @Test
    void shouldAddScoreToChildReport() {
        when(childRepository.findById(anyLong())).thenReturn(Optional.of(child));
        when(reportMapper.toEntity(any())).thenReturn(childReport);
        when(reportMapper.toResponse(any())).thenReturn(childReportResponse);
        when(childReportScoreService.save(any(), any())).thenReturn(childReportScore);
        when(childReportRepository.save(any())).thenReturn(childReport);

        childReportService.saveChildReportByChildId(childReportRequest, 1L);

        assertEquals(1, childReport.getScores().size());
    }

    // 10
    @Test
    void shouldSetChildInChildReport() {
        when(childRepository.findById(anyLong())).thenReturn(Optional.of(child));
        when(reportMapper.toEntity(any())).thenReturn(childReport);

        childReportService.saveChildReportByChildId(childReportRequest, 1L);

        assertEquals(child, childReport.getChild());

    }

    // 11
    @Test
    void shouldSaveChildReportWithoutScores() {
        childReportRequest = new ChildReportRequest(
                Instant.now(),
                List.of()
        );

        when(childRepository.findById(anyLong())).thenReturn(Optional.of(child));
        when(reportMapper.toEntity(any())).thenReturn(childReport);
        when(childReportRepository.save(any())).thenReturn(childReport);

        childReportService.saveChildReportByChildId(childReportRequest, 1L);

        assertTrue(childReport.getScores().isEmpty());
    }

    // 12
    @Test
    void shouldReturnChildReportMappedToResponse() {
        when(childRepository.findById(anyLong())).thenReturn(Optional.of(child));
        when(reportMapper.toEntity(any())).thenReturn(childReport);
        when(childReportRepository.save(any())).thenReturn(childReport);
        when(childReportScoreService.save(any(), any())).thenReturn(childReportScore);
        when(reportMapper.toResponse(any())).thenReturn(childReportResponse);


        ChildReportResponse response = childReportService
                .saveChildReportByChildId(childReportRequest, 1L);

        assertEquals(childReportResponse, response);
    }

    // 13
    @Test
    void shouldThrowResourceNotFoundException() {
        when(childRepository.findById(anyLong())).thenReturn(Optional.empty());

        assertThrows(
                ResourceNotFoundException.class,
                () -> childReportService.saveChildReportByChildId(childReportRequest, 1L)
        );
    }

    // 14
    @Test
    void shouldNotThrowResourceNotFoundException() {
        when(childRepository.findById(anyLong())).thenReturn(Optional.of(child));
        when(reportMapper.toEntity(any())).thenReturn(childReport);
        when(childReportRepository.save(any())).thenReturn(childReport);
        when(childReportScoreService.save(any(), any())).thenReturn(new ChildReportScore());
        when(reportMapper.toResponse(any())).thenReturn(childReportResponse);

        assertDoesNotThrow(() -> childReportService.saveChildReportByChildId(childReportRequest, 1L));
    }

    /**
     * Testes de updateChildReport
     */

    // 15
    @Test
    void shouldThrowResourceNotFoundExceptionWhenFindByIdAndChildIdInvalid() {
        when(childReportRepository.findByIdAndChildId(anyLong(), anyLong()))
                .thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class,
                () -> childReportService.updateChildReport(childReportRequest, 1L, 1L)
        );
    }

    // 16
    @Test
    void shouldBeSameScoresQuantityInChildReport() {
        childReportRequest = new ChildReportRequest(
                Instant.now(),
                List.of(
                        new ChildReportScoreRequest(1L, 99),
                        new ChildReportScoreRequest(1L, 99),
                        new ChildReportScoreRequest(1L, 99)
                )
        );
        when(childReportRepository.findByIdAndChildId(anyLong(), anyLong()))
                .thenReturn(Optional.of(childReport));
        when(childReportScoreService.save(any(), any())).thenReturn(childReportScore);

        childReportService.updateChildReport(childReportRequest, 1L, 1L);

        assertEquals(3, childReport.getScores().size());
    }

    // 17
    @Test
    void shouldReturnListEmptyWhenChildReportRequestScoresIsEmpty() {
        childReportRequest = new ChildReportRequest(
                Instant.now(),
                List.of()
        );

        when(childReportRepository.findByIdAndChildId(anyLong(), anyLong()))
                .thenReturn(Optional.of(childReport));

        childReportService.updateChildReport(childReportRequest, 1L, 1L);

        assertEquals(0, childReport.getScores().size());
    }

    // 18
    @Test
    void shouldUpdateAndReturnChildReportMappedToResponse() {
        childReport.setChild(child);
        when(childReportRepository.findByIdAndChildId(anyLong(), anyLong()))
                .thenReturn(Optional.of(childReport));
        when(childReportScoreService.save(any(), any())).thenReturn(childReportScore);
        when(childReportRepository.save(any())).thenReturn(childReport);
        when(reportMapper.toResponse(any())).thenReturn(childReportResponse);

        ChildReportResponse response = childReportService.updateChildReport(
                childReportRequest, childReport.getId(), child.getId()
        );

        assertEquals(childReportResponse, response);
    }

    // 19
    @Test
    void shouldCallChildReportRepositoryTwoTimes() {
        when(childReportRepository.findByIdAndChildId(anyLong(), anyLong()))
                .thenReturn(Optional.of(childReport));
        when(childReportRepository.save(any())).thenReturn(childReport);

        childReportService.updateChildReport(childReportRequest, 1L, 1L);

        verify(childReportRepository, times(1))
                .findByIdAndChildId(anyLong(), anyLong());
        verify(childReportRepository, times(1)).save(any());
    }

    // 20
    @Test
    void shouldReturnChildReportResponseNotNull() {
        when(childReportRepository.findByIdAndChildId(anyLong(), anyLong()))
                .thenReturn(Optional.of(childReport));
        when(childReportScoreService.save(any(), any())).thenReturn(childReportScore);
        when(childReportRepository.save(any())).thenReturn(childReport);
        when(reportMapper.toResponse(any())).thenReturn(childReportResponse);

        ChildReportResponse response = childReportService
                .updateChildReport(childReportRequest, 1L, 1L);

        assertNotNull(response);
    }


}
