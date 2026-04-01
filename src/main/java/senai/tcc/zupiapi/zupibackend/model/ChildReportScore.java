package senai.tcc.zupiapi.zupibackend.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;

import java.util.Objects;

@Entity
@Table(name = "report_scores")
public class ChildReportScore {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Integer score;

    @ManyToOne
    @JsonIgnore
    private ChildReport childReport;

    @ManyToOne
    private SkillArea skillArea;


    public ChildReportScore() {}

    public ChildReportScore(Long id, ChildReport childReport, SkillArea skillArea, Integer score) {
        this.id = id;
        this.childReport = childReport;
        this.skillArea = skillArea;
        this.score = score;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public ChildReport getChildReport() {
        return childReport;
    }

    public void setChildReport(ChildReport childReport) {
        this.childReport = childReport;
    }

    public SkillArea getSkillArea() {
        return skillArea;
    }

    public void setSkillArea(SkillArea skillArea) {
        this.skillArea = skillArea;
    }

    public Integer getScore() {
        return score;
    }

    public void setScore(Integer score) {
        this.score = score;
    }

    @Override
    public boolean equals(Object o) {
        if (o == null || getClass() != o.getClass()) return false;
        ChildReportScore that = (ChildReportScore) o;
        return Objects.equals(id, that.id);
    }

    @Override
    public int hashCode() {
        return Objects.hashCode(id);
    }
}
