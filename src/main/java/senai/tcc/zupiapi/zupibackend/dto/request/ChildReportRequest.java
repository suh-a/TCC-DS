package senai.tcc.zupiapi.zupibackend.dto.request;

import senai.tcc.zupiapi.zupibackend.model.ChildReport;

import java.time.Instant;
import java.util.List;

public record ChildReportRequest(
        Instant date,
        List<ChildReportScoreRequest> scores
) {
}
