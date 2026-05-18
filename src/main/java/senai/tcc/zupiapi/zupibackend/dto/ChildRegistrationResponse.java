package senai.tcc.zupiapi.zupibackend.dto;

import senai.tcc.zupiapi.zupibackend.dto.response.ChildResponse;

public record ChildRegistrationResponse(
        ChildResponse child,
        String generatedPassword
) {
}
