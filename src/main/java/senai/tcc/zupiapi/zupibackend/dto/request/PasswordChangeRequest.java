package senai.tcc.zupiapi.zupibackend.dto.request;

import jakarta.validation.constraints.NotBlank;

public record PasswordChangeRequest(
        @NotBlank String token,
        @NotBlank String newPassword
) {
}
