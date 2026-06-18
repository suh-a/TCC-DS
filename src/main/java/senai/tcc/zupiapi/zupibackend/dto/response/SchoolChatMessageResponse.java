package senai.tcc.zupiapi.zupibackend.dto.response;

import java.time.LocalDateTime;

public record SchoolChatMessageResponse(
        Long id,
        String senderType,
        String senderName,
        String message,
        LocalDateTime createdAt
) {
}
