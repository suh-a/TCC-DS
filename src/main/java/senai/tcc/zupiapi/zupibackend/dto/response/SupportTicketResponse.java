package senai.tcc.zupiapi.zupibackend.dto.response;

import java.time.LocalDateTime;

public record SupportTicketResponse(
        Long id,
        String requesterName,
        String requesterEmail,
        String userType,
        String subject,
        String message,
        String status,
        LocalDateTime createdAt
) {
}
