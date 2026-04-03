package senai.tcc.zupiapi.zupibackend.services;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import senai.tcc.zupiapi.zupibackend.dto.mapper.ChildReportMapper;
import senai.tcc.zupiapi.zupibackend.dto.response.ChildReportResponse;
import senai.tcc.zupiapi.zupibackend.model.Child;
import senai.tcc.zupiapi.zupibackend.model.ChildReport;
import senai.tcc.zupiapi.zupibackend.repositories.ChildReportRepository;
import senai.tcc.zupiapi.zupibackend.repositories.ChildRepository;

import java.time.Instant;
import java.time.LocalDate;

import static org.mockito.Mockito.mock;

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

        childReportResponse = mock(ChildReportResponse.class);
    }
}
