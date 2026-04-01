package senai.tcc.zupiapi.zupibackend.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import senai.tcc.zupiapi.zupibackend.dto.ChildScoresAvaregesByAreaDTO;
import senai.tcc.zupiapi.zupibackend.model.ChildReport;

import java.time.Instant;
import java.util.List;
import java.util.Optional;

public interface ChildReportRepository extends JpaRepository<ChildReport, Long> {
    List<ChildReport>  findAllByChildIdAndDateAfter(Long child_id, Instant date);

    @Query("""
        SELECT new senai.tcc.zupiapi.zupibackend.dto.ChildScoresAvaregesByAreaDTO(
            s.skillArea,
            AVG(s.score)
        )
        FROM ChildReportScore s
        JOIN s.childReport r
        WHERE r.child.id = :childId
        GROUP BY s.skillArea
    """)
    List<ChildScoresAvaregesByAreaDTO> findChildScoresAreaAvareges(Long childId);

    Optional<ChildReport> findByIdAndChildId(Long id, Long childId);
}
