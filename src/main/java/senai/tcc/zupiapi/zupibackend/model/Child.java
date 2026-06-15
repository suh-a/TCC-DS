package senai.tcc.zupiapi.zupibackend.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;


import java.time.LocalDate;
import java.time.Period;
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

    @Column(unique = true)
    private String cpf;

    private String profilePhotoUrl;
    private String medicalReportUrl;
    private boolean onboardingCompleted;
    private String childLoginEmail;
    private String childPasswordHash;
    private boolean schoolLinked;
    private String schoolName;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "school_id")
    @JsonIgnore
    private School school;

    @OneToMany(mappedBy = "child")
    @JsonIgnore
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
        if (age != null) {
            return age;
        }
        if (birthDate == null) {
            return null;
        }
        return Period.between(birthDate, LocalDate.now()).getYears();
    }

    public void setAge(Integer age) {
        this.age = age;
    }

    public String getCpf() {
        return cpf;
    }

    public void setCpf(String cpf) {
        this.cpf = cpf;
    }

    public String getProfilePhotoUrl() {
        return profilePhotoUrl;
    }

    public void setProfilePhotoUrl(String profilePhotoUrl) {
        this.profilePhotoUrl = profilePhotoUrl;
    }

    public String getMedicalReportUrl() {
        return medicalReportUrl;
    }

    public void setMedicalReportUrl(String medicalReportUrl) {
        this.medicalReportUrl = medicalReportUrl;
    }

    public String getChildLoginEmail() {
        return childLoginEmail;
    }

    public void setChildLoginEmail(String childLoginEmail) {
        this.childLoginEmail = childLoginEmail;
    }

    public String getChildPasswordHash() {
        return childPasswordHash;
    }

    public void setChildPasswordHash(String childPasswordHash) {
        this.childPasswordHash = childPasswordHash;
    }

    public boolean isSchoolLinked() {
        return schoolLinked;
    }

    public void setSchoolLinked(boolean schoolLinked) {
        this.schoolLinked = schoolLinked;
    }

    public String getSchoolName() {
        return schoolName;
    }

    public void setSchoolName(String schoolName) {
        this.schoolName = schoolName;
    }

    public School getSchool() {
        return school;
    }

    public void setSchool(School school) {
        this.school = school;
    }

    public boolean isOnboardingCompleted() {
        return onboardingCompleted;
    }

    public void setOnboardingCompleted(boolean onboardingCompleted) {
        this.onboardingCompleted = onboardingCompleted;
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
