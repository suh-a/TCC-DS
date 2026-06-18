package senai.tcc.zupiapi.zupibackend.services;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;
import senai.tcc.zupiapi.zupibackend.dto.LoginDTO;
import senai.tcc.zupiapi.zupibackend.dto.LoginResponse;
import senai.tcc.zupiapi.zupibackend.dto.mapper.UserMapper;
import senai.tcc.zupiapi.zupibackend.dto.request.UserRequest;
import senai.tcc.zupiapi.zupibackend.dto.response.UserResponse;
import senai.tcc.zupiapi.zupibackend.exceptions.BusinessException;
import senai.tcc.zupiapi.zupibackend.exceptions.ResourceNotFoundException;
import senai.tcc.zupiapi.zupibackend.model.Address;
import senai.tcc.zupiapi.zupibackend.model.Child;
import senai.tcc.zupiapi.zupibackend.model.School;
import senai.tcc.zupiapi.zupibackend.model.User;
import senai.tcc.zupiapi.zupibackend.model.enums.PlanType;
import senai.tcc.zupiapi.zupibackend.model.enums.UserType;
import senai.tcc.zupiapi.zupibackend.repositories.ChildRepository;
import senai.tcc.zupiapi.zupibackend.repositories.SchoolRepository;
import senai.tcc.zupiapi.zupibackend.repositories.UserRepository;
import senai.tcc.zupiapi.zupibackend.security.SecurityUtils;
import senai.tcc.zupiapi.zupibackend.security.jwt.JwtUtil;
import senai.tcc.zupiapi.zupibackend.security.services.AccessControlService;

import java.util.List;
import java.util.Objects;
import java.util.UUID;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ChildRepository childRepository;

    @Autowired
    private UserMapper userMapper;

    @Autowired
    private SchoolRepository schoolRepository;

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private AccessControlService accessControl;

    @Autowired
    private GoogleAuthService googleAuthService;

    public List<UserResponse> findAll() {
        return userMapper.toResponseList(userRepository.findAll());
    }

    public UserResponse findById(Long id) {
        accessControl.requireUserId(id);
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario nao encontrado com id " + id));

        return userMapper.toResponse(user);
    }

    public UserResponse getCurrentUser() {
        User user = userRepository.findById(SecurityUtils.getCurrentUserId())
                .orElseThrow(() -> new ResourceNotFoundException("Usuario nao encontrado"));
        UserType effectiveType = effectiveUserType(user);
        return toEffectiveResponse(user, effectiveType);
    }

    public UserResponse findByEmail(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario nao encontrado com e-mail " + email));

        return userMapper.toResponse(user);
    }

    public UserResponse save(UserRequest user) {
        validateRequiredRegistrationFields(user);

        var googlePayload = hasText(user.googleToken()) ? googleAuthService.requireValidPayload(user.googleToken()) : null;
        String normalizedEmail = GoogleAuthService.normalizeEmail(user.email());
        if (googlePayload != null && !GoogleAuthService.normalizeEmail(googlePayload.getEmail()).equals(normalizedEmail)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "E-mail do Google nao confere com o cadastro");
        }

        UserType type = user.userType() != null ? user.userType() : UserType.RESPONSAVEL;
        PlanType planType = resolvePlanType(type);

        if (userRepository.existsByEmailIgnoreCase(normalizedEmail)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "E-mail ja cadastrado");
        }

        User userEntity = userMapper.toEntity(user);
        String password = hasText(user.password()) ? user.password() : UUID.randomUUID().toString();
        userEntity.setPassword(passwordEncoder.encode(password));
        userEntity.setEmail(normalizedEmail);
        userEntity.setUserType(type);
        userEntity.setPlanType(planType);
        userEntity.setPhone(normalizePhone(user.phone()));
        userEntity.setAddress(toAddress(user));
        if (googlePayload != null) {
            userEntity.setGoogleAccount(true);
            userEntity.setGoogleId(googlePayload.getSubject());
            userEntity.setProvider("GOOGLE");
            String picture = (String) googlePayload.get("picture");
            if (picture != null && !picture.isBlank()) {
                userEntity.setProfilePhotoUrl(picture);
            }
        }

        if (type == UserType.ESCOLA) {
            userEntity = saveSchoolAccount(user, userEntity);
        } else {
            userEntity = saveResponsibleAccount(user, userEntity);
        }

        return userMapper.toResponse(userEntity);
    }

    public LoginResponse login(LoginDTO user) {
        try {
            var childMatch = childRepository == null ? null : childRepository.findByChildLoginEmail(user.email());
            Child child = childMatch == null ? null : childMatch.orElse(null);
            if (child != null) {
                if (!passwordEncoder.matches(user.password(), child.getChildPasswordHash())) {
                    throw new RuntimeException();
                }
                UserType type = child.isSchoolLinked() ? UserType.ALUNO_CREDENCIADO : UserType.CRIANCA;
                UserResponse response = new UserResponse(
                        child.getId(),
                        child.getName(),
                        child.getChildLoginEmail(),
                        child.getCpf(),
                        null,
                        null,
                        type,
                        child.isSchoolLinked() ? PlanType.PESSOA_JURIDICA : PlanType.PESSOA_FISICA,
                        true,
                        false,
                        child.getProfilePhotoUrl()
                );
                String token = jwtUtil.generateToken(child.getChildLoginEmail(), child.getId(), type);
                return new LoginResponse(token, response);
            }

            User userEntity = userRepository.findByEmail(user.email())
                    .orElseThrow(() -> new RuntimeException());

            if (!passwordEncoder.matches(user.password(), userEntity.getPassword())) {
                throw new RuntimeException();
            }

            UserType effectiveType = effectiveUserType(userEntity);
            UserResponse response = toEffectiveResponse(userEntity, effectiveType);
            String token = jwtUtil.generateToken(userEntity.getEmail(), userEntity.getId(), effectiveType);
            return new LoginResponse(token, response);
        } catch (ResponseStatusException e) {
            throw e;
        } catch (Exception e) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Email ou senha invalidos");
        }
    }

    public UserResponse update(Long id, UserRequest user) {
        accessControl.requireUserId(id);
        User userEntity = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario nao encontrado"));

        if (user.password() != null && !user.password().isBlank() && !user.password().startsWith("*")) {
            userEntity.setPassword(passwordEncoder.encode(user.password()));
        }
        if (user.email() != null && !user.email().isBlank()) {
            userEntity.setEmail(user.email());
        }
        if (user.name() != null && !user.name().isBlank()) {
            userEntity.setName(user.name());
        }
        if (user.cpf() != null && !user.cpf().isBlank()) {
            userEntity.setCpf(onlyDigits(user.cpf()));
        }
        if (user.userType() != null) {
            userEntity.setUserType(user.userType());
        }

        userEntity = saveUser(userEntity);

        return userMapper.toResponse(userEntity);
    }

    public UserResponse updateEmail(Long id, String newEmail) {
        accessControl.requireUserId(id);
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario nao encontrado"));
        if (userRepository.existsByEmail(newEmail) && !Objects.equals(user.getEmail(), newEmail)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "E-mail ja cadastrado");
        }
        user.setEmail(newEmail);
        return userMapper.toResponse(saveUser(user));
    }

    public void updatePassword(Long id, String currentPassword, String newPassword) {
        accessControl.requireUserId(id);
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario nao encontrado"));
        if (!passwordEncoder.matches(currentPassword, user.getPassword())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Senha atual incorreta");
        }
        resetPasswordDirect(id, newPassword);
    }

    public void verifyParentAccess(Long childId, String password) {
        Child child = childRepository.findById(childId)
                .orElseThrow(() -> new ResourceNotFoundException("Crianca nao encontrada"));
        if (child.isSchoolLinked()) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Recurso disponivel apenas no plano familiar");
        }

        accessControl.ensureCanAccessChild(childId);
        User responsible = child.getResponsible();
        if (responsible == null || !passwordEncoder.matches(password, responsible.getPassword())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Senha do responsavel incorreta");
        }
    }

    public void resetPasswordDirect(Long id, String newPassword) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario nao encontrado"));
        user.setPassword(passwordEncoder.encode(newPassword));
        saveUser(user);
    }

    public UserResponse setTwoFactor(Long id, boolean enabled) {
        accessControl.requireUserId(id);
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario nao encontrado"));
        user.setTwoFactorEnabled(enabled);
        return userMapper.toResponse(saveUser(user));
    }

    static PlanType resolvePlanType(UserType userType) {
        return switch (userType) {
            case ESCOLA, DOCENTE, ALUNO_CREDENCIADO, RESPONSAVEL_CREDENCIADO -> PlanType.PESSOA_JURIDICA;
            default -> PlanType.PESSOA_FISICA;
        };
    }

    private UserType effectiveUserType(User user) {
        if (user.getUserType() == UserType.RESPONSAVEL
                && childRepository != null
                && childRepository.findByResponsibleId(user.getId()).stream().anyMatch(Child::isSchoolLinked)) {
            return UserType.RESPONSAVEL_CREDENCIADO;
        }
        return user.getUserType();
    }

    private UserResponse toEffectiveResponse(User user, UserType effectiveType) {
        return new UserResponse(
                user.getId(),
                user.getName(),
                user.getEmail(),
                user.getCpf(),
                user.getPhone(),
                user.getAddress() != null ? user.getAddress().toString() : null,
                effectiveType,
                resolvePlanType(effectiveType),
                user.isActive(),
                user.isTwoFactorEnabled(),
                user.getProfilePhotoUrl()
        );
    }

    private User saveSchoolAccount(UserRequest user, User userEntity) {
        String cnpj = onlyDigits(user.cnpj());
        if (cnpj.length() != 14) {
            throw new BusinessException("CNPJ invalido");
        }
        if (schoolRepository.existsByCnpj(cnpj)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "CNPJ ja cadastrado");
        }

        userEntity.setCpf(null);
        userEntity = saveUser(userEntity);

        School school = new School();
        school.setName(user.name());
        school.setCnpj(cnpj);
        school.setEmail(user.email());
        school.setAccount(userEntity);
        schoolRepository.save(school);

        return userEntity;
    }

    private User saveResponsibleAccount(UserRequest user, User userEntity) {
        String cpf = onlyDigits(user.cpf());
        if (cpf.length() != 11) {
            throw new BusinessException("CPF invalido");
        }

        userEntity.setCpf(cpf);
        userEntity.setBirthDate(user.birthDate());
        if (userEntity.getBirthDate() == null) {
            throw new BusinessException("Data de nascimento e obrigatoria");
        }

        return saveUser(userEntity);
    }

    private void validateRequiredRegistrationFields(UserRequest user) {
        if (user == null) {
            throw new BusinessException("Dados de cadastro obrigatorios");
        }
        if (!hasText(user.name())) {
            throw new BusinessException("Nome e obrigatorio");
        }
        if (!hasText(user.email())) {
            throw new BusinessException("E-mail e obrigatorio");
        }
        if (!hasText(user.googleToken()) && (user.password() == null || user.password().length() < 6)) {
            throw new BusinessException("Senha deve ter no minimo 6 caracteres");
        }
        if (user.address() == null) {
            throw new BusinessException("Endereco e obrigatorio");
        }
    }

    private Address toAddress(UserRequest user) {
        Address address = new Address();
        address.setCep(normalizeCep(user.address().cep()));
        address.setStreet(user.address().street());
        address.setNumber(normalizeAddressNumber(user.address().number()));
        address.setNeighborhood(user.address().neighborhood());
        address.setState(user.address().state());
        address.setCountry(user.address().country());
        return address;
    }

    private User saveUser(User user) {
        try {
            return userRepository.save(user);
        } catch (DataIntegrityViolationException ex) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Ja existe um cadastro com estes dados");
        }
    }

    private static String onlyDigits(String value) {
        if (value == null) return "";
        return value.replaceAll("\\D", "");
    }

    private static String normalizePhone(String value) {
        String phone = onlyDigits(value);
        if (phone.isBlank()) return null;
        if (phone.length() < 10 || phone.length() > 11) {
            throw new BusinessException("Telefone invalido");
        }
        return phone;
    }

    private static String normalizeCep(String value) {
        String cep = onlyDigits(value);
        if (cep.length() != 8) {
            throw new BusinessException("CEP invalido");
        }
        return cep;
    }

    private static String normalizeAddressNumber(String value) {
        String number = onlyDigits(value);
        if (number.isBlank() || number.length() > 10) {
            throw new BusinessException("Numero do endereco invalido");
        }
        return number;
    }

    private static boolean hasText(String value) {
        return value != null && !value.isBlank();
    }
}
