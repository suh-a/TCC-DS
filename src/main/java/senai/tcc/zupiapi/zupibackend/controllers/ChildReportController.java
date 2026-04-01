package senai.tcc.zupiapi.zupibackend.controllers;


import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.parameters.P;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;
import senai.tcc.zupiapi.zupibackend.dto.response.ChildReportResponse;
import senai.tcc.zupiapi.zupibackend.dto.request.ChildReportRequest;
import senai.tcc.zupiapi.zupibackend.dto.ChildScoresAvaregesByAreaDTO;
import senai.tcc.zupiapi.zupibackend.services.ChildReportService;

import java.net.URI;
import java.util.List;

@RestController
@CrossOrigin("*")
@RequestMapping(value = "/child/{childId}/reports")
public class ChildReportController {

    @Autowired
    private ChildReportService childReportService;

    @GetMapping(value = "/lasted")
    public ResponseEntity<List<ChildReportResponse>> getLast3daysReports(
            @PathVariable Long childId
    ) {
        return ResponseEntity.ok().body(childReportService.getChildLast3DaysReports(childId));
    }

    @GetMapping(value = "/avg")
    public ResponseEntity<List<ChildScoresAvaregesByAreaDTO>> getAllAverage(
            @PathVariable Long childId
    ) {

        return ResponseEntity.ok().body(childReportService.getChildScoresAreaAvareges(childId));
    }

    @PostMapping()
    public ResponseEntity<ChildReportResponse> saveChildReport(
            @RequestBody ChildReportRequest childReport,
            @PathVariable Long childId
    ) {
        ChildReportResponse savedChildReport = childReportService
                .saveChildReportByChildId(childReport, childId);

        URI uri = ServletUriComponentsBuilder
                .fromCurrentRequest().path("/{id}")
                .buildAndExpand(savedChildReport.id())
                .toUri();

        return ResponseEntity.created(uri).body(savedChildReport);
    }

    @PutMapping(value = "/{id}")
    public ResponseEntity<ChildReportResponse> updateChildReport(
            @RequestBody ChildReportRequest childReport,
            @PathVariable Long childId,
            @PathVariable Long id
    ) {
        ChildReportResponse savedChildReport = childReportService
                .updateChildReport(childReport,id,childId);

        return ResponseEntity.ok().body(savedChildReport);
    }
}
