package senai.tcc.zupiapi.zupibackend.dto.request;

import java.util.List;

public record ChildReportRequest(
        List<ChildReportScoreRequest> scores
) {
}
