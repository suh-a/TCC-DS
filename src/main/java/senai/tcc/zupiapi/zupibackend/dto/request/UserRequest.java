package senai.tcc.zupiapi.zupibackend.dto.request;

import senai.tcc.zupiapi.zupibackend.model.enums.PlanType;
import senai.tcc.zupiapi.zupibackend.model.enums.UserType;

import java.time.LocalDate;

public record UserRequest(
        String name,
        String email,
        String password,
        String cpf,
        String cnpj,
        LocalDate birthDate,
        String phone,
        AddressRequest address,
        UserType userType,
        PlanType planType,
        String googleToken
) {
}