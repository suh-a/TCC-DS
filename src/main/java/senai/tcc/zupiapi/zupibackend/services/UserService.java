package senai.tcc.zupiapi.zupibackend.services;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;
import senai.tcc.zupiapi.zupibackend.dto.LoginDTO;
import senai.tcc.zupiapi.zupibackend.dto.mapper.UserMapper;
import senai.tcc.zupiapi.zupibackend.dto.request.UserRequest;
import senai.tcc.zupiapi.zupibackend.dto.response.UserResponse;
import senai.tcc.zupiapi.zupibackend.exceptions.BusinessException;
import senai.tcc.zupiapi.zupibackend.exceptions.ResourceNotFoundException;
import senai.tcc.zupiapi.zupibackend.model.School;
import senai.tcc.zupiapi.zupibackend.model.User;
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

    private final PasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    public List<UserResponse> findAll() {
        return userMapper.toResponseList(userRepository.findAll());
    }

    public UserResponse findById(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id " + id));

        return userMapper.toResponse(user);
    }

    public UserResponse findByEmail(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with email " + email));

        return userMapper.toResponse(user);
    }

    public UserResponse save(UserRequest user) {

        if (userRepository.existsByEmail(user.email())) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Email já cadastrado"
            );
        }

        UserType type = user.userType() != null ? user.userType() : UserType.PESSOA_FISICA;

        User userEntity = userMapper.toEntity(user);
        userEntity.setPassword(passwordEncoder.encode(user.password()));
        userEntity.setUserType(type);

        if (type == UserType.PESSOA_JURIDICA) {
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

    public UserResponse update(Long id, UserRequest user) {
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
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Usuário não encontrado"));
        if (userRepository.existsByEmail(newEmail) && !Objects.equals(user.getEmail(), newEmail)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "E-mail já cadastrado");
        }
        user.setEmail(newEmail);
        return userMapper.toResponse(userRepository.save(user));
    }

    public void updatePassword(Long id, String currentPassword, String newPassword) {
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
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Usuário não encontrado"));
        user.setTwoFactorEnabled(enabled);
        return userMapper.toResponse(userRepository.save(user));
    }

    public UserResponse login(LoginDTO user) {
        try {
            User userEntity = userRepository.findByEmail(user.email())
                    .orElseThrow(() -> new RuntimeException());

            if (!passwordEncoder.matches(user.password(), userEntity.getPassword())) {
                throw new RuntimeException();
            }

            UserResponse response = userMapper.toResponse(userEntity);
            return response;

        } catch (Exception e) {
            throw new ResponseStatusException(
                    HttpStatus.UNAUTHORIZED,
                    "Email ou senha inválidos"
            );
        }
    }

    private static String onlyDigits(String value) {
        if (value == null) return "";
        return value.replaceAll("\\D", "");
    }
}
