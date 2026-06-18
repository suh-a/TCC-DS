package senai.tcc.zupiapi.zupibackend.services;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;
import senai.tcc.zupiapi.zupibackend.dto.request.SchoolActivityRequest;
import senai.tcc.zupiapi.zupibackend.dto.request.SchoolChatMessageRequest;
import senai.tcc.zupiapi.zupibackend.dto.request.SchoolQuizRequest;
import senai.tcc.zupiapi.zupibackend.dto.response.*;
import senai.tcc.zupiapi.zupibackend.exceptions.BusinessException;
import senai.tcc.zupiapi.zupibackend.exceptions.ResourceNotFoundException;
import senai.tcc.zupiapi.zupibackend.model.*;
import senai.tcc.zupiapi.zupibackend.model.enums.UserType;
import senai.tcc.zupiapi.zupibackend.repositories.*;
import senai.tcc.zupiapi.zupibackend.security.SecurityUtils;
import senai.tcc.zupiapi.zupibackend.security.services.AccessControlService;

import java.time.LocalDateTime;
import java.util.*;

@Service
public class SchoolLearningService {

    @Autowired
    private TeacherRepository teacherRepository;

    @Autowired
    private SchoolRepository schoolRepository;

    @Autowired
    private SchoolClassRepository schoolClassRepository;

    @Autowired
    private ChildRepository childRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private GameSessionRepository gameSessionRepository;

    @Autowired
    private SchoolActivityRepository activityRepository;

    @Autowired
    private SchoolQuizRepository quizRepository;

    @Autowired
    private SchoolChatMessageRepository chatRepository;

    @Autowired
    private AccessControlService accessControl;

    public Map<String, Object> teacherDashboard() {
        Teacher teacher = requireCurrentTeacher();
        List<SchoolClass> classes = classesForTeacher(teacher);
        List<Child> students = studentsForTeacher(teacher, classes);
        return Map.of(
                "teacherName", teacher.getName(),
                "classes", classes.size(),
                "students", students.size(),
                "activities", activityRepository.findByTeacherIdOrderByCreatedAtDesc(teacher.getId()).size(),
                "quizzes", quizRepository.findByTeacherIdOrderByCreatedAtDesc(teacher.getId()).size()
        );
    }

    public List<SchoolClassResponse> teacherClasses() {
        return classesForTeacher(requireCurrentTeacher()).stream()
                .map(this::toClassResponse)
                .toList();
    }

    public List<ChildResponse> teacherStudents() {
        Teacher teacher = requireCurrentTeacher();
        return studentsForTeacher(teacher, classesForTeacher(teacher)).stream()
                .map(this::toChildResponse)
                .toList();
    }

    public SchoolReportSummaryResponse teacherReportsSummary() {
        Teacher teacher = requireCurrentTeacher();
        return reportFor(studentsForTeacher(teacher, classesForTeacher(teacher)));
    }

    public List<SchoolActivityResponse> teacherActivities() {
        Teacher teacher = requireCurrentTeacher();
        return activityRepository.findByTeacherIdOrderByCreatedAtDesc(teacher.getId()).stream()
                .map(this::toActivityResponse)
                .toList();
    }

    public SchoolActivityResponse createActivity(SchoolActivityRequest request) {
        Teacher teacher = requireCurrentTeacher();
        SchoolClass schoolClass = requireTeacherClass(teacher, request.classId());
        if (isBlank(request.title())) {
            throw new BusinessException("Titulo da atividade e obrigatorio");
        }
        SchoolActivity activity = new SchoolActivity();
        activity.setTitle(request.title().trim());
        activity.setDescription(blankToNull(request.description()));
        activity.setLink(blankToNull(request.link()));
        activity.setDeadline(request.deadline());
        activity.setCreatedAt(LocalDateTime.now());
        activity.setSchool(teacher.getSchool());
        activity.setTeacher(teacher);
        activity.setSchoolClass(schoolClass);
        return toActivityResponse(activityRepository.save(activity));
    }

    public List<SchoolQuizResponse> teacherQuizzes() {
        Teacher teacher = requireCurrentTeacher();
        return quizRepository.findByTeacherIdOrderByCreatedAtDesc(teacher.getId()).stream()
                .map(this::toQuizResponse)
                .toList();
    }

    public SchoolQuizResponse createQuiz(SchoolQuizRequest request) {
        Teacher teacher = requireCurrentTeacher();
        SchoolClass schoolClass = requireTeacherClass(teacher, request.classId());
        if (isBlank(request.title())) {
            throw new BusinessException("Titulo do quiz e obrigatorio");
        }
        SchoolQuiz quiz = new SchoolQuiz();
        quiz.setTitle(request.title().trim());
        quiz.setDescription(blankToNull(request.description()));
        quiz.setQuestionsJson(blankToNull(request.questionsJson()));
        quiz.setCreatedAt(LocalDateTime.now());
        quiz.setSchool(teacher.getSchool());
        quiz.setTeacher(teacher);
        quiz.setSchoolClass(schoolClass);
        return toQuizResponse(quizRepository.save(quiz));
    }

    public List<SchoolActivityResponse> activitiesForChild(Long childId) {
        Child child = requireAccessibleSchoolChild(childId);
        return classForChild(child)
                .map(schoolClass -> activityRepository.findBySchoolClassIdOrderByCreatedAtDesc(schoolClass.getId()).stream()
                        .map(this::toActivityResponse)
                        .toList())
                .orElseGet(List::of);
    }

    public List<SchoolQuizResponse> quizzesForChild(Long childId) {
        Child child = requireAccessibleSchoolChild(childId);
        return classForChild(child)
                .map(schoolClass -> quizRepository.findBySchoolClassIdOrderByCreatedAtDesc(schoolClass.getId()).stream()
                        .map(this::toQuizResponse)
                        .toList())
                .orElseGet(List::of);
    }

    public List<SchoolChatMessageResponse> chatMessages() {
        School school = currentChatSchool();
        List<SchoolChatMessage> messages = new ArrayList<>(chatRepository.findTop50BySchoolIdOrderByCreatedAtDesc(school.getId()));
        Collections.reverse(messages);
        return messages.stream().map(this::toChatResponse).toList();
    }

    public SchoolChatMessageResponse postChatMessage(SchoolChatMessageRequest request) {
        if (isBlank(request.message())) {
            throw new BusinessException("Mensagem e obrigatoria");
        }
        School school = currentChatSchool();
        Sender sender = currentSender();
        SchoolChatMessage message = new SchoolChatMessage();
        message.setSchool(school);
        message.setSenderId(sender.id());
        message.setSenderType(sender.type());
        message.setSenderName(sender.name());
        message.setMessage(request.message().trim());
        message.setCreatedAt(LocalDateTime.now());
        return toChatResponse(chatRepository.save(message));
    }

    public SchoolReportSummaryResponse reportFor(Collection<Child> students) {
        List<SchoolReportStudentResponse> rows = students.stream()
                .map(this::reportRow)
                .toList();
        long totalSessions = rows.stream().mapToLong(SchoolReportStudentResponse::totalSessions).sum();
        long averageScore = rows.isEmpty() ? 0 : Math.round(rows.stream()
                .mapToLong(SchoolReportStudentResponse::averageScore)
                .average()
                .orElse(0));
        return new SchoolReportSummaryResponse(rows.size(), totalSessions, averageScore, rows);
    }

    private SchoolReportStudentResponse reportRow(Child child) {
        List<GameSession> sessions = gameSessionRepository.findByChildIdOrderByPlayedAtDesc(child.getId());
        long average = sessions.isEmpty() ? 0 : Math.round(sessions.stream()
                .mapToDouble(GameSession::getPercentage)
                .average()
                .orElse(0));
        LocalDateTime lastPlayedAt = sessions.isEmpty() ? null : sessions.get(0).getPlayedAt();
        return new SchoolReportStudentResponse(
                child.getId(),
                child.getName(),
                child.getSchoolClass(),
                sessions.size(),
                average,
                lastPlayedAt
        );
    }

    private Teacher requireCurrentTeacher() {
        if (!SecurityUtils.hasRole(UserType.DOCENTE.name())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Acesso restrito ao docente");
        }
        return teacherRepository.findByAccountId(SecurityUtils.getCurrentUserId())
                .orElseThrow(() -> new ResourceNotFoundException("Docente nao encontrado para esta conta"));
    }

    private List<SchoolClass> classesForTeacher(Teacher teacher) {
        return schoolClassRepository.findByTeacherId(teacher.getId());
    }

    private List<Child> studentsForTeacher(Teacher teacher, List<SchoolClass> classes) {
        if (teacher.getSchool() == null || classes.isEmpty()) {
            return List.of();
        }
        Set<String> classNames = new HashSet<>();
        classes.forEach(schoolClass -> classNames.add(normalize(schoolClass.getName())));
        return studentsForSchool(teacher.getSchool()).stream()
                .filter(child -> classNames.contains(normalize(child.getSchoolClass())))
                .toList();
    }

    private SchoolClass requireTeacherClass(Teacher teacher, Long classId) {
        if (classId == null) {
            throw new BusinessException("Selecione uma turma");
        }
        SchoolClass schoolClass = schoolClassRepository.findById(classId)
                .orElseThrow(() -> new ResourceNotFoundException("Turma nao encontrada"));
        if (schoolClass.getTeacher() == null || !Objects.equals(schoolClass.getTeacher().getId(), teacher.getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Turma nao pertence a este docente");
        }
        return schoolClass;
    }

    private Child requireAccessibleSchoolChild(Long childId) {
        accessControl.ensureCanAccessChild(childId);
        Child child = childRepository.findById(childId)
                .orElseThrow(() -> new ResourceNotFoundException("Aluno nao encontrado"));
        if (!child.isSchoolLinked()) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Aluno nao pertence ao plano escolar");
        }
        return child;
    }

    private Optional<SchoolClass> classForChild(Child child) {
        List<School> schools = schoolsForChild(child);
        if (schools.isEmpty() || isBlank(child.getSchoolClass())) {
            return Optional.empty();
        }
        String className = normalize(child.getSchoolClass());
        return schoolClassRepository.findBySchoolId(schools.get(0).getId()).stream()
                .filter(schoolClass -> normalize(schoolClass.getName()).equals(className))
                .findFirst();
    }

    private School currentChatSchool() {
        if (SecurityUtils.hasRole(UserType.ESCOLA.name())) {
            return schoolRepository.findByAccountId(SecurityUtils.getCurrentUserId())
                    .orElseThrow(() -> new ResourceNotFoundException("Escola nao encontrada para esta conta"));
        }
        if (SecurityUtils.hasRole(UserType.DOCENTE.name())) {
            Teacher teacher = requireCurrentTeacher();
            if (teacher.getSchool() == null) {
                throw new ResourceNotFoundException("Escola do docente nao encontrada");
            }
            return teacher.getSchool();
        }
        if (SecurityUtils.hasRole(UserType.ALUNO_CREDENCIADO.name())) {
            Child child = childRepository.findById(SecurityUtils.getCurrentUserId())
                    .orElseThrow(() -> new ResourceNotFoundException("Aluno nao encontrado"));
            return schoolsForChild(child).stream().findFirst()
                    .orElseThrow(() -> new ResourceNotFoundException("Escola do aluno nao encontrada"));
        }
        if (SecurityUtils.hasRole(UserType.RESPONSAVEL_CREDENCIADO.name()) || SecurityUtils.hasRole(UserType.RESPONSAVEL.name())) {
            return childRepository.findByResponsibleId(SecurityUtils.getCurrentUserId()).stream()
                    .filter(Child::isSchoolLinked)
                    .flatMap(child -> schoolsForChild(child).stream())
                    .findFirst()
                    .orElseThrow(() -> new ResourceNotFoundException("Escola vinculada nao encontrada"));
        }
        throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Acesso restrito ao chat escolar");
    }

    private Sender currentSender() {
        Long id = SecurityUtils.getCurrentUserId();
        if (SecurityUtils.hasRole(UserType.ALUNO_CREDENCIADO.name())) {
            Child child = childRepository.findById(id).orElse(null);
            return new Sender(id, UserType.ALUNO_CREDENCIADO.name(), child == null ? "Aluno" : child.getName());
        }
        User user = userRepository.findById(id).orElse(null);
        String name = user == null ? "Usuario" : user.getName();
        String type = SecurityUtils.hasRole(UserType.ESCOLA.name()) ? UserType.ESCOLA.name()
                : SecurityUtils.hasRole(UserType.DOCENTE.name()) ? UserType.DOCENTE.name()
                : SecurityUtils.hasRole(UserType.RESPONSAVEL_CREDENCIADO.name()) ? UserType.RESPONSAVEL_CREDENCIADO.name()
                : SecurityUtils.hasRole(UserType.RESPONSAVEL.name()) ? UserType.RESPONSAVEL.name()
                : "USUARIO";
        return new Sender(id, type, name);
    }

    private List<Child> studentsForSchool(School school) {
        List<Child> bySchoolId = childRepository.findBySchoolId(school.getId());
        if (!bySchoolId.isEmpty()) {
            return bySchoolId;
        }
        return childRepository.findBySchoolLinkedTrueAndSchoolName(school.getName());
    }

    private List<School> schoolsForChild(Child child) {
        if (child == null || !child.isSchoolLinked()) {
            return List.of();
        }
        if (child.getSchool() != null) {
            return List.of(child.getSchool());
        }
        if (!isBlank(child.getSchoolName())) {
            return schoolRepository.findByNameIgnoreCase(child.getSchoolName());
        }
        return List.of();
    }

    private SchoolClassResponse toClassResponse(SchoolClass schoolClass) {
        Teacher teacher = schoolClass.getTeacher();
        return new SchoolClassResponse(
                schoolClass.getId(),
                schoolClass.getName(),
                teacher == null ? null : teacher.getId(),
                teacher == null ? null : teacher.getName()
        );
    }

    private ChildResponse toChildResponse(Child child) {
        return new ChildResponse(
                child.getId(),
                child.getName(),
                child.getBirthDate(),
                child.getSchoolClass(),
                child.getCondition(),
                child.getAge(),
                child.getCpf(),
                child.getProfilePhotoUrl(),
                child.isOnboardingCompleted(),
                child.getChildLoginEmail(),
                child.isSchoolLinked(),
                child.getSchoolName()
        );
    }

    private SchoolActivityResponse toActivityResponse(SchoolActivity activity) {
        SchoolClass schoolClass = activity.getSchoolClass();
        return new SchoolActivityResponse(
                activity.getId(),
                schoolClass == null ? null : schoolClass.getId(),
                schoolClass == null ? null : schoolClass.getName(),
                activity.getTitle(),
                activity.getDescription(),
                activity.getLink(),
                activity.getDeadline(),
                activity.getCreatedAt()
        );
    }

    private SchoolQuizResponse toQuizResponse(SchoolQuiz quiz) {
        SchoolClass schoolClass = quiz.getSchoolClass();
        return new SchoolQuizResponse(
                quiz.getId(),
                schoolClass == null ? null : schoolClass.getId(),
                schoolClass == null ? null : schoolClass.getName(),
                quiz.getTitle(),
                quiz.getDescription(),
                quiz.getQuestionsJson(),
                quiz.getCreatedAt()
        );
    }

    private SchoolChatMessageResponse toChatResponse(SchoolChatMessage message) {
        return new SchoolChatMessageResponse(
                message.getId(),
                message.getSenderType(),
                message.getSenderName(),
                message.getMessage(),
                message.getCreatedAt()
        );
    }

    private static String normalize(String value) {
        return value == null ? "" : value.trim().toLowerCase(Locale.ROOT);
    }

    private static boolean isBlank(String value) {
        return value == null || value.isBlank();
    }

    private static String blankToNull(String value) {
        return isBlank(value) ? null : value.trim();
    }

    private record Sender(Long id, String type, String name) {
    }
}
