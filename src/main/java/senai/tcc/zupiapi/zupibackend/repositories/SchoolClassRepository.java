package senai.tcc.zupiapi.zupibackend.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import senai.tcc.zupiapi.zupibackend.model.SchoolClass;

import java.util.List;

public interface SchoolClassRepository extends JpaRepository<SchoolClass, Long> {
    List<SchoolClass> findBySchoolId(Long schoolId);
    List<SchoolClass> findByTeacherId(Long teacherId);
    java.util.Optional<SchoolClass> findByIdAndSchoolId(Long id, Long schoolId);
}
