package com.tccds.controller;

import com.tccds.dto.PlanoDTO;
import com.tccds.service.PlanoService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/planos")
public class PlanoController {
    
    @Autowired
    private PlanoService planoService;
    
    @GetMapping
    public ResponseEntity<List<PlanoDTO>> obterTodos() {
        List<PlanoDTO> planos = planoService.obterTodos();
        return ResponseEntity.ok(planos);
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<PlanoDTO> obterPorId(@PathVariable Long id) {
        try {
            PlanoDTO plano = planoService.obterPorId(id);
            return ResponseEntity.ok(plano);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
    
    @GetMapping("/tipo/{tipo}")
    public ResponseEntity<PlanoDTO> obterPorTipo(@PathVariable String tipo) {
        try {
            PlanoDTO plano = planoService.obterPorTipo(tipo);
            return ResponseEntity.ok(plano);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
    
    @PostMapping
    public ResponseEntity<PlanoDTO> criar(@RequestBody Map<String, Object> request) {
        try {
            PlanoDTO plano = planoService.criar(
                (String) request.get("nome"),
                ((Number) request.get("preco")).doubleValue(),
                (String) request.get("descricao"),
                (String) request.get("tipo"),
                request.get("limiteCriancas") != null ? ((Number) request.get("limiteCriancas")).intValue() : null
            );
            return ResponseEntity.status(HttpStatus.CREATED).body(plano);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }
}
