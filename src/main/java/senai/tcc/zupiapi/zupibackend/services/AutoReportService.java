package senai.tcc.zupiapi.zupibackend.services;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import senai.tcc.zupiapi.zupibackend.dto.request.ChildReportScoreRequest;
import senai.tcc.zupiapi.zupibackend.model.Child;
import senai.tcc.zupiapi.zupibackend.model.ChildReport;
import senai.tcc.zupiapi.zupibackend.model.ChildReportScore;
import senai.tcc.zupiapi.zupibackend.model.GameSession;
import senai.tcc.zupiapi.zupibackend.model.SkillArea;
import senai.tcc.zupiapi.zupibackend.repositories.ChildReportRepository;
import senai.tcc.zupiapi.zupibackend.repositories.GameSessionRepository;
import senai.tcc.zupiapi.zupibackend.security.services.AccessControlService;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class AutoReportService {

    @Autowired
    private GameSessionRepository gameSessionRepository;

    @Autowired
    private ChildReportRepository childReportRepository;

    @Autowired
    private ChildReportScoreService childReportScoreService;

    @Autowired
    private AccessControlService accessControl;

    @Transactional
    public void updateReportFromSessions(Child child) {
        LocalDateTime since = LocalDate.now().atStartOfDay();
        List<GameSession> sessions = gameSessionRepository
                .findByChildIdAndPlayedAtAfter(child.getId(), since);

        if (sessions.isEmpty()) {
            return;
        }

        ChildReport report = childReportRepository.findReportTodayByChildId(child)
                .orElseGet(() -> {
                    ChildReport r = new ChildReport();
                    r.setChild(child);
                    r.setDate(LocalDate.now());
                    return childReportRepository.save(r);
                });

        Map<Long, List<GameSession>> bySkill = sessions.stream()
                .filter(s -> s.getSkillArea() != null)
                .collect(Collectors.groupingBy(s -> s.getSkillArea().getId()));

        for (Map.Entry<Long, List<GameSession>> entry : bySkill.entrySet()) {
            double avgPct = entry.getValue().stream()
                    .mapToDouble(GameSession::getPercentage)
                    .average()
                    .orElse(0);
            int score = (int) Math.round(avgPct);

            SkillArea area = entry.getValue().getFirst().getSkillArea();
            Optional<ChildReportScore> existing = report.getScores().stream()
                    .filter(s -> s.getSkillArea() != null && Objects.equals(s.getSkillArea().getId(), area.getId()))
                    .findFirst();

            if (existing.isPresent()) {
                existing.get().setScore(score);
            } else {
                ChildReportScoreRequest req = new ChildReportScoreRequest(area.getId(), score);
                ChildReportScore saved = childReportScoreService.save(req, report);
                report.getScores().add(saved);
            }
        }

        childReportRepository.save(report);
    }

    public Map<String, Object> buildProgressSummary(Long childId) {
        accessControl.ensureCanAccessChild(childId);
        List<GameSession> recent = gameSessionRepository.findByChildIdOrderByPlayedAtDesc(childId);
        if (recent.isEmpty()) {
            return Map.of(
                    "totalGames", 0,
                    "averageScore", 0,
                    "totalSeconds", 0,
                    "errors", 0,
                    "trend", "sem_dados",
                    "difficulties", List.of(),
                    "message", "Ainda não há jogos registrados."
            );
        }

        double avg = recent.stream().limit(10).mapToDouble(GameSession::getPercentage).average().orElse(0);
        int totalSeconds = recent.stream()
                .mapToInt(s -> s.getDurationSeconds() != null ? s.getDurationSeconds() : 0)
                .sum();
        int totalErrors = recent.stream()
                .mapToInt(s -> s.getErrors() != null ? s.getErrors() : 0)
                .sum();
        String trend = avg >= 70 ? "evoluindo" : avg >= 40 ? "em_progresso" : "precisa_apoio";

        List<String> difficulties = recent.stream()
                .filter(s -> s.getPercentage() < 50)
                .map(GameSession::getGameId)
                .filter(gameId -> gameId != null && !gameId.isBlank())
                .distinct()
                .limit(3)
                .toList();

        return Map.of(
                "totalGames", recent.size(),
                "averageScore", Math.round(avg),
                "totalSeconds", totalSeconds,
                "errors", totalErrors,
                "trend", trend,
                "difficulties", difficulties,
                "lastPlayedAt", recent.getFirst().getPlayedAt() != null ? recent.getFirst().getPlayedAt() : "",
                "message", generateMessage(avg, difficulties)
        );
    }

    private String generateMessage(double avg, List<String> difficulties) {
        if (avg >= 70) {
            return "Ótimo desempenho! A criança está evoluindo bem nas atividades.";
        }
        if (difficulties.isEmpty()) {
            return "Desempenho em progresso. Continue incentivando com calma.";
        }
        return "Identificamos dificuldade em: " + String.join(", ", difficulties)
                + ". Sugerimos atividades adaptadas e pausas frequentes.";
    }
}
