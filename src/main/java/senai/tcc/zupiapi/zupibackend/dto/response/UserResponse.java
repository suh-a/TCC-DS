package senai.tcc.zupiapi.zupibackend.dto.response;

import senai.tcc.zupiapi.zupibackend.model.enums.UserType;

public record UserResponse(
        Long id,
        String name,
        String email,
        String cpf,
        String phone,
        String address,
        UserType userType,
        boolean active,
        boolean twoFactorEnabled,
        String profilePhotoUrl
) {
}
