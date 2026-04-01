package senai.tcc.zupiapi.zupibackend.services;


import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import senai.tcc.zupiapi.zupibackend.dto.mapper.ChildReportMapper;
import senai.tcc.zupiapi.zupibackend.dto.response.ChildReportResponse;
import senai.tcc.zupiapi.zupibackend.dto.request.ChildReportRequest;
import senai.tcc.zupiapi.zupibackend.dto.ChildScoresAvaregesByAreaDTO;
import senai.tcc.zupiapi.zupibackend.exceptions.ResourceNotFoundException;
import senai.tcc.zupiapi.zupibackend.model.Child;
import senai.tcc.zupiapi.zupibackend.model.ChildReport;
import senai.tcc.zupiapi.zupibackend.model.ChildReportScore;
import senai.tcc.zupiapi.zupibackend.repositories.ChildReportRepository;
import senai.tcc.zupiapi.zupibackend.repositories.ChildRepository;

import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.List;

@Service
public class ChildReportService {

    @Autowired
    private ChildReportRepository childReportRepository;

    @Autowired
    private ChildRepository childRepository;

    @Autowired
    private ChildReportScoreService childReportScoreService;

    @Autowired
    private ChildReportMapper reportMapper;

    public List<ChildReportResponse> getChildLast3DaysReports(Long childId) {
        Instant daysBefore3 = LocalDate.now()
                .minusDays(3)
                .atStartOfDay(ZoneId.systemDefault())
                .toInstant();

        return reportMapper.toResponseList(
                childReportRepository.findAllByChildIdAndDateAfter(childId, daysBefore3));

    }

    public List<ChildScoresAvaregesByAreaDTO> getChildScoresAreaAvareges(Long id) {
        return childReportRepository.findChildScoresAreaAvareges(id);
    }

    public ChildReportResponse saveChildReportByChildId(ChildReportRequest childReport, Long childId) {

        Child child = childRepository.findById(childId)
                .orElseThrow(()-> new RuntimeException("Child Not Found"));

        ChildReport report = reportMapper.toEntity(childReport);

        report.setChild(child);

        childReportRepository.save(report);

        childReport.scores().forEach(
                scoresRequest -> {
                    ChildReportScore score = childReportScoreService.save(scoresRequest, report);
                    report.getScores().add(score);
                }
        );

        return reportMapper.toResponse(report);
    }

    public ChildReportResponse updateChildReport(ChildReportRequest reportScores,Long reportId ,Long childId) {

        ChildReport report = childReportRepository.findByIdAndChildId(reportId,childId)
                .orElseThrow(()-> new ResourceNotFoundException("ChildReport Not Found"));

        reportScores.scores().forEach(
                childReportScoreDTO -> {
                    ChildReportScore score = childReportScoreService.save(childReportScoreDTO, report);
                    report.getScores().add(score);
                }
        );

        return reportMapper.toResponse(report);
    }
}
