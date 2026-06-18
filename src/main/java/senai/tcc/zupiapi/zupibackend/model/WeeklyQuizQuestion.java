package senai.tcc.zupiapi.zupibackend.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "weekly_quiz_questions")
public class WeeklyQuizQuestion {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private int position;
    @Column(nullable = false, length = 500)
    private String prompt;
    @ElementCollection
    @CollectionTable(name = "weekly_quiz_options", joinColumns = @JoinColumn(name = "question_id"))
    @OrderColumn(name = "position")
    @Column(name = "option_text", length = 300)
    private List<String> options = new ArrayList<>();
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "quiz_id", nullable = false)
    @JsonIgnore
    private WeeklyQuiz quiz;

    public WeeklyQuizQuestion() {}
    public WeeklyQuizQuestion(int position, String prompt, List<String> options) {
        this.position = position;
        this.prompt = prompt;
        this.options = new ArrayList<>(options);
    }
    public Long getId() { return id; }
    public int getPosition() { return position; }
    public String getPrompt() { return prompt; }
    public List<String> getOptions() { return options; }
    public void setQuiz(WeeklyQuiz quiz) { this.quiz = quiz; }
}
