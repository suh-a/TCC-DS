package com.tccds.service;

import com.tccds.dto.PlanoDTO;
import com.tccds.model.Plano;
import com.tccds.repository.PlanoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class PlanoService {
    
    @Autowired
    private PlanoRepository planoRepository;
    
    public List<PlanoDTO> obterTodos() {
        return planoRepository.findAll()
            .stream()
            .map(this::convertToDTO)
            .collect(Collectors.toList());
    }
    
    public PlanoDTO obterPorId(Long id) {
        Plano plano = planoRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Plano não encontrado"));
        return convertToDTO(plano);
    }
    
    public PlanoDTO obterPorTipo(String tipo) {
        Plano plano = planoRepository.findByTipo(tipo)
            .orElseThrow(() -> new RuntimeException("Plano não encontrado"));
        return convertToDTO(plano);
    }
    
    public PlanoDTO criar(String nome, Double preco, String descricao, String tipo, Integer limiteCriancas) {
        Plano plano = new Plano();
        plano.setNome(nome);
        plano.setPreco(preco);
        plano.setDescricao(descricao);
        plano.setTipo(tipo);
        plano.setLimiteCriancas(limiteCriancas);
        
        Plano saved = planoRepository.save(plano);
        return convertToDTO(saved);
    }
    
    private PlanoDTO convertToDTO(Plano plano) {
        return new PlanoDTO(
            plano.getId(),
            plano.getNome(),
            plano.getPreco(),
            plano.getDescricao(),
            plano.getTipo(),
            plano.getLimiteCriancas()
        );
    }
}
