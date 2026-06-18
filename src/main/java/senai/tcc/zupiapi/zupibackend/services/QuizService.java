package senai.tcc.zupiapi.zupibackend.services;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.security.crypto.password.PasswordEncoder;
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
import java.security.SecureRandom;
import senai.tcc.zupiapi.zupibackend.security.services.AccessControlService;

@Service
public class QuizService {

    @Autowired
    private QuizRepository quizRepository;

    @Autowired
    private ChildRepository childRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private EmailService emailService;

    @Autowired
    private AccessControlService accessControl;

    private final SecureRandom secureRandom = new SecureRandom();

    public QuizResponse createInitialQuiz(Long childId) {
        accessControl.ensureCanAccessChild(childId);
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
        accessControl.ensureCanAccessChild(request.childId());
        Quiz quiz = quizRepository.findTopByChildIdOrderByCreatedAtDesc(request.childId())
                .orElseThrow(() -> new ResourceNotFoundException("Quiz inicial não encontrado"));

        quiz.setAnswers(request.answers());
        quiz.setCompleted(true);
        quiz.setSummary(generateSummary(request.answers()));

        Child child = quiz.getChild();
        String generatedPassword = null;
        if (!child.isSchoolLinked()) {
            generatedPassword = generatePassword();
            child.setChildPasswordHash(passwordEncoder.encode(generatedPassword));
            child.setOnboardingCompleted(true);
            childRepository.save(child);
        }

        Quiz saved = quizRepository.save(quiz);
        if (generatedPassword != null && child.getResponsible() != null) {
            emailService.sendChildCredentialsEmail(
                    child.getResponsible().getEmail(), child.getName(),
                    child.getChildLoginEmail(), generatedPassword);
        }
        return mapToResponse(saved, generatedPassword);
    }

    public QuizResponse getLatestQuiz(Long childId) {
        accessControl.ensureCanAccessChild(childId);
        Quiz quiz = quizRepository.findTopByChildIdOrderByCreatedAtDesc(childId)
                .orElseThrow(() -> new ResourceNotFoundException("Quiz não encontrado"));
        return mapToResponse(quiz, null);
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

    private String generatePassword() {
        String chars = "ABCDEFGHJKMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789!@#$%";
        StringBuilder password = new StringBuilder(12);
        for (int i = 0; i < 12; i++) {
            password.append(chars.charAt(secureRandom.nextInt(chars.length())));
        }
        return password.toString();
    }

    private QuizResponse mapToResponse(Quiz quiz) {
        return mapToResponse(quiz, null);
    }

    private QuizResponse mapToResponse(Quiz quiz, String generatedPassword) {
        return new QuizResponse(
                quiz.getId(),
                quiz.getChild().getId(),
                quiz.getCreatedAt(),
                quiz.isCompleted(),
                quiz.getQuestions(),
                quiz.getAnswers(),
                quiz.getSummary(),
                quiz.getChild().getChildLoginEmail(),
                generatedPassword
        );
    }
}
