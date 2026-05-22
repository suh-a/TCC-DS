package senai.tcc.zupiapi.zupibackend.services;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import senai.tcc.zupiapi.zupibackend.dto.request.GameSessionRequest;
import senai.tcc.zupiapi.zupibackend.exceptions.ResourceNotFoundException;
import senai.tcc.zupiapi.zupibackend.model.Child;
import senai.tcc.zupiapi.zupibackend.model.GameSession;
import senai.tcc.zupiapi.zupibackend.model.SkillArea;
import senai.tcc.zupiapi.zupibackend.repositories.ChildRepository;
import senai.tcc.zupiapi.zupibackend.repositories.GameSessionRepository;
import senai.tcc.zupiapi.zupibackend.repositories.SkillAreaRepository;
import senai.tcc.zupiapi.zupibackend.security.services.AccessControlService;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Service
public class GameSessionService {

    private static final Map<String, Long> GAME_SKILL_MAP = Map.of(
            "jogoMemoria", 1L,
            "jogoMath", 2L,
            "jogoPalavras", 3L,
            "jogoCoresFormas", 4L,
            "jogoSequencia", 5L
    );

    @Autowired
    private GameSessionRepository gameSessionRepository;

    @Autowired
    private ChildRepository childRepository;

    @Autowired
    private SkillAreaRepository skillAreaRepository;

    @Autowired
    private AutoReportService autoReportService;

    @Autowired
    private AccessControlService accessControl;

    @Transactional
    public GameSession recordSession(Long childId, GameSessionRequest request) {
        accessControl.ensureCanAccessChild(childId);
        Child child = childRepository.findById(childId)
                .orElseThrow(() -> new ResourceNotFoundException("Criança não encontrada"));

        GameSession session = new GameSession();
        session.setChild(child);
        session.setGameId(request.gameId());
        session.setScore(request.score());
        session.setMaxScore(request.maxScore());
        session.setDurationSeconds(request.durationSeconds());
        session.setPlayedAt(LocalDateTime.now());

        Long skillId = request.skillAreaId() != null
                ? request.skillAreaId()
                : GAME_SKILL_MAP.get(request.gameId());

        if (skillId != null) {
            SkillArea area = skillAreaRepository.findById(skillId).orElse(null);
            session.setSkillArea(area);
        }

        GameSession saved = gameSessionRepository.save(session);
        autoReportService.updateReportFromSessions(child);
        return saved;
    }

    public List<GameSession> findByChild(Long childId) {
        accessControl.ensureCanAccessChild(childId);
        return gameSessionRepository.findByChildIdOrderByPlayedAtDesc(childId);
    }
}
