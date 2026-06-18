package senai.tcc.zupiapi.zupibackend.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import senai.tcc.zupiapi.zupibackend.model.SchoolResponsible;
import senai.tcc.zupiapi.zupibackend.model.User;

import java.util.List;

public interface SchoolResponsibleRepository extends JpaRepository<SchoolResponsible, Long> {

    @Query("""
        SELECT sr.responsible
        FROM SchoolResponsible sr
        WHERE sr.school.id = :schoolId
        ORDER BY LOWER(sr.responsible.name)
    """)
    List<User> findResponsibleUsersBySchoolId(@Param("schoolId") Long schoolId);

    @Query("""
        SELECT CASE WHEN COUNT(sr) > 0 THEN true ELSE false END
        FROM SchoolResponsible sr
        WHERE sr.school.id = :schoolId
          AND sr.responsible.id = :responsibleId
    """)
    boolean existsBySchoolIdAndResponsibleId(
            @Param("schoolId") Long schoolId,
            @Param("responsibleId") Long responsibleId
    );
}
