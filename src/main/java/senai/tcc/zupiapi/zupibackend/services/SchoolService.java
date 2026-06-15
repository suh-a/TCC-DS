package senai.tcc.zupiapi.zupibackend.services;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;
import senai.tcc.zupiapi.zupibackend.dto.ChildRegistrationResponse;
import senai.tcc.zupiapi.zupibackend.dto.request.*;
import senai.tcc.zupiapi.zupibackend.dto.response.*;
import senai.tcc.zupiapi.zupibackend.exceptions.BusinessException;
import senai.tcc.zupiapi.zupibackend.exceptions.ResourceNotFoundException;
import senai.tcc.zupiapi.zupibackend.model.*;
import senai.tcc.zupiapi.zupibackend.model.enums.PlanType;
import senai.tcc.zupiapi.zupibackend.model.enums.UserType;
import senai.tcc.zupiapi.zupibackend.repositories.*;
import senai.tcc.zupiapi.zupibackend.security.SecurityUtils;

import java.io.IOException;
import java.net.MalformedURLException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardCopyOption;
import java.time.LocalDateTime;
import java.util.*;

@Service
public class SchoolService {

    @Autowired
    private SchoolRepository schoolRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ChildRepository childRepository;

    @Autowired
    private TeacherRepository teacherRepository;

    @Autowired
    private SchoolClassRepository schoolClassRepository;

    @Autowired
    private LibraryBookRepository libraryBookRepository;

    @Autowired
    private ChildService childService;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Value("${zupi.library.upload-dir:uploads/library-pdfs}")
    private String libraryUploadDir;

    public School requireCurrentSchool() {
        if (!SecurityUtils.hasRole(UserType.ESCOLA.name())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Acesso restrito a escola");
        }
        Long accountId = SecurityUtils.getCurrentUserId();
        return schoolRepository.findByAccountId(accountId)
                .orElseThrow(() -> new ResourceNotFoundException("Escola nao encontrada para esta conta"));
    }

    public Map<String, Object> dashboard() {
        School school = requireCurrentSchool();
        return Map.of(
                "schoolName", school.getName(),
                "students", studentsFor(school).size(),
                "teachers", teacherRepository.findBySchoolId(school.getId()).size(),
                "classes", schoolClassRepository.findBySchoolId(school.getId()).size(),
                "games", 0
        );
    }

    public List<ChildResponse> listStudents() {
        return studentsFor(requireCurrentSchool()).stream()
                .map(this::toChildResponse)
                .toList();
    }

    public ChildRegistrationResponse registerStudent(ChildRequest request) {
        School school = requireCurrentSchool();
        if (request.responsibleId() == null) {
            throw new BusinessException("Selecione um responsavel cadastrado");
        }

        User responsible = userRepository.findById(request.responsibleId())
                .orElseThrow(() -> new ResourceNotFoundException("Responsavel nao encontrado"));
        if (responsible.getUserType() != UserType.RESPONSAVEL) {
            throw new BusinessException("Usuario selecionado nao e um responsavel");
        }

        ChildRequest schoolChild = new ChildRequest(
                request.name(),
                null,
                request.cpf(),
                request.birthDate(),
                request.schoolClass(),
                request.condition(),
                responsible.getId(),
                true,
                school.getName()
        );

        ChildRegistrationResponse response = childService.saveForSchool(schoolChild, school);
        ensureStudentUser(response.child(), response.generatedPassword());
        return response;
    }

    public List<ResponsibleSummaryResponse> searchResponsibles(String query) {
        School school = requireCurrentSchool();
        String schoolName = school.getName();
        String q = query == null ? "" : query.trim().toLowerCase();

        Map<Long, User> byId = new LinkedHashMap<>();

        childRepository.findBySchoolLinkedTrueAndSchoolName(schoolName).forEach(child -> {
            User resp = child.getResponsible();
            if (resp != null && resp.getUserType() == UserType.RESPONSAVEL) {
                byId.putIfAbsent(resp.getId(), resp);
            }
        });

        if (!q.isBlank()) {
            String digits = q.replaceAll("\\D", "");
            if (digits.length() == 11) {
                userRepository.findByCpf(digits)
                        .filter(u -> u.getUserType() == UserType.RESPONSAVEL)
                        .ifPresent(u -> byId.putIfAbsent(u.getId(), u));
            }
            userRepository.findByUserType(UserType.RESPONSAVEL).stream()
                    .filter(u -> matchesQuery(u, q, digits))
                    .forEach(u -> byId.putIfAbsent(u.getId(), u));
        }

        List<ResponsibleSummaryResponse> result = new ArrayList<>();
        byId.values().stream()
                .sorted(Comparator.comparing(User::getName, String.CASE_INSENSITIVE_ORDER))
                .forEach(u -> result.add(toSummary(u)));
        return result;
    }

    public ResponsibleSummaryResponse registerResponsible(ResponsibleRegisterRequest request) {
        requireCurrentSchool();

        if (request.name() == null || request.name().isBlank()) {
            throw new BusinessException("Nome do responsavel e obrigatorio");
        }
        if (request.email() == null || request.email().isBlank()) {
            throw new BusinessException("E-mail e obrigatorio");
        }
        if (request.password() == null || request.password().length() < 6) {
            throw new BusinessException("Senha deve ter no minimo 6 caracteres");
        }

        String cpf = onlyDigits(request.cpf());
        if (cpf.length() != 11) {
            throw new BusinessException("CPF invalido");
        }
        String phone = onlyDigits(request.phone());
        if (!phone.isBlank() && (phone.length() < 10 || phone.length() > 11)) {
            throw new BusinessException("Telefone invalido");
        }
        if (userRepository.existsByCpf(cpf)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "CPF ja cadastrado");
        }
        if (userRepository.existsByEmail(request.email())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "E-mail ja cadastrado");
        }
        if (request.birthDate() == null) {
            throw new BusinessException("Data de nascimento e obrigatoria");
        }

        User user = new User();
        user.setName(request.name().trim());
        user.setEmail(request.email().trim().toLowerCase());
        user.setPassword(passwordEncoder.encode(request.password()));
        user.setCpf(cpf);
        user.setBirthDate(request.birthDate());
        user.setPhone(phone.isBlank() ? null : phone);
        user.setUserType(UserType.RESPONSAVEL);
        user.setPlanType(PlanType.PESSOA_FISICA);
        user.setAddress(new Address());

        return toSummary(userRepository.save(user));
    }

    public TeacherResponse registerTeacher(TeacherRequest request) {
        School school = requireCurrentSchool();
        if (request.name() == null || request.name().isBlank()) {
            throw new BusinessException("Nome do docente e obrigatorio");
        }
        String email = requireEmail(request.email());
        if (userRepository.existsByEmail(email)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "E-mail ja cadastrado");
        }

        String password = generatePassword();
        User account = new User();
        account.setName(request.name().trim());
        account.setEmail(email);
        account.setPassword(passwordEncoder.encode(password));
        account.setUserType(UserType.DOCENTE);
        account.setPlanType(PlanType.PESSOA_JURIDICA);
        account.setAddress(new Address());
        account = userRepository.save(account);

        Teacher teacher = new Teacher();
        teacher.setName(account.getName());
        teacher.setEmail(account.getEmail());
        teacher.setSpecialty(request.specialty());
        teacher.setSchool(school);
        teacher.setAccount(account);
        return toTeacherResponse(teacherRepository.save(teacher), password);
    }

    public List<TeacherResponse> listTeachers() {
        School school = requireCurrentSchool();
        return teacherRepository.findBySchoolId(school.getId()).stream()
                .map(t -> toTeacherResponse(t, null))
                .toList();
    }

    public SchoolClassResponse createClass(SchoolClassRequest request) {
        School school = requireCurrentSchool();
        if (request.name() == null || request.name().isBlank()) {
            throw new BusinessException("Nome da turma e obrigatorio");
        }
        if (request.teacherId() == null) {
            throw new BusinessException("Selecione um docente para a turma");
        }
        Teacher teacher = teacherRepository.findByIdAndSchoolId(request.teacherId(), school.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Docente nao encontrado nesta escola"));

        SchoolClass schoolClass = new SchoolClass();
        schoolClass.setName(request.name().trim());
        schoolClass.setSchool(school);
        schoolClass.setTeacher(teacher);
        return toClassResponse(schoolClassRepository.save(schoolClass));
    }

    public List<SchoolClassResponse> listClasses() {
        School school = requireCurrentSchool();
        return schoolClassRepository.findBySchoolId(school.getId()).stream()
                .map(this::toClassResponse)
                .toList();
    }

    public SchoolAccessResponse listAccesses() {
        School school = requireCurrentSchool();
        List<AccessItemResponse> responsibles = searchResponsibles("").stream()
                .map(r -> new AccessItemResponse(r.id(), r.name(), r.email(), formatCpf(r.cpf())))
                .toList();
        List<AccessItemResponse> teachers = teacherRepository.findBySchoolId(school.getId()).stream()
                .map(t -> new AccessItemResponse(t.getId(), t.getName(), t.getEmail(), t.getSpecialty()))
                .toList();
        List<AccessItemResponse> students = studentsFor(school).stream()
                .map(c -> new AccessItemResponse(c.getId(), c.getName(), c.getChildLoginEmail(), c.getSchoolClass()))
                .toList();
        return new SchoolAccessResponse(responsibles, teachers, students);
    }

    public void updateTeacherEmail(Long id, AccessEmailRequest request) {
        School school = requireCurrentSchool();
        Teacher teacher = teacherRepository.findByIdAndSchoolId(id, school.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Docente nao encontrado"));
        String email = requireEmail(request.email());
        if (userRepository.existsByEmail(email) && !email.equalsIgnoreCase(teacher.getEmail())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "E-mail ja cadastrado");
        }
        teacher.setEmail(email);
        if (teacher.getAccount() != null) {
            teacher.getAccount().setEmail(email);
            userRepository.save(teacher.getAccount());
        }
        teacherRepository.save(teacher);
    }

    public PasswordResetResponse resetTeacherPassword(Long id) {
        School school = requireCurrentSchool();
        Teacher teacher = teacherRepository.findByIdAndSchoolId(id, school.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Docente nao encontrado"));
        String password = generatePassword();
        teacher.getAccount().setPassword(passwordEncoder.encode(password));
        userRepository.save(teacher.getAccount());
        return new PasswordResetResponse(teacher.getEmail(), password);
    }

    public void updateStudentLogin(Long id, AccessEmailRequest request) {
        School school = requireCurrentSchool();
        Child child = findStudentInSchool(id, school);
        String oldEmail = child.getChildLoginEmail();
        String email = requireEmail(request.email());
        if (userRepository.existsByEmail(email) && !email.equalsIgnoreCase(oldEmail)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "E-mail ja cadastrado");
        }
        child.setChildLoginEmail(email);
        childRepository.save(child);
        userRepository.findByEmail(oldEmail)
                .filter(u -> u.getUserType() == UserType.ALUNO_CREDENCIADO)
                .ifPresent(u -> {
                    u.setEmail(email);
                    userRepository.save(u);
                });
    }

    public PasswordResetResponse resetStudentPassword(Long id) {
        School school = requireCurrentSchool();
        Child child = findStudentInSchool(id, school);
        String password = generatePassword();
        String hash = passwordEncoder.encode(password);
        child.setChildPasswordHash(hash);
        childRepository.save(child);
        userRepository.findByEmail(child.getChildLoginEmail())
                .filter(u -> u.getUserType() == UserType.ALUNO_CREDENCIADO)
                .ifPresent(u -> {
                    u.setPassword(hash);
                    userRepository.save(u);
                });
        return new PasswordResetResponse(child.getChildLoginEmail(), password);
    }

    public void updateResponsibleEmail(Long id, AccessEmailRequest request) {
        requireCurrentSchool();
        User user = requireResponsible(id);
        String email = requireEmail(request.email());
        if (userRepository.existsByEmail(email) && !email.equalsIgnoreCase(user.getEmail())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "E-mail ja cadastrado");
        }
        user.setEmail(email);
        userRepository.save(user);
    }

    public PasswordResetResponse resetResponsiblePassword(Long id) {
        User user = requireResponsible(id);
        String password = generatePassword();
        user.setPassword(passwordEncoder.encode(password));
        userRepository.save(user);
        return new PasswordResetResponse(user.getEmail(), password);
    }

    public Map<String, Object> reportsSummary() {
        School school = requireCurrentSchool();
        List<Map<String, Object>> rows = studentsFor(school).stream()
                .map(c -> Map.<String, Object>of(
                        "childId", c.getId(),
                        "name", c.getName(),
                        "schoolClass", c.getSchoolClass() == null ? "" : c.getSchoolClass(),
                        "totalSessions", 0,
                        "averageScore", 0,
                        "lastPlayedAt", ""
                ))
                .toList();
        return Map.of(
                "totalStudents", rows.size(),
                "totalSessions", 0,
                "averageScore", 0,
                "students", rows
        );
    }

    public List<LibraryBookResponse> listBooks() {
        School school = requireCurrentSchool();
        return libraryBookRepository.findBySchoolId(school.getId()).stream()
                .map(this::toBookResponse)
                .toList();
    }

    public LibraryBookResponse createBook(LibraryBookRequest request) {
        School school = requireCurrentSchool();
        if (request.title() == null || request.title().isBlank()) {
            throw new BusinessException("Titulo do livro e obrigatorio");
        }
        if (request.fileUrl() == null || request.fileUrl().isBlank()) {
            throw new BusinessException("Link do livro e obrigatorio");
        }
        LibraryBook book = new LibraryBook();
        book.setTitle(request.title().trim());
        book.setFileUrl(request.fileUrl().trim());
        book.setCreatedAt(LocalDateTime.now());
        book.setSchool(school);
        return toBookResponse(libraryBookRepository.save(book));
    }

    public LibraryBookResponse createBook(String title, MultipartFile file) {
        School school = requireCurrentSchool();
        String normalizedTitle = requireBookTitle(title);
        String storedFileName = storeLibraryPdf(file);

        LibraryBook book = new LibraryBook();
        book.setTitle(normalizedTitle);
        book.setFileUrl(storedFileName);
        book.setCreatedAt(LocalDateTime.now());
        book.setSchool(school);
        return toBookResponse(libraryBookRepository.save(book));
    }

    public LibraryBookFile getBookFile(Long id) {
        School school = requireCurrentSchool();
        LibraryBook book = libraryBookRepository.findByIdAndSchoolId(id, school.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Livro nao encontrado"));
        String storedFileName = book.getFileUrl();
        if (storedFileName == null || storedFileName.isBlank() || storedFileName.startsWith("http")) {
            throw new ResourceNotFoundException("PDF do livro nao encontrado");
        }
        try {
            Path file = libraryUploadPath().resolve(storedFileName).normalize();
            Path base = libraryUploadPath().toAbsolutePath().normalize();
            if (!file.toAbsolutePath().normalize().startsWith(base) || !Files.exists(file)) {
                throw new ResourceNotFoundException("PDF do livro nao encontrado");
            }
            Resource resource = new UrlResource(file.toUri());
            return new LibraryBookFile(resource, storedFileName);
        } catch (MalformedURLException e) {
            throw new ResourceNotFoundException("PDF do livro nao encontrado");
        }
    }

    private void ensureStudentUser(ChildResponse child, String generatedPassword) {
        if (child.childLoginEmail() == null || child.childLoginEmail().isBlank()) {
            return;
        }
        if (userRepository.existsByEmail(child.childLoginEmail())) {
            return;
        }
        User user = new User();
        user.setName(child.name());
        user.setEmail(child.childLoginEmail());
        user.setPassword(passwordEncoder.encode(generatedPassword));
        user.setCpf(null);
        user.setBirthDate(child.birthDate());
        user.setUserType(UserType.ALUNO_CREDENCIADO);
        user.setPlanType(PlanType.PESSOA_JURIDICA);
        user.setAddress(new Address());
        userRepository.save(user);
    }

    private User requireResponsible(Long id) {
        requireCurrentSchool();
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Responsavel nao encontrado"));
        if (user.getUserType() != UserType.RESPONSAVEL) {
            throw new BusinessException("Usuario nao e responsavel");
        }
        return user;
    }

    private List<Child> studentsFor(School school) {
        List<Child> bySchoolId = childRepository.findBySchoolId(school.getId());
        if (!bySchoolId.isEmpty()) {
            return bySchoolId;
        }
        return childRepository.findBySchoolLinkedTrueAndSchoolName(school.getName());
    }

    private Child findStudentInSchool(Long id, School school) {
        Child child = childRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Aluno nao encontrado"));
        boolean sameSchoolId = child.getSchool() != null && Objects.equals(child.getSchool().getId(), school.getId());
        boolean legacySameName = child.getSchoolName() != null && child.getSchoolName().equals(school.getName());
        if (!child.isSchoolLinked() || (!sameSchoolId && !legacySameName)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Aluno nao pertence a esta escola");
        }
        return child;
    }

    private static boolean matchesQuery(User u, String q, String digits) {
        if (u.getName() != null && u.getName().toLowerCase().contains(q)) return true;
        return !digits.isBlank() && u.getCpf() != null && u.getCpf().contains(digits);
    }

    private static String onlyDigits(String value) {
        if (value == null) return "";
        return value.replaceAll("\\D", "");
    }

    private static String requireEmail(String rawEmail) {
        if (rawEmail == null || rawEmail.isBlank() || !rawEmail.contains("@")) {
            throw new BusinessException("E-mail invalido");
        }
        return rawEmail.trim().toLowerCase();
    }

    private static ResponsibleSummaryResponse toSummary(User u) {
        return new ResponsibleSummaryResponse(
                u.getId(),
                u.getName(),
                u.getEmail(),
                u.getCpf(),
                u.getPhone()
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

    private TeacherResponse toTeacherResponse(Teacher teacher, String generatedPassword) {
        return new TeacherResponse(
                teacher.getId(),
                teacher.getName(),
                teacher.getEmail(),
                teacher.getSpecialty(),
                teacher.getProfilePhotoUrl(),
                teacher.getAccount() == null ? null : teacher.getAccount().getId(),
                generatedPassword
        );
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

    private LibraryBookResponse toBookResponse(LibraryBook book) {
        String value = book.getFileUrl();
        String fileUrl = value != null && value.startsWith("http")
                ? value
                : "/school/library/books/" + book.getId() + "/file";
        return new LibraryBookResponse(book.getId(), book.getTitle(), fileUrl);
    }

    private String requireBookTitle(String title) {
        if (title == null || title.isBlank()) {
            throw new BusinessException("Titulo do livro e obrigatorio");
        }
        return title.trim();
    }

    private String storeLibraryPdf(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new BusinessException("Anexe um arquivo PDF");
        }
        if (file.getSize() > 10 * 1024 * 1024) {
            throw new BusinessException("O PDF deve ter no maximo 10MB");
        }
        String originalName = Optional.ofNullable(file.getOriginalFilename()).orElse("");
        String contentType = Optional.ofNullable(file.getContentType()).orElse("");
        boolean pdfName = originalName.toLowerCase(Locale.ROOT).endsWith(".pdf");
        boolean pdfType = contentType.equalsIgnoreCase("application/pdf") || contentType.isBlank();
        if (!pdfName || !pdfType) {
            throw new BusinessException("Envie somente arquivos PDF");
        }

        String safeBase = originalName.replaceAll("[^A-Za-z0-9._-]", "_");
        if (safeBase.isBlank() || safeBase.equals(".pdf")) {
            safeBase = "livro.pdf";
        }
        String storedFileName = UUID.randomUUID() + "-" + safeBase;
        try {
            Path uploadPath = libraryUploadPath();
            Files.createDirectories(uploadPath);
            Files.copy(file.getInputStream(), uploadPath.resolve(storedFileName), StandardCopyOption.REPLACE_EXISTING);
            return storedFileName;
        } catch (IOException e) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Nao foi possivel salvar o PDF");
        }
    }

    private Path libraryUploadPath() {
        return Path.of(libraryUploadDir).toAbsolutePath().normalize();
    }

    public record LibraryBookFile(Resource resource, String filename) {
    }

    private static String formatCpf(String cpf) {
        String d = onlyDigits(cpf);
        if (d.length() != 11) return cpf;
        return d.replaceAll("(\\d{3})(\\d{3})(\\d{3})(\\d{2})", "$1.$2.$3-$4");
    }

    private static String generatePassword() {
        String chars = "ABCDEFGHJKMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789";
        StringBuilder builder = new StringBuilder(10);
        Random random = new Random();
        for (int i = 0; i < 10; i++) {
            builder.append(chars.charAt(random.nextInt(chars.length())));
        }
        return builder.toString();
    }
}
