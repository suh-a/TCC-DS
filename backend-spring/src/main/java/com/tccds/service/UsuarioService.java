package com.tccds.service;

import com.tccds.dto.UsuarioDTO;
import com.tccds.model.Usuario;
import com.tccds.repository.UsuarioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class UsuarioService {
    
    @Autowired
    private UsuarioRepository usuarioRepository;
    
    public UsuarioDTO registrar(String email, String senha, String nome, String tipoPlano) {
        if (usuarioRepository.existsByEmail(email)) {
            throw new RuntimeException("Email já cadastrado");
        }
        
        Usuario usuario = new Usuario();
        usuario.setEmail(email);
        usuario.setSenha(senha); // Em produção, usar BCrypt para hash
        usuario.setNome(nome);
        usuario.setTipoPlano(tipoPlano);
        
        Usuario saved = usuarioRepository.save(usuario);
        return convertToDTO(saved);
    }
    
    public UsuarioDTO login(String email, String senha) {
        Optional<Usuario> usuario = usuarioRepository.findByEmail(email);
        
        if (usuario.isEmpty()) {
            throw new RuntimeException("Usuário não encontrado");
        }
        
        if (!usuario.get().getSenha().equals(senha)) { // Em produção, usar BCrypt
            throw new RuntimeException("Senha incorreta");
        }
        
        return convertToDTO(usuario.get());
    }
    
    public UsuarioDTO obterPorId(Long id) {
        Usuario usuario = usuarioRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Usuário não encontrado"));
        return convertToDTO(usuario);
    }
    
    public List<UsuarioDTO> obterTodos() {
        return usuarioRepository.findAll()
            .stream()
            .map(this::convertToDTO)
            .collect(Collectors.toList());
    }
    
    public UsuarioDTO atualizar(Long id, String nome, String tipoPlano) {
        Usuario usuario = usuarioRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Usuário não encontrado"));
        
        if (nome != null) usuario.setNome(nome);
        if (tipoPlano != null) usuario.setTipoPlano(tipoPlano);
        
        Usuario updated = usuarioRepository.save(usuario);
        return convertToDTO(updated);
    }
    
    public void deletar(Long id) {
        usuarioRepository.deleteById(id);
    }
    
    private UsuarioDTO convertToDTO(Usuario usuario) {
        return new UsuarioDTO(
            usuario.getId(),
            usuario.getEmail(),
            usuario.getNome(),
            usuario.getTipoPlano()
        );
    }
}
