package senai.tcc.zupiapi.zupibackend.services;

import org.springframework.stereotype.Service;
import senai.tcc.zupiapi.zupibackend.dto.response.WeeklyQuizResponse;
import senai.tcc.zupiapi.zupibackend.model.enums.PlanType;
import senai.tcc.zupiapi.zupibackend.repositories.WeeklyQuizRepository;
import java.util.List;
import org.springframework.transaction.annotation.Transactional;

@Service
public class WeeklyQuizService {
    private final WeeklyQuizRepository repository;
    public WeeklyQuizService(WeeklyQuizRepository repository) { this.repository = repository; }

    @Transactional(readOnly = true)
    public List<WeeklyQuizResponse> findPfQuizzes() {
        return repository.findAllByPlanTypeOrderById(PlanType.PESSOA_FISICA).stream()
                .map(quiz -> new WeeklyQuizResponse(
                        quiz.getId(), quiz.getSlug(), quiz.getTitle(), quiz.getObjective(), quiz.getFeedback(),
                        quiz.getQuestions().stream()
                                .map(question -> new WeeklyQuizResponse.Question(
                                        question.getId(), question.getPrompt(), question.getOptions()))
                                .toList()))
                .toList();
    }
}
