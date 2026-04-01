package senai.tcc.zupiapi.zupibackend.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import senai.tcc.zupiapi.zupibackend.model.Child;

import java.util.List;

public interface ChildRepository extends JpaRepository<Child, Long> {
    List<Child> findByResponsibleId(Long responsible_id);
}
