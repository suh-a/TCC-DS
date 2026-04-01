package senai.tcc.zupiapi.zupibackend.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;


import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;


@Entity
@Table(name = "children")
public class Child {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private Long id;

    private String name;
    private LocalDate birthDate;
    private String schoolClass;
    private String condition;
    private Integer age;

    @OneToMany(mappedBy = "child")
    private List<Event> activits = new ArrayList<>();

    @ManyToOne
    @JoinColumn(name = "user_id")
    private User responsible;

    @OneToMany(mappedBy = "child")
    private List<ChildReport> reports = new ArrayList<>();

    public Child() {}

    public Child(Long id, String name, LocalDate birthDate, String schoolClass, String condition, User responsible) {
        this.id = id;
        this.name = name;
        this.birthDate = birthDate;
        this.schoolClass = schoolClass;
        this.condition = condition;
        this.responsible = responsible;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public LocalDate getBirthDate() {
        return birthDate;
    }

    public void setBirthDate(LocalDate birthDate) {
        this.birthDate = birthDate;
    }

    public String getSchoolClass() {
        return schoolClass;
    }

    public void setSchoolClass(String schoolClass) {
        this.schoolClass = schoolClass;
    }

    public String getCondition() {
        return condition;
    }

    public void setCondition(String condition) {
        this.condition = condition;
    }

    public List<Event> getActivits() {
        return activits;
    }

    public List<ChildReport> getReports() {
        return reports;
    }

    public Integer getAge() {
        setAge();
        return age;
    }

    public void setAge() {
        LocalDate date = LocalDate.now();
        this.age = date.compareTo(birthDate);
    }

    @JsonIgnore
    public User getResponsible() {
        return responsible;
    }

    public void setResponsible(User responsible) {
        this.responsible = responsible;
    }

    @Override
    public boolean equals(Object o) {
        if (o == null || getClass() != o.getClass()) return false;
        Child child = (Child) o;
        return Objects.equals(id, child.id);
    }

    @Override
    public int hashCode() {
        return Objects.hashCode(id);
    }
}
