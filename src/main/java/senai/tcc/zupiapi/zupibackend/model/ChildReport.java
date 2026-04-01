package senai.tcc.zupiapi.zupibackend.model;


import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;

@Entity
@Table(name = "relatorios")
public class ChildReport {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Instant date;

    @ManyToOne
    @JsonIgnore
    private Child child;

    @OneToMany(mappedBy = "childReport")
    private List<ChildReportScore> scores = new ArrayList<>();


    public ChildReport() {}

    public ChildReport(Long id, Instant date, Child child) {
        this.id = id;
        this.date = date;
        this.child = child;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Instant getDate() {
        return date;
    }

    public void setDate(Instant date) {
        this.date = date;
    }

    public Child getChild() {
        return child;
    }

    public void setChild(Child child) {
        this.child = child;
    }

    public List<ChildReportScore> getScores() {
        return scores;
    }

    @Override
    public boolean equals(Object o) {
        if (o == null || getClass() != o.getClass()) return false;
        ChildReport that = (ChildReport) o;
        return Objects.equals(id, that.id);
    }

    @Override
    public int hashCode() {
        return Objects.hashCode(id);
    }
}
