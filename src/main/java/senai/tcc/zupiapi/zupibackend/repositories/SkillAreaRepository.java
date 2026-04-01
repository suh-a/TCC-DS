package senai.tcc.zupiapi.zupibackend.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import senai.tcc.zupiapi.zupibackend.model.SkillArea;

public interface SkillAreaRepository extends JpaRepository<SkillArea, Long> {
    SkillArea findByName(String name);
}
