package senai.tcc.zupiapi.zupibackend.model;

import jakarta.persistence.*;
import senai.tcc.zupiapi.zupibackend.model.enums.PlanType;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "weekly_quizzes")
public class WeeklyQuiz {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column(nullable = false, unique = true)
    private String slug;
    @Column(nullable = false)
    private String title;
    private String objective;
    @Column(length = 1000)
    private String feedback;
    @Enumerated(EnumType.STRING)
    private PlanType planType;
    @OneToMany(mappedBy = "quiz", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("position ASC")
    private List<WeeklyQuizQuestion> questions = new ArrayList<>();

    public Long getId() { return id; }
    public String getSlug() { return slug; }
    public void setSlug(String slug) { this.slug = slug; }
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getObjective() { return objective; }
    public void setObjective(String objective) { this.objective = objective; }
    public String getFeedback() { return feedback; }
    public void setFeedback(String feedback) { this.feedback = feedback; }
    public PlanType getPlanType() { return planType; }
    public void setPlanType(PlanType planType) { this.planType = planType; }
    public List<WeeklyQuizQuestion> getQuestions() { return questions; }
    public void addQuestion(WeeklyQuizQuestion question) {
        question.setQuiz(this);
        questions.add(question);
    }
}
