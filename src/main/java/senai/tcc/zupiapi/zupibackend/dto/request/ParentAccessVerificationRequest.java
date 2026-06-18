package senai.tcc.zupiapi.zupibackend.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record ParentAccessVerificationRequest(
        @NotNull Long childId,
        @NotBlank String password
) {
}
