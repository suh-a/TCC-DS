package com.tccds.controller;

import com.tccds.dto.RelatorioDTO;
import com.tccds.service.RelatorioService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/relatorios")
public class RelatorioController {
    
    @Autowired
    private RelatorioService relatorioService;
    
    @PostMapping
    public ResponseEntity<RelatorioDTO> registrarJogo(@RequestBody Map<String, Object> request) {
        try {
            RelatorioDTO relatorio = relatorioService.registrarJogo(
                ((Number) request.get("criancaId")).longValue(),
                ((Number) request.get("usuarioId")).longValue(),
                ((Number) request.get("tempoJogado")).intValue(),
                ((Number) request.get("acertos")).intValue(),
                ((Number) request.get("erros")).intValue(),
                ((Number) request.get("pontuacao")).intValue(),
                (String) request.get("tipoJogo")
            );
            return ResponseEntity.status(HttpStatus.CREATED).body(relatorio);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<RelatorioDTO> obterPorId(@PathVariable Long id) {
        try {
            RelatorioDTO relatorio = relatorioService.obterPorId(id);
            return ResponseEntity.ok(relatorio);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
    
    @GetMapping("/crianca/{criancaId}")
    public ResponseEntity<List<RelatorioDTO>> obterPorCrianca(@PathVariable Long criancaId) {
        List<RelatorioDTO> relatorios = relatorioService.obterPorCrianca(criancaId);
        return ResponseEntity.ok(relatorios);
    }
    
    @GetMapping("/usuario/{usuarioId}")
    public ResponseEntity<List<RelatorioDTO>> obterPorUsuario(@PathVariable Long usuarioId) {
        List<RelatorioDTO> relatorios = relatorioService.obterPorUsuario(usuarioId);
        return ResponseEntity.ok(relatorios);
    }
}
