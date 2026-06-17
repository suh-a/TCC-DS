package senai.tcc.zupiapi.zupibackend.dto.response;

import senai.tcc.zupiapi.zupibackend.model.enums.UserType;
import senai.tcc.zupiapi.zupibackend.model.enums.PlanType;

public record UserResponse(
        Long id,
        String name,
        String email,
        String cpf,
        String phone,
        String address,
        UserType userType,
        PlanType planType,
        boolean active,
        boolean twoFactorEnabled,
        String profilePhotoUrl
) {
}
