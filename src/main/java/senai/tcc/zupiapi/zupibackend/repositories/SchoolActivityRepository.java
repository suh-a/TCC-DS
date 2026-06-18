package senai.tcc.zupiapi.zupibackend.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import senai.tcc.zupiapi.zupibackend.model.SchoolActivity;

import java.util.List;

public interface SchoolActivityRepository extends JpaRepository<SchoolActivity, Long> {
    List<SchoolActivity> findByTeacherIdOrderByCreatedAtDesc(Long teacherId);
    List<SchoolActivity> findBySchoolClassIdOrderByCreatedAtDesc(Long schoolClassId);
}
