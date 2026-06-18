package senai.tcc.zupiapi.zupibackend.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import senai.tcc.zupiapi.zupibackend.model.WeeklyQuiz;
import senai.tcc.zupiapi.zupibackend.model.enums.PlanType;
import java.util.List;

public interface WeeklyQuizRepository extends JpaRepository<WeeklyQuiz, Long> {
    boolean existsBySlug(String slug);
    List<WeeklyQuiz> findAllByPlanTypeOrderById(PlanType planType);
}
