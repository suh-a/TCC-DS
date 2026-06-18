package senai.tcc.zupiapi.zupibackend.model;

import jakarta.persistence.*;

@Entity
@Table(
        name = "school_responsibles",
        uniqueConstraints = @UniqueConstraint(columnNames = {"school_id", "responsible_id"})
)
public class SchoolResponsible {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "school_id", nullable = false)
    private School school;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "responsible_id", nullable = false)
    private User responsible;

    public SchoolResponsible() {}

    public SchoolResponsible(School school, User responsible) {
        this.school = school;
        this.responsible = responsible;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public School getSchool() { return school; }
    public void setSchool(School school) { this.school = school; }

    public User getResponsible() { return responsible; }
    public void setResponsible(User responsible) { this.responsible = responsible; }
}
