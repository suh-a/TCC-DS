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

        SkillArea area = resolveSkillArea(request);
        if (area != null) {
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

    private SkillArea resolveSkillArea(GameSessionRequest request) {
        if (request.skillAreaId() != null) {
            return skillAreaRepository.findById(request.skillAreaId()).orElse(null);
        }

        String skillName = GAME_SKILL_NAME_MAP.get(request.gameId());
        if (skillName == null) {
            return null;
        }
        return skillAreaRepository.findByName(skillName);
    }
}
