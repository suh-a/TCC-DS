package senai.tcc.zupiapi.zupibackend.dto.request;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

public record ChildReportScoreRequest(
        @NotNull(message = "Insira um tema")
        Long themeId,
        @NotNull(message = "Insira um score")
        @Positive(message = "O escore deve ser maior que zero")
        Integer score
) {
}
