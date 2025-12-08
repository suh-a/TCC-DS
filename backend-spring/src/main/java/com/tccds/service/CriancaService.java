package com.tccds.service;

import com.tccds.dto.CriancaDTO;
import com.tccds.model.Crianca;
import com.tccds.model.Usuario;
import com.tccds.repository.CriancaRepository;
import com.tccds.repository.UsuarioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class CriancaService {
    
    @Autowired
    private CriancaRepository criancaRepository;
    
    @Autowired
    private UsuarioRepository usuarioRepository;
    
    public CriancaDTO criar(Long usuarioId, String nome, Integer idade, String dataNascimento) {
        Usuario usuario = usuarioRepository.findById(usuarioId)
            .orElseThrow(() -> new RuntimeException("Usuário não encontrado"));
        
        Crianca crianca = new Crianca();
        crianca.setUsuario(usuario);
        crianca.setNome(nome);
        crianca.setIdade(idade);
        crianca.setDataNascimento(dataNascimento);
        
        Crianca saved = criancaRepository.save(crianca);
        return convertToDTO(saved);
    }
    
    public CriancaDTO obterPorId(Long id) {
        Crianca crianca = criancaRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Criança não encontrada"));
        return convertToDTO(crianca);
    }
    
    public List<CriancaDTO> obterPorUsuario(Long usuarioId) {
        return criancaRepository.findByUsuarioId(usuarioId)
            .stream()
            .map(this::convertToDTO)
            .collect(Collectors.toList());
    }
    
    public CriancaDTO atualizar(Long id, String nome, Integer idade, String dataNascimento) {
        Crianca crianca = criancaRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Criança não encontrada"));
        
        if (nome != null) crianca.setNome(nome);
        if (idade != null) crianca.setIdade(idade);
        if (dataNascimento != null) crianca.setDataNascimento(dataNascimento);
        
        Crianca updated = criancaRepository.save(crianca);
        return convertToDTO(updated);
    }
    
    public void deletar(Long id) {
        criancaRepository.deleteById(id);
    }
    
    private CriancaDTO convertToDTO(Crianca crianca) {
        return new CriancaDTO(
            crianca.getId(),
            crianca.getNome(),
            crianca.getIdade(),
            crianca.getFotoUrl(),
            crianca.getDataNascimento()
        );
    }
}
