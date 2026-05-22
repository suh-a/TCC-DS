package senai.tcc.zupiapi.zupibackend.dto.request;

import java.time.LocalDate;

public record ResponsibleRegisterRequest(
        String name,
        String email,
        String password,
        String cpf,
        LocalDate birthDate,
        String phone
) {
}
