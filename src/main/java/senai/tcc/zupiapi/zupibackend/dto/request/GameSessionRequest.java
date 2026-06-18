package senai.tcc.zupiapi.zupibackend.dto.request;

public record GameSessionRequest(
        String sessionId,
        String gameId,
        String gameName,
        String skillArea,
        Integer score,
        Integer maxScore,
        Integer durationSeconds,
        Integer errors,
        Long skillAreaId
) {
}
