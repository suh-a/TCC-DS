package senai.tcc.zupiapi.zupibackend.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import senai.tcc.zupiapi.zupibackend.model.GameSession;

import java.time.LocalDateTime;
import java.util.List;

public interface GameSessionRepository extends JpaRepository<GameSession, Long> {

    List<GameSession> findByChildIdOrderByPlayedAtDesc(Long childId);

    List<GameSession> findByChildIdAndPlayedAtAfter(Long childId, LocalDateTime after);
}
