package com.tccds.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PlanoDTO {
    private Long id;
    private String nome;
    private Double preco;
    private String descricao;
    private String tipo;
    private Integer limiteCriancas;
}
