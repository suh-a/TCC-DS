package senai.tcc.zupiapi.zupibackend.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import senai.tcc.zupiapi.zupibackend.model.Teacher;

import java.util.List;
import java.util.Optional;

public interface TeacherRepository extends JpaRepository<Teacher, Long> {
    List<Teacher> findBySchoolId(Long schoolId);
    Optional<Teacher> findByIdAndSchoolId(Long id, Long schoolId);
    Optional<Teacher> findByAccountId(Long accountId);
}
