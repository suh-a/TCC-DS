package senai.tcc.zupiapi.zupibackend.dto;

import senai.tcc.zupiapi.zupibackend.model.User;
import senai.tcc.zupiapi.zupibackend.model.enums.PlanType;

public record LoginDTO(
        String email,
        String password,
        PlanType planType
) {
    public LoginDTO(User user) {
       this(
               user.getEmail(),
               user.getPassword(),
               null);
    }
}
