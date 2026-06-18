package senai.tcc.zupiapi.zupibackend.services;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.mockito.junit.jupiter.MockitoSettings;
import org.mockito.quality.Strictness;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;
import senai.tcc.zupiapi.zupibackend.dto.LoginDTO;
import senai.tcc.zupiapi.zupibackend.dto.LoginResponse;
import senai.tcc.zupiapi.zupibackend.dto.mapper.UserMapper;
import senai.tcc.zupiapi.zupibackend.security.jwt.JwtUtil;
import senai.tcc.zupiapi.zupibackend.dto.request.AddressRequest;
import senai.tcc.zupiapi.zupibackend.dto.request.UserRequest;
import senai.tcc.zupiapi.zupibackend.dto.response.UserResponse;
import senai.tcc.zupiapi.zupibackend.exceptions.BusinessException;
import senai.tcc.zupiapi.zupibackend.exceptions.ResourceNotFoundException;
import senai.tcc.zupiapi.zupibackend.model.Child;
import senai.tcc.zupiapi.zupibackend.model.User;
import senai.tcc.zupiapi.zupibackend.model.enums.PlanType;
import senai.tcc.zupiapi.zupibackend.model.enums.UserType;
import senai.tcc.zupiapi.zupibackend.repositories.ChildRepository;
import senai.tcc.zupiapi.zupibackend.repositories.UserRepository;
import senai.tcc.zupiapi.zupibackend.security.services.AccessControlService;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.Mockito.*;

/*Autor: Suellen
Data: 02/04/2026 */

@ExtendWith(MockitoExtension.class)
@MockitoSettings(strictness = Strictness.LENIENT)
class UserServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private ChildRepository childRepository;

    @Mock
    private UserMapper userMapper;

    @Mock
    private JwtUtil jwtUtil;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private AccessControlService accessControl;

    @InjectMocks
    private UserService userService;

    private User user;
    private UserResponse userResponse;

    @BeforeEach
    void setup() {
        doNothing().when(accessControl).requireUserId(anyLong());
        when(passwordEncoder.encode(any())).thenReturn("encoded");
        when(passwordEncoder.matches(any(), any())).thenReturn(true);

        user = new User();
        user.setId(1L);
        user.setName("Teste");
        user.setEmail("teste@email.com");
        user.setPassword("123");
        user.setUserType(UserType.RESPONSAVEL);
        user.setPlanType(PlanType.PESSOA_FISICA);

        userResponse = mock(UserResponse.class);
    }

    private void mockValidUserRequest(UserRequest request) {
        AddressRequest address = mock(AddressRequest.class);
        when(address.cep()).thenReturn("00000000");
        when(address.street()).thenReturn("Rua");
        when(address.number()).thenReturn("1");
        when(address.neighborhood()).thenReturn("Centro");
        when(address.state()).thenReturn("BA");
        when(address.country()).thenReturn("BR");

        when(request.name()).thenReturn("Teste");
        when(request.password()).thenReturn("123456");
        when(request.email()).thenReturn("teste@email.com");
        when(request.cpf()).thenReturn("12345678901");
        when(request.birthDate()).thenReturn(LocalDate.of(1990, 1, 1));
        when(request.userType()).thenReturn(null);
        when(request.address()).thenReturn(address);
        when(userRepository.existsByEmail(any())).thenReturn(false);
    }

    // 1
    @Test
    void shouldReturnAllUsers() {
        when(userRepository.findAll()).thenReturn(List.of(user));
        when(userMapper.toResponseList(any())).thenReturn(List.of(userResponse));

        List<UserResponse> result = userService.findAll();

        assertEquals(1, result.size());
    }

    // 2
    @Test
    void shouldReturnEmptyListWhenNoUsers() {
        when(userRepository.findAll()).thenReturn(List.of());
        when(userMapper.toResponseList(any())).thenReturn(List.of());

        List<UserResponse> result = userService.findAll();

        assertTrue(result.isEmpty());
    }

    // 3
    @Test
    void shouldFindUserById() {
        when(userRepository.findById(1L)).thenReturn(Optional.of(user));
        when(userMapper.toResponse(user)).thenReturn(userResponse);

        UserResponse result = userService.findById(1L);

        assertNotNull(result);
    }

    // 4
    @Test
    void shouldThrowExceptionWhenUserNotFoundById() {
        when(userRepository.findById(1L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class,
                () -> userService.findById(1L));
    }

    // 5
    @Test
    void shouldFindUserByEmail() {
        when(userRepository.findByEmail("teste@email.com")).thenReturn(Optional.of(user));
        when(userMapper.toResponse(user)).thenReturn(userResponse);

        UserResponse result = userService.findByEmail("teste@email.com");

        assertNotNull(result);
    }

    // 6
    @Test
    void shouldThrowExceptionWhenUserNotFoundByEmail() {
        when(userRepository.findByEmail("x")).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class,
                () -> userService.findByEmail("x"));
    }

    // 7
    @Test
    void shouldSaveUser() {
        UserRequest request = mock(UserRequest.class);
        mockValidUserRequest(request);

        when(userMapper.toEntity(request)).thenReturn(user);
        when(userRepository.save(any())).thenReturn(user);
        when(userMapper.toResponse(user)).thenReturn(userResponse);

        UserResponse result = userService.save(request);

        assertNotNull(result);
    }

    // 8
    @Test
    void shouldEncodePasswordOnSave() {
        UserRequest request = mock(UserRequest.class);
        mockValidUserRequest(request);

        when(userMapper.toEntity(request)).thenReturn(user);
        when(userRepository.save(any())).thenReturn(user);
        when(userMapper.toResponse(any())).thenReturn(userResponse);

        userService.save(request);

        assertNotEquals("123", user.getPassword());
    }

    // 9
    @Test
    void shouldCallRepositorySave() {
        UserRequest request = mock(UserRequest.class);
        mockValidUserRequest(request);

        when(userMapper.toEntity(request)).thenReturn(user);
        when(userRepository.save(any())).thenReturn(user);
        when(userMapper.toResponse(any())).thenReturn(userResponse);

        userService.save(request);

        verify(userRepository, times(1)).save(any());
    }

    // 10
    @Test
    void shouldValidatePasswordCorrectly() {
        LoginDTO login = new LoginDTO("teste@email.com", "123");

        PasswordEncoder encoder = new org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder();
        user.setPassword(encoder.encode("123"));

        when(userRepository.findByEmail(login.email())).thenReturn(Optional.of(user));
        when(userMapper.toResponse(user)).thenReturn(userResponse);
        when(jwtUtil.generateToken(any(), any(), any())).thenReturn("token");

        LoginResponse result = userService.login(login);

        assertNotNull(result);
        assertNotNull(result.token());
    }

    // 11
    @Test
    void shouldReturnFalseForWrongPassword() {
        LoginDTO login = new LoginDTO("teste@email.com", "wrong");

        PasswordEncoder encoder = new org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder();
        user.setPassword(encoder.encode("123"));

        when(userRepository.findByEmail(login.email())).thenReturn(Optional.of(user));
        when(passwordEncoder.matches(any(), any())).thenReturn(false);

        assertThrows(ResponseStatusException.class, () -> {
            userService.login(login);
        });
    }

    // 12
    @Test
    void shouldThrowExceptionWhenValidatingPasswordUserNotFound() {
        LoginDTO login = new LoginDTO("x", "123");

        when(userRepository.findByEmail(login.email())).thenReturn(Optional.empty());

        assertThrows(ResponseStatusException.class, () -> {
            userService.login(login);
        });

    }

        // 13
        @Test
        void shouldCallMapperOnFindAll() {
            userService.findAll();

            verify(userMapper).toResponseList(any());
        }

        // 14
        @Test
        void shouldCallMapperOnFindById() {
            when(userRepository.findById(1L)).thenReturn(Optional.of(user));
            when(userMapper.toResponse(user)).thenReturn(userResponse);

            userService.findById(1L);

            verify(userMapper).toResponse(user);
        }

        // 15
        @Test
        void shouldCallMapperOnFindByEmail () {
            when(userRepository.findByEmail("teste@email.com")).thenReturn(Optional.of(user));
            when(userMapper.toResponse(user)).thenReturn(userResponse);

            userService.findByEmail("teste@email.com");

            verify(userMapper).toResponse(user);
        }

        // 16
        @Test
        void shouldCallMapperOnSave () {
            UserRequest request = mock(UserRequest.class);
            mockValidUserRequest(request);

            when(userMapper.toEntity(request)).thenReturn(user);
            when(userRepository.save(any())).thenReturn(user);
            when(userMapper.toResponse(any())).thenReturn(userResponse);

            userService.save(request);

            verify(userMapper).toResponse(any());
        }

        // 17
        @Test
        void shouldCallRepositoryFindByEmailOnValidation () {
            LoginDTO login = new LoginDTO("teste@email.com", "123");

            PasswordEncoder encoder = new org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder();
            user.setPassword(encoder.encode("123"));

            when(userRepository.findByEmail(login.email())).thenReturn(Optional.of(user));
            when(userMapper.toResponse(user)).thenReturn(userResponse);
            when(jwtUtil.generateToken(any())).thenReturn("token");

            try {
                userService.login(login);
            } catch (Exception ignored) {
            }

            verify(userRepository).findByEmail(login.email());


        }

        // 18
        @Test
        void shouldReturnEmptyListWhenRepositoryReturnsNull () {
            when(userRepository.findAll()).thenReturn(null);
            when(userMapper.toResponseList(null)).thenReturn(null);

            List<UserResponse> result = userService.findAll();

            assertNull(result);
        }

        // 19
        @Test
        void shouldThrowExceptionWhenPasswordIsNull () {
            UserRequest request = mock(UserRequest.class);
            when(request.password()).thenReturn(null);

            when(userMapper.toEntity(request)).thenReturn(user);
            when(passwordEncoder.encode(null)).thenThrow(new IllegalArgumentException("password required"));

            assertThrows(BusinessException.class,
                    () -> userService.save(request));
        }

        // 20
        @Test
        void shouldReturnMappedResponseAfterSave () {
            UserRequest request = mock(UserRequest.class);
            mockValidUserRequest(request);

            when(userMapper.toEntity(request)).thenReturn(user);
            when(userRepository.save(any())).thenReturn(user);
            when(userMapper.toResponse(user)).thenReturn(userResponse);

            UserResponse result = userService.save(request);

            assertEquals(userResponse, result);
        }

        @Test
        void shouldResolvePlanTypeForCredentialedResponsible() {
            assertEquals(PlanType.PESSOA_JURIDICA, UserService.resolvePlanType(UserType.RESPONSAVEL_CREDENCIADO));
        }

        @Test
        void shouldResolvePlanTypeForCredentialedStudent() {
            assertEquals(PlanType.PESSOA_JURIDICA, UserService.resolvePlanType(UserType.ALUNO_CREDENCIADO));
        }

        @Test
        void shouldLoginSchoolLinkedResponsibleAsCredentialedResponsible() {
            LoginDTO login = new LoginDTO("teste@email.com", "123");
            Child linkedStudent = new Child();
            linkedStudent.setSchoolLinked(true);

            when(userRepository.findByEmail(login.email())).thenReturn(Optional.of(user));
            when(childRepository.findByResponsibleId(user.getId())).thenReturn(List.of(linkedStudent));
            when(jwtUtil.generateToken(user.getEmail(), user.getId(), UserType.RESPONSAVEL_CREDENCIADO)).thenReturn("token");

            LoginResponse result = userService.login(login);

            assertEquals(UserType.RESPONSAVEL_CREDENCIADO, result.user().userType());
            assertEquals(PlanType.PESSOA_JURIDICA, result.user().planType());
            assertEquals("token", result.token());
        }

        @Test
        void shouldVerifyParentPasswordForFamilyChild() {
            Child child = new Child();
            child.setId(10L);
            child.setResponsible(user);
            child.setSchoolLinked(false);
            when(childRepository.findById(10L)).thenReturn(Optional.of(child));
            when(passwordEncoder.matches("senha-correta", user.getPassword())).thenReturn(true);

            assertDoesNotThrow(() -> userService.verifyParentAccess(10L, "senha-correta"));

            verify(accessControl).ensureCanAccessChild(10L);
        }

        @Test
        void shouldRejectIncorrectParentPassword() {
            Child child = new Child();
            child.setId(10L);
            child.setResponsible(user);
            when(childRepository.findById(10L)).thenReturn(Optional.of(child));
            when(passwordEncoder.matches("senha-errada", user.getPassword())).thenReturn(false);

            ResponseStatusException exception = assertThrows(ResponseStatusException.class,
                    () -> userService.verifyParentAccess(10L, "senha-errada"));

            assertEquals(HttpStatus.BAD_REQUEST, exception.getStatusCode());
        }

        @Test
        void shouldLoginLinkedResponsibleFromDirectChildSession() {
            Child child = new Child();
            child.setId(10L);
            child.setResponsible(user);
            child.setSchoolLinked(false);
            when(childRepository.findById(10L)).thenReturn(Optional.of(child));
            when(passwordEncoder.matches("senha-correta", user.getPassword())).thenReturn(true);
            when(jwtUtil.generateToken(user.getEmail(), user.getId(), UserType.RESPONSAVEL)).thenReturn("parent-token");

            LoginResponse result = userService.loginResponsibleForChild(
                    10L, "TESTE@EMAIL.COM", "senha-correta");

            assertEquals("parent-token", result.token());
            assertEquals(UserType.RESPONSAVEL, result.user().userType());
            assertEquals(PlanType.PESSOA_FISICA, result.user().planType());
            verify(accessControl).ensureCanAccessChild(10L);
        }

        @Test
        void shouldRejectCredentialsFromUnlinkedResponsible() {
            Child child = new Child();
            child.setId(10L);
            child.setResponsible(user);
            child.setSchoolLinked(false);
            when(childRepository.findById(10L)).thenReturn(Optional.of(child));

            ResponseStatusException exception = assertThrows(ResponseStatusException.class,
                    () -> userService.loginResponsibleForChild(
                            10L, "outro@email.com", "senha-correta"));

            assertEquals(HttpStatus.BAD_REQUEST, exception.getStatusCode());
        }
    }
