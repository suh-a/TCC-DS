package senai.tcc.zupiapi.zupibackend.dto.response;

import senai.tcc.zupiapi.zupibackend.dto.request.ChildReportScoreRequest;
import senai.tcc.zupiapi.zupibackend.model.ChildReport;

import java.time.Instant;
import java.util.List;

public record ChildReportResponse(
        Long id,
        Instant date,
        List<ChildReportScoreRequest> scores
) {
}
