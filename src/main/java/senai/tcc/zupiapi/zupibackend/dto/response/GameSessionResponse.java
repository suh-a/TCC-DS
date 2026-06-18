package senai.tcc.zupiapi.zupibackend.dto.response;

import java.time.LocalDateTime;

public record GameSessionResponse(
        Long id,
        String sessionId,
        Long childId,
        String gameId,
        String gameName,
        String skillArea,
        Long skillAreaId,
        Integer score,
        Integer maxScore,
        Integer durationSeconds,
        Integer errors,
        Integer percentage,
        LocalDateTime completedAt
) {
}
