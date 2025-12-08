package com.tccds.repository;

import com.tccds.model.Relatorio;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface RelatorioRepository extends JpaRepository<Relatorio, Long> {
    List<Relatorio> findByCriancaId(Long criancaId);
    List<Relatorio> findByUsuarioId(Long usuarioId);
}
