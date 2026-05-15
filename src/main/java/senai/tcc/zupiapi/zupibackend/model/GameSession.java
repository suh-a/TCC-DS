package senai.tcc.zupiapi.zupibackend.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "game_sessions")
public class GameSession {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String gameId;
    private Integer score;
    private Integer maxScore;
    private Integer durationSeconds;
    private LocalDateTime playedAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "child_id", nullable = false)
    private Child child;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "skill_area_id")
    private SkillArea skillArea;

    public GameSession() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getGameId() { return gameId; }
    public void setGameId(String gameId) { this.gameId = gameId; }

    public Integer getScore() { return score; }
    public void setScore(Integer score) { this.score = score; }

    public Integer getMaxScore() { return maxScore; }
    public void setMaxScore(Integer maxScore) { this.maxScore = maxScore; }

    public Integer getDurationSeconds() { return durationSeconds; }
    public void setDurationSeconds(Integer durationSeconds) { this.durationSeconds = durationSeconds; }

    public LocalDateTime getPlayedAt() { return playedAt; }
    public void setPlayedAt(LocalDateTime playedAt) { this.playedAt = playedAt; }

    public Child getChild() { return child; }
    public void setChild(Child child) { this.child = child; }

    public SkillArea getSkillArea() { return skillArea; }
    public void setSkillArea(SkillArea skillArea) { this.skillArea = skillArea; }

    public double getPercentage() {
        if (maxScore == null || maxScore == 0) return 0;
        return (score != null ? score : 0) * 100.0 / maxScore;
    }
}
