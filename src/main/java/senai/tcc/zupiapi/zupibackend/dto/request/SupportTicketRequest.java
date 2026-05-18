package senai.tcc.zupiapi.zupibackend.dto.request;

public record SupportTicketRequest(
        String requesterName,
        String requesterEmail,
        String userType,
        String subject,
        String message
) {
}
