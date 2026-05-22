package senai.tcc.zupiapi.zupibackend.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import senai.tcc.zupiapi.zupibackend.model.School;

import java.util.Optional;

public interface SchoolRepository extends JpaRepository<School, Long> {

    Optional<School> findByCnpj(String cnpj);

    Optional<School> findByAccountId(Long accountId);

    boolean existsByCnpj(String cnpj);
}
