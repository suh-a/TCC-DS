package senai.tcc.zupiapi.zupibackend.services;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import senai.tcc.zupiapi.zupibackend.model.enums.UserType;
import senai.tcc.zupiapi.zupibackend.security.services.AccessControlService;
import senai.tcc.zupiapi.zupibackend.security.SecurityUtils;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;
import senai.tcc.zupiapi.zupibackend.dto.ChildLoginResponse;
import senai.tcc.zupiapi.zupibackend.dto.ChildRegistrationResponse;
import senai.tcc.zupiapi.zupibackend.dto.mapper.ChildMapper;
import senai.tcc.zupiapi.zupibackend.security.jwt.JwtUtil;
import senai.tcc.zupiapi.zupibackend.dto.request.ChildLoginDTO;
import senai.tcc.zupiapi.zupibackend.dto.request.ChildRequest;
import senai.tcc.zupiapi.zupibackend.dto.response.ChildResponse;
import senai.tcc.zupiapi.zupibackend.exceptions.BusinessException;
import senai.tcc.zupiapi.zupibackend.exceptions.DataBaseExceptions;
import senai.tcc.zupiapi.zupibackend.exceptions.ResourceNotFoundException;
import senai.tcc.zupiapi.zupibackend.model.Child;
import senai.tcc.zupiapi.zupibackend.model.School;
import senai.tcc.zupiapi.zupibackend.model.User;
import senai.tcc.zupiapi.zupibackend.repositories.ChildRepository;
import senai.tcc.zupiapi.zupibackend.repositories.UserRepository;

import java.time.LocalDate;
import java.time.Period;
import java.util.List;
import java.util.Random;

@Service
public class ChildService {

    @Autowired
    private ChildRepository childRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ChildMapper childMapper;

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private AccessControlService accessControl;

    public List<ChildResponse> findAll() {
        return childMapper.toResponseList(childRepository.findAll());
    }

    public ChildResponse findById(Long id) {
        accessControl.ensureCanAccessChild(id);
        Child child = childRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Child not found"));

        return childMapper.toResponse(child);
    }

    public ChildLoginResponse login(ChildLoginDTO childLogin) {
        Child child = childRepository.findByChildLoginEmail(childLogin.email())
                .orElseThrow(() -> new ResourceNotFoundException("Credenciais infantis inválidas"));

        if (!passwordEncoder.matches(childLogin.password(), child.getChildPasswordHash())) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Credenciais infantis inválidas");
        }

        UserType type = child.isSchoolLinked() ? UserType.ALUNO_CREDENCIADO : UserType.CRIANCA;
        String token = jwtUtil.generateToken(child.getChildLoginEmail(), child.getId(), type);
        return new ChildLoginResponse(token, childMapper.toResponse(child));
    }

    public void validateAgeChild(Child child) {
        if (child.getBirthDate() == null) {
            throw new BusinessException("Informe a data de nascimento da criança");
        }
        int age = Period.between(child.getBirthDate(), LocalDate.now()).getYears();
        child.setAge(age);
        if (age < 5 || age > 25) {
            throw new BusinessException("A idade deve estar entre 5 e 25 anos (conforme data de nascimento)");
        }
    }

    public ChildRegistrationResponse saveForSchool(ChildRequest childRequest) {
        return saveForSchool(childRequest, null);
    }

    public ChildRegistrationResponse saveForSchool(ChildRequest childRequest, School school) {
        if (!SecurityUtils.hasRole(UserType.ESCOLA.name())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Acesso restrito à escola");
        }
        User user = userRepository.findById(childRequest.responsibleId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Child child = childMapper.toEntity(childRequest);
        if (childRequest.cpf() != null) {
            child.setCpf(normalizeCpf(childRequest.cpf()));
        }
        child.setSchoolLinked(childRequest.schoolLinked());
        child.setSchoolName(childRequest.schoolName());
        child.setSchool(school);
        validateCpf(child.getCpf());
        validateAgeChild(child);
        child.setResponsible(user);

        ChildCredentials credentials = generateChildCredentials(child.getName(), child.getBirthDate());
        String generatedPassword = credentials.password();
        child.setChildLoginEmail(credentials.email());
        child.setChildPasswordHash(passwordEncoder.encode(generatedPassword));
        child.setOnboardingCompleted(false);

        Child savedChild = childRepository.save(child);
        return new ChildRegistrationResponse(childMapper.toResponse(savedChild), generatedPassword);
    }

    private String normalizeCpf(String cpf) {
        if (cpf == null) return null;
        return cpf.replaceAll("\\D", "");
    }

    private void validateCpf(String cpf) {
        if (cpf == null || cpf.isBlank()) {
            throw new BusinessException("CPF é obrigatório");
        }
        if (cpf.length() != 11) {
            throw new BusinessException("CPF inválido");
        }
    }

    public ChildRegistrationResponse save(ChildRequest childRequest) {
        accessControl.requireUserId(childRequest.responsibleId());
        User user = userRepository.findById(childRequest.responsibleId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Child child = childMapper.toEntity(childRequest);
        if (childRequest.age() != null) {
            child.setAge(childRequest.age());
        }
        if (childRequest.cpf() != null) {
            child.setCpf(normalizeCpf(childRequest.cpf()));
        }
        child.setSchoolLinked(childRequest.schoolLinked());
        child.setSchoolName(childRequest.schoolName());
        validateCpf(child.getCpf());
        validateAgeChild(child);

        child.setResponsible(user);

        ChildCredentials credentials = generateChildCredentials(child.getName(), child.getBirthDate());
        String generatedPassword = credentials.password();
        child.setChildLoginEmail(credentials.email());
        child.setChildPasswordHash(passwordEncoder.encode(generatedPassword));
        child.setOnboardingCompleted(false);

        Child savedChild = childRepository.save(child);
        return new ChildRegistrationResponse(childMapper.toResponse(savedChild), generatedPassword);
    }

    public ChildResponse update(Long id, ChildRequest childRequest) {
        accessControl.ensureCanAccessChild(id);
        Child child = childRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Child not found"));

        child.setName(childRequest.name());
        if (childRequest.age() != null) {
            child.setAge(childRequest.age());
        }
        if (childRequest.cpf() != null) {
            child.setCpf(normalizeCpf(childRequest.cpf()));
            validateCpf(child.getCpf());
        }
        child.setBirthDate(childRequest.birthDate());
        child.setSchoolClass(childRequest.schoolClass());
        child.setCondition(childRequest.condition());
        child.setSchoolLinked(childRequest.schoolLinked());
        child.setSchoolName(childRequest.schoolName());
        validateAgeChild(child);

        return childMapper.toResponse(childRepository.save(child));
    }

    private ChildCredentials generateChildCredentials(String name, LocalDate birthDate) {
        String normalized = name == null ? "crianca" : name.toLowerCase().replaceAll("[^a-z0-9]", "");
        String prefix = normalized.isBlank() ? "crianca" : normalized.split(" ")[0];
        String suffix = birthDate != null ? String.valueOf(birthDate.getYear()) : String.valueOf(new Random().nextInt(9999));
        String baseEmail = String.format("%s.%s@zupi-kids.app", prefix, suffix).replaceAll("\\.+", ".");
        String email = baseEmail;
        int attempts = 0;
        while (childRepository.findByChildLoginEmail(email).isPresent() || userRepository.existsByEmail(email)) {
            attempts++;
            email = String.format("%s.%s.%04d@zupi-kids.app", prefix, suffix, new Random().nextInt(10000));
            if (attempts > 20) {
                email = String.format("%s.%s.%d@zupi-kids.app", prefix, suffix, System.currentTimeMillis());
                break;
            }
        }

        String password = generatePassword();
        return new ChildCredentials(email, password);
    }

    private String generatePassword() {
        String chars = "ABCDEFGHJKMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789";
        StringBuilder builder = new StringBuilder(10);
        Random random = new Random();
        for (int i = 0; i < 10; i++) {
            builder.append(chars.charAt(random.nextInt(chars.length())));
        }
        return builder.toString();
    }

    private static record ChildCredentials(String email, String password) {
    }

    public void delete(Long id) {
        accessControl.ensureCanAccessChild(id);
        try {
            childRepository.deleteById(id);
        }catch(DataIntegrityViolationException e){
            throw new DataBaseExceptions("Error deleting child");
        }
    }

    public List<ChildResponse> findByResponsibleId(Long id) {
        accessControl.requireUserId(id);
        List<Child> list = childRepository.findByResponsibleId(id);

        return childMapper.toResponseList(list);
    }

    public List<ChildResponse> findForCurrentResponsible() {
        if (SecurityUtils.isChildAccount()) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Endpoint disponível apenas para responsáveis");
        }
        return findByResponsibleId(SecurityUtils.getCurrentUserId());
    }

}
