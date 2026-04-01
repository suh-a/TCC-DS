package senai.tcc.zupiapi.zupibackend.dto.response;

import senai.tcc.zupiapi.zupibackend.model.SkillArea;

public record ChildReportScoreResponse(
        Long id,
        SkillArea theme,
        Integer score
) {
}
