package senai.tcc.zupiapi.zupibackend.dto.response;

import senai.tcc.zupiapi.zupibackend.model.enums.UserType;

public record UserResponse(
        Long id,
        String name,
        String email,
        String cpf,
        UserType userType,
        boolean twoFactorEnabled,
        String profilePhotoUrl
) {
}
