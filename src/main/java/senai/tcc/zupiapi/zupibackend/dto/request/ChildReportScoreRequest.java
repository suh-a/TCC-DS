package senai.tcc.zupiapi.zupibackend.dto.request;

import senai.tcc.zupiapi.zupibackend.model.SkillArea;

public record ChildReportScoreRequest(
        Long themeId,
        Integer score
) {
}
