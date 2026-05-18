package senai.tcc.zupiapi.zupibackend.services;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import senai.tcc.zupiapi.zupibackend.dto.request.QuizAnswerRequest;
import senai.tcc.zupiapi.zupibackend.dto.response.QuizResponse;
import senai.tcc.zupiapi.zupibackend.exceptions.ResourceNotFoundException;
import senai.tcc.zupiapi.zupibackend.model.Child;
import senai.tcc.zupiapi.zupibackend.model.Quiz;
import senai.tcc.zupiapi.zupibackend.repositories.ChildRepository;
import senai.tcc.zupiapi.zupibackend.repositories.QuizRepository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
public class QuizService {

    @Autowired
    private QuizRepository quizRepository;

    @Autowired
    private ChildRepository childRepository;

    public QuizResponse createInitialQuiz(Long childId) {
        Child child = childRepository.findById(childId)
                .orElseThrow(() -> new ResourceNotFoundException("Child not found"));

        Quiz quiz = new Quiz();
        quiz.setChild(child);
        quiz.setCreatedAt(LocalDateTime.now());
        quiz.setCompleted(false);
        quiz.setSummary("Quiz inicial de perfil criado. Responda as perguntas para personalizar o plano da criança.");
        quiz.setQuestions(generateInitialQuestions());

        Quiz saved = quizRepository.save(quiz);
        return mapToResponse(saved);
    }

    public QuizResponse completeQuiz(QuizAnswerRequest request) {
        Quiz quiz = quizRepository.findTopByChildIdOrderByCreatedAtDesc(request.childId())
                .orElseThrow(() -> new ResourceNotFoundException("Quiz inicial não encontrado"));

        quiz.setAnswers(request.answers());
        quiz.setCompleted(true);
        quiz.setSummary(generateSummary(request.answers()));

        Quiz saved = quizRepository.save(quiz);
        return mapToResponse(saved);
    }

    public QuizResponse getLatestQuiz(Long childId) {
        Quiz quiz = quizRepository.findTopByChildIdOrderByCreatedAtDesc(childId)
                .orElseThrow(() -> new ResourceNotFoundException("Quiz não encontrado"));
        return mapToResponse(quiz);
    }

    private List<String> generateInitialQuestions() {
        return List.of(
                "Quais são as principais dificuldades da criança?",
                "Como é a rotina diária da criança?",
                "Existem sensibilidades sensoriais relevantes?",
                "Como a criança se comunica com outras pessoas?",
                "Quais métodos de aprendizagem funcionam melhor?",
                "Como é o comportamento em ambientes novos?",
                "Como a criança interage socialmente?",
                "Quais são as preferências e interesses da criança?",
                "Qual o nível escolar atual?",
                "Como é a coordenação motora e concentração?"
        );
    }

    private String generateSummary(Map<String, String> answers) {
        return "Resumo automático gerado com base nas respostas: " + answers.keySet().stream().findFirst().orElse("sem dados") + ".";
    }

    private QuizResponse mapToResponse(Quiz quiz) {
        return new QuizResponse(
                quiz.getId(),
                quiz.getChild().getId(),
                quiz.getCreatedAt(),
                quiz.isCompleted(),
                quiz.getQuestions(),
                quiz.getAnswers(),
                quiz.getSummary()
        );
    }
}
