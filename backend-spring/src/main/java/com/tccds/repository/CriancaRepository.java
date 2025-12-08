package com.tccds.repository;

import com.tccds.model.Crianca;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface CriancaRepository extends JpaRepository<Crianca, Long> {
    List<Crianca> findByUsuarioId(Long usuarioId);
}
