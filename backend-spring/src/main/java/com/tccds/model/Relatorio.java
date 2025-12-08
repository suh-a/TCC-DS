package com.tccds.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "relatorios")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Relatorio {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne
    @JoinColumn(name = "crianca_id", nullable = false)
    private Crianca crianca;
    
    @ManyToOne
    @JoinColumn(name = "usuario_id", nullable = false)
    private Usuario usuario;
    
    @Column(name = "tempo_jogado")
    private Integer tempoJogado; // em minutos
    
    @Column(name = "acertos")
    private Integer acertos;
    
    @Column(name = "erros")
    private Integer erros;
    
    @Column(name = "pontuacao")
    private Integer pontuacao;
    
    @Column(name = "tipo_jogo")
    private String tipoJogo;
    
    @Column(name = "data_jogo")
    private LocalDateTime dataJogo;
    
    @PrePersist
    protected void onCreate() {
        dataJogo = LocalDateTime.now();
    }
}
