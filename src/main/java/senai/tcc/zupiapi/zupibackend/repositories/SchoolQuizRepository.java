package senai.tcc.zupiapi.zupibackend.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import senai.tcc.zupiapi.zupibackend.model.SchoolQuiz;

import java.util.List;

public interface SchoolQuizRepository extends JpaRepository<SchoolQuiz, Long> {
    List<SchoolQuiz> findByTeacherIdOrderByCreatedAtDesc(Long teacherId);
    List<SchoolQuiz> findBySchoolClassIdOrderByCreatedAtDesc(Long schoolClassId);
}
