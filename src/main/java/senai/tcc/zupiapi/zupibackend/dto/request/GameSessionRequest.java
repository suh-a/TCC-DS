package senai.tcc.zupiapi.zupibackend.dto.request;

public record GameSessionRequest(
        String gameId,
        Integer score,
        Integer maxScore,
        Integer durationSeconds,
        Long skillAreaId
) {
}
