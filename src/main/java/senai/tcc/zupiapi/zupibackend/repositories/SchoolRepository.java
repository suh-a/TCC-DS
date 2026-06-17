package senai.tcc.zupiapi.zupibackend.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import senai.tcc.zupiapi.zupibackend.model.School;

import java.util.Optional;
import java.util.List;

public interface SchoolRepository extends JpaRepository<School, Long> {

    Optional<School> findByCnpj(String cnpj);

    Optional<School> findByAccountId(Long accountId);

    List<School> findByNameIgnoreCase(String name);

    boolean existsByCnpj(String cnpj);
}
