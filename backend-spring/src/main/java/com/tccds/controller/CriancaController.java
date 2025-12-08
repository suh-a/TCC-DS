package com.tccds.controller;

import com.tccds.dto.CriancaDTO;
import com.tccds.service.CriancaService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/criancas")
public class CriancaController {
    
    @Autowired
    private CriancaService criancaService;
    
    @PostMapping
    public ResponseEntity<CriancaDTO> criar(@RequestBody Map<String, Object> request) {
        try {
            CriancaDTO crianca = criancaService.criar(
                ((Number) request.get("usuarioId")).longValue(),
                (String) request.get("nome"),
                ((Number) request.get("idade")).intValue(),
                (String) request.get("dataNascimento")
            );
            return ResponseEntity.status(HttpStatus.CREATED).body(crianca);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<CriancaDTO> obterPorId(@PathVariable Long id) {
        try {
            CriancaDTO crianca = criancaService.obterPorId(id);
            return ResponseEntity.ok(crianca);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
    
    @GetMapping("/usuario/{usuarioId}")
    public ResponseEntity<List<CriancaDTO>> obterPorUsuario(@PathVariable Long usuarioId) {
        List<CriancaDTO> criancas = criancaService.obterPorUsuario(usuarioId);
        return ResponseEntity.ok(criancas);
    }
    
    @PutMapping("/{id}")
    public ResponseEntity<CriancaDTO> atualizar(@PathVariable Long id, @RequestBody Map<String, Object> request) {
        try {
            CriancaDTO crianca = criancaService.atualizar(
                id,
                (String) request.get("nome"),
                request.get("idade") != null ? ((Number) request.get("idade")).intValue() : null,
                (String) request.get("dataNascimento")
            );
            return ResponseEntity.ok(crianca);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletar(@PathVariable Long id) {
        try {
            criancaService.deletar(id);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
}
