package senai.tcc.zupiapi.zupibackend.services;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import senai.tcc.zupiapi.zupibackend.model.Address;
import senai.tcc.zupiapi.zupibackend.security.services.AccessControlService;
import senai.tcc.zupiapi.zupibackend.security.SecurityUtils;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;
import senai.tcc.zupiapi.zupibackend.dto.LoginDTO;
import senai.tcc.zupiapi.zupibackend.dto.LoginResponse;
import senai.tcc.zupiapi.zupibackend.dto.mapper.UserMapper;
import senai.tcc.zupiapi.zupibackend.security.jwt.JwtUtil;
import senai.tcc.zupiapi.zupibackend.dto.request.UserRequest;
import senai.tcc.zupiapi.zupibackend.dto.response.UserResponse;
import senai.tcc.zupiapi.zupibackend.exceptions.BusinessException;
import senai.tcc.zupiapi.zupibackend.exceptions.ResourceNotFoundException;
import senai.tcc.zupiapi.zupibackend.model.School;
import senai.tcc.zupiapi.zupibackend.model.User;
import senai.tcc.zupiapi.zupibackend.model.enums.PlanType;
import senai.tcc.zupiapi.zupibackend.model.enums.UserType;
import senai.tcc.zupiapi.zupibackend.repositories.SchoolRepository;
import senai.tcc.zupiapi.zupibackend.repositories.UserRepository;

import java.time.LocalDate;
import java.util.List;
import java.util.Objects;


@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

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

    public List<UserResponse> findAll() {
        return userMapper.toResponseList(userRepository.findAll());
    }

    public UserResponse findById(Long id) {
        accessControl.requireUserId(id);
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id " + id));

        return userMapper.toResponse(user);
    }

    public UserResponse getCurrentUser() {
        return findById(SecurityUtils.getCurrentUserId());
    }

    public UserResponse findByEmail(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with email " + email));

        return userMapper.toResponse(user);
    }

    public UserResponse save(UserRequest user) {
        UserType type = user.userType() != null ? user.userType() : UserType.RESPONSAVEL;
        PlanType planType = resolvePlanType(user.planType(), type);

        if (userRepository.existsByEmailAndPlanType(user.email(), planType)) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Email já cadastrado para este plano"
            );
        }

        User userEntity = userMapper.toEntity(user);
        userEntity.setPassword(passwordEncoder.encode(user.password()));
        userEntity.setUserType(type);
        userEntity.setPlanType(planType);
        userEntity.setPhone(user.phone());
        Address address = new Address();
        address.setCep(user.address().cep());
        address.setStreet(user.address().street());
        address.setNumber(user.address().number());
        address.setNeighborhood(user.address().neighborhood());
        address.setState(user.address().state());
        address.setCountry(user.address().country());
        userEntity.setAddress(address);

        if (type == UserType.ESCOLA) {
            String cnpj = onlyDigits(user.cnpj());
            if (cnpj.length() != 14) {
                throw new BusinessException("CNPJ inválido");
            }
            if (schoolRepository.existsByCnpj(cnpj)) {
                throw new ResponseStatusException(HttpStatus.CONFLICT, "CNPJ já cadastrado");
            }
            userEntity.setCpf(null);
            userEntity = userRepository.save(userEntity);

            School school = new School();
            school.setName(user.name());
            school.setCnpj(cnpj);
            school.setEmail(user.email());
            school.setAccount(userEntity);
            schoolRepository.save(school);
        } else {
            String cpf = onlyDigits(user.cpf());
            if (cpf.length() != 11) {
                throw new BusinessException("CPF inválido");
            }
            userEntity.setCpf(cpf);
            userEntity.setBirthDate(user.birthDate());
            if (userEntity.getBirthDate() == null) {
                throw new BusinessException("Data de nascimento é obrigatória");
            }
            userEntity = userRepository.save(userEntity);
        }

        return userMapper.toResponse(userEntity);
    }

    public LoginResponse login(LoginDTO user) {
        try {
            User userEntity = resolveUserForLogin(user.email(), user.planType());

            if (!passwordEncoder.matches(user.password(), userEntity.getPassword())) {
                throw new RuntimeException();
            }

            UserResponse response = userMapper.toResponse(userEntity);
            String token = jwtUtil.generateToken(userEntity.getEmail(), userEntity.getId(), userEntity.getUserType());
            return new LoginResponse(token, response);

        } catch (ResponseStatusException e) {
            throw e;
        } catch (Exception e) {
            throw new ResponseStatusException(
                    HttpStatus.UNAUTHORIZED,
                    "Email ou senha inválidos"
            );
        }
    }

    private User resolveUserForLogin(String email, PlanType planType) {
        if (planType != null) {
            return userRepository.findByEmailAndPlanType(email, planType)
                    .orElseThrow(() -> new RuntimeException());
        }
        List<User> accounts = userRepository.findAllByEmail(email);
        if (accounts.isEmpty()) {
            throw new RuntimeException();
        }
        if (accounts.size() > 1) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Selecione o tipo de conta (Pessoa Física ou Jurídica)."
            );
        }
        return accounts.get(0);
    }

    public UserResponse update(Long id, UserRequest user) {
        accessControl.requireUserId(id);
        User userEntity = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Usuário não encontrado"));

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
            userEntity.setCpf(user.cpf());
        }
        if (user.userType() != null) {
            userEntity.setUserType(user.userType());
        }

        userEntity = userRepository.save(userEntity);

        return userMapper.toResponse(userEntity);
    }

    public UserResponse updateEmail(Long id, String newEmail) {
        accessControl.requireUserId(id);
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Usuário não encontrado"));
        PlanType planType = user.getPlanType() != null
                ? user.getPlanType()
                : (user.getUserType() == UserType.ESCOLA ? PlanType.PESSOA_JURIDICA : PlanType.PESSOA_FISICA);
        if (userRepository.existsByEmailAndPlanType(newEmail, planType)
                && !Objects.equals(user.getEmail(), newEmail)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "E-mail já cadastrado para este plano");
        }
        user.setEmail(newEmail);
        return userMapper.toResponse(userRepository.save(user));
    }

    public void updatePassword(Long id, String currentPassword, String newPassword) {
        accessControl.requireUserId(id);
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Usuário não encontrado"));
        if (!passwordEncoder.matches(currentPassword, user.getPassword())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Senha atual incorreta");
        }
        resetPasswordDirect(id, newPassword);
    }

    public void resetPasswordDirect(Long id, String newPassword) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Usuário não encontrado"));
        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);
    }

    public UserResponse setTwoFactor(Long id, boolean enabled) {
        accessControl.requireUserId(id);
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Usuário não encontrado"));
        user.setTwoFactorEnabled(enabled);
        return userMapper.toResponse(userRepository.save(user));
    }

    static PlanType resolvePlanType(PlanType requestPlanType, UserType userType) {
        if (requestPlanType != null) {
            return requestPlanType;
        }
        return userType == UserType.ESCOLA ? PlanType.PESSOA_JURIDICA : PlanType.PESSOA_FISICA;
    }

    private static String onlyDigits(String value) {
        if (value == null) return "";
        return value.replaceAll("\\D", "");
    }
}
