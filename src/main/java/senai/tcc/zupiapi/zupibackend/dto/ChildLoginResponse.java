package senai.tcc.zupiapi.zupibackend.dto;

import senai.tcc.zupiapi.zupibackend.dto.response.ChildResponse;
import senai.tcc.zupiapi.zupibackend.model.enums.PlanType;
import senai.tcc.zupiapi.zupibackend.model.enums.UserType;

public record ChildLoginResponse(
        String token,
        ChildResponse child,
        UserType userType,
        PlanType planType
) {
}
