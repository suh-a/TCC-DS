package senai.tcc.zupiapi.zupibackend.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record ParentLoginRequest(
        @NotNull Long childId,
        @NotBlank @Email String email,
        @NotBlank String password
) {
}
