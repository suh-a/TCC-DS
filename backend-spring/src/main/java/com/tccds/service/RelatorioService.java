package com.tccds.service;

import com.tccds.dto.RelatorioDTO;
import com.tccds.model.Crianca;
import com.tccds.model.Relatorio;
import com.tccds.model.Usuario;
import com.tccds.repository.CriancaRepository;
import com.tccds.repository.RelatorioRepository;
import com.tccds.repository.UsuarioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class RelatorioService {
    
    @Autowired
    private RelatorioRepository relatorioRepository;
    
    @Autowired
    private CriancaRepository criancaRepository;
    
    @Autowired
    private UsuarioRepository usuarioRepository;
    
    public RelatorioDTO registrarJogo(Long criancaId, Long usuarioId, Integer tempoJogado,
                                     Integer acertos, Integer erros, Integer pontuacao, String tipoJogo) {
        Crianca crianca = criancaRepository.findById(criancaId)
            .orElseThrow(() -> new RuntimeException("Criança não encontrada"));
        Usuario usuario = usuarioRepository.findById(usuarioId)
            .orElseThrow(() -> new RuntimeException("Usuário não encontrado"));
        
        Relatorio relatorio = new Relatorio();
        relatorio.setCrianca(crianca);
        relatorio.setUsuario(usuario);
        relatorio.setTempoJogado(tempoJogado);
        relatorio.setAcertos(acertos);
        relatorio.setErros(erros);
        relatorio.setPontuacao(pontuacao);
        relatorio.setTipoJogo(tipoJogo);
        
        Relatorio saved = relatorioRepository.save(relatorio);
        return convertToDTO(saved);
    }
    
    public List<RelatorioDTO> obterPorCrianca(Long criancaId) {
        return relatorioRepository.findByCriancaId(criancaId)
            .stream()
            .map(this::convertToDTO)
            .collect(Collectors.toList());
    }
    
    public List<RelatorioDTO> obterPorUsuario(Long usuarioId) {
        return relatorioRepository.findByUsuarioId(usuarioId)
            .stream()
            .map(this::convertToDTO)
            .collect(Collectors.toList());
    }
    
    public RelatorioDTO obterPorId(Long id) {
        Relatorio relatorio = relatorioRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Relatório não encontrado"));
        return convertToDTO(relatorio);
    }
    
    private RelatorioDTO convertToDTO(Relatorio relatorio) {
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");
        return new RelatorioDTO(
            relatorio.getId(),
            relatorio.getCrianca().getId(),
            relatorio.getUsuario().getId(),
            relatorio.getTempoJogado(),
            relatorio.getAcertos(),
            relatorio.getErros(),
            relatorio.getPontuacao(),
            relatorio.getTipoJogo(),
            relatorio.getDataJogo().format(formatter)
        );
    }
}
