package senai.tcc.zupiapi.zupibackend.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import senai.tcc.zupiapi.zupibackend.model.SkillArea;
import senai.tcc.zupiapi.zupibackend.model.enums.PlanType;
import java.util.List;

public interface SkillAreaRepository extends JpaRepository<SkillArea, Long> {
    SkillArea findByName(String name);
    List<SkillArea> findAllByPlanTypeOrderByName(PlanType planType);
    List<SkillArea> findAllByPlanTypeIsNullOrderByName();
}
