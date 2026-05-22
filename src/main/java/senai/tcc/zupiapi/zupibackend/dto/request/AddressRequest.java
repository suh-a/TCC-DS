package senai.tcc.zupiapi.zupibackend.dto.request;

public record AddressRequest(
        String cep,
        String street,
        String number,
        String neighborhood,
        String state,
        String country
) {}