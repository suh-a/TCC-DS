package senai.tcc.zupiapi.zupibackend.dto.request;

import jakarta.validation.constraints.NotBlank;

public record AccountPasswordRequest(
        @NotBlank String currentPassword,
        @NotBlank String newPassword
) {
}
