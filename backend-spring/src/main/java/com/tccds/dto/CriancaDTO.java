package com.tccds.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CriancaDTO {
    private Long id;
    private String nome;
    private Integer idade;
    private String fotoUrl;
    private String dataNascimento;
}
