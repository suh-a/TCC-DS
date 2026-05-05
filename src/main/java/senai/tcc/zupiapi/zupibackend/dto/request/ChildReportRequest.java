package senai.tcc.zupiapi.zupibackend.dto.request;

import com.fasterxml.jackson.annotation.JsonFormat;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;

import java.time.Instant;
import java.util.List;

public record ChildReportRequest(
        @NotBlank(message = "A data do relatório é obrigatória")
        @JsonFormat(pattern = "yyyy-MM-dd")
        Instant date,
        @Valid
        List<ChildReportScoreRequest> scores
) {
}
