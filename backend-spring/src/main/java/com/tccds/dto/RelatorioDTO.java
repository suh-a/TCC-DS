package com.tccds.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class RelatorioDTO {
    private Long id;
    private Long criancaId;
    private Long usuarioId;
    private Integer tempoJogado;
    private Integer acertos;
    private Integer erros;
    private Integer pontuacao;
    private String tipoJogo;
    private String dataJogo;
}
