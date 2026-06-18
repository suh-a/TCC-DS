package senai.tcc.zupiapi.zupibackend.services;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import senai.tcc.zupiapi.zupibackend.dto.request.GameSessionRequest;
import senai.tcc.zupiapi.zupibackend.dto.response.GameSessionResponse;
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

    private static final String COGNICAO = "Cogni\u00e7\u00e3o";
    private static final String COMUNICACAO = "Comunica\u00e7\u00e3o";
    private static final String MOTRICIDADE = "Motricidade";
    private static final String REGULACAO = "Regula\u00e7\u00e3o Emocional";

    private static final Map<String, String> GAME_SKILL_NAME_MAP = Map.ofEntries(
            Map.entry("jogoMemoria", COGNICAO),
            Map.entry("jogoMath", COGNICAO),
            Map.entry("JogoMath", COGNICAO),
            Map.entry("jogoContagem", COGNICAO),
            Map.entry("jogoOrdem", COGNICAO),
            Map.entry("jogoSequencia", COGNICAO),
            Map.entry("jogoSequenciaSons", COGNICAO),
            Map.entry("jogoPadroes", COGNICAO),
            Map.entry("jogoRotas", COGNICAO),
            Map.entry("jogoFocoCores", COGNICAO),
            Map.entry("jogoSombras", COGNICAO),
            Map.entry("jogoCoresFormas", COGNICAO),
            Map.entry("jogo-cores-formas", COGNICAO),
            Map.entry("jogo-ligar-objetos", COGNICAO),
            Map.entry("jogoPalavras", COMUNICACAO),
            Map.entry("jogoLetra", COMUNICACAO),
            Map.entry("jogoColorir", MOTRICIDADE),
            Map.entry("jogoPintura", MOTRICIDADE),
            Map.entry("jogoMosaico", MOTRICIDADE),
            Map.entry("jogoCenarios", MOTRICIDADE),
            Map.entry("jogoBolhas", MOTRICIDADE),
            Map.entry("jogoClique", MOTRICIDADE),
            Map.entry("jogoBalao", MOTRICIDADE),
            Map.entry("jogoCatch", MOTRICIDADE),
            Map.entry("jogoBolao", MOTRICIDADE),
            Map.entry("jogoBomba", REGULACAO)
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
    public GameSessionResponse recordSession(Long childId, GameSessionRequest request) {
        accessControl.ensureCanAccessChild(childId);
        Child child = childRepository.findById(childId)
                .orElseThrow(() -> new ResourceNotFoundException("Criança não encontrada"));

        if (request.sessionId() != null && !request.sessionId().isBlank()) {
            GameSession existing = gameSessionRepository.findBySessionId(request.sessionId()).orElse(null);
            if (existing != null && existing.getChild() != null && existing.getChild().getId().equals(childId)) {
                return toResponse(existing);
            }
        }

        GameSession session = new GameSession();
        session.setChild(child);
        session.setSessionId(blankToNull(request.sessionId()));
        session.setGameId(blankToNull(request.gameId()));
        session.setGameName(blankToNull(request.gameName()));
        session.setScore(nonNegative(request.score()));
        session.setMaxScore(positiveOrDefault(request.maxScore(), 100));
        session.setDurationSeconds(nonNegative(request.durationSeconds()));
        session.setErrors(nonNegative(request.errors()));
        session.setPlayedAt(LocalDateTime.now());

        SkillArea area = resolveSkillArea(request);
        if (area != null) {
            session.setSkillArea(area);
        }

        GameSession saved = gameSessionRepository.save(session);
        autoReportService.updateReportFromSessions(child);
        return toResponse(saved);
    }

    public List<GameSessionResponse> findByChild(Long childId) {
        accessControl.ensureCanAccessChild(childId);
        return gameSessionRepository.findByChildIdOrderByPlayedAtDesc(childId)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    private SkillArea resolveSkillArea(GameSessionRequest request) {
        if (request.skillAreaId() != null) {
            return skillAreaRepository.findById(request.skillAreaId()).orElse(null);
        }

        String skillName = GAME_SKILL_NAME_MAP.get(request.gameId());
        if (skillName != null) {
            SkillArea mappedArea = skillAreaRepository.findByName(skillName);
            if (mappedArea != null) {
                return mappedArea;
            }
        }

        String requestedArea = blankToNull(request.skillArea());
        if (requestedArea != null) {
            return skillAreaRepository.findByName(requestedArea);
        }
        return null;
    }

    private GameSessionResponse toResponse(GameSession session) {
        SkillArea area = session.getSkillArea();
        return new GameSessionResponse(
                session.getId(),
                session.getSessionId(),
                session.getChild() != null ? session.getChild().getId() : null,
                session.getGameId(),
                session.getGameName() != null ? session.getGameName() : session.getGameId(),
                area != null ? area.getName() : null,
                area != null ? area.getId() : null,
                session.getScore(),
                session.getMaxScore(),
                session.getDurationSeconds(),
                session.getErrors() != null ? session.getErrors() : 0,
                (int) Math.round(session.getPercentage()),
                session.getPlayedAt()
        );
    }

    private String blankToNull(String value) {
        return value == null || value.isBlank() ? null : value;
    }

    private int nonNegative(Integer value) {
        return Math.max(0, value != null ? value : 0);
    }

    private int positiveOrDefault(Integer value, int fallback) {
        return value != null && value > 0 ? value : fallback;
    }
}
