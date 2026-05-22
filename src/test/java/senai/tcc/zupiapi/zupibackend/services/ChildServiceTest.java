package senai.tcc.zupiapi.zupibackend.services;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Captor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.mockito.junit.jupiter.MockitoSettings;
import org.mockito.quality.Strictness;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.security.crypto.password.PasswordEncoder;
import senai.tcc.zupiapi.zupibackend.security.services.AccessControlService;
import senai.tcc.zupiapi.zupibackend.security.jwt.JwtUtil;

import senai.tcc.zupiapi.zupibackend.dto.mapper.ChildMapper;
import senai.tcc.zupiapi.zupibackend.dto.ChildRegistrationResponse;
import senai.tcc.zupiapi.zupibackend.dto.request.ChildRequest;
import senai.tcc.zupiapi.zupibackend.dto.response.ChildResponse;
import senai.tcc.zupiapi.zupibackend.exceptions.DataBaseExceptions;
import senai.tcc.zupiapi.zupibackend.exceptions.ResourceNotFoundException;
import senai.tcc.zupiapi.zupibackend.model.Child;
import senai.tcc.zupiapi.zupibackend.model.User;
import senai.tcc.zupiapi.zupibackend.repositories.ChildRepository;
import senai.tcc.zupiapi.zupibackend.repositories.UserRepository;

import java.time.LocalDate;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@MockitoSettings(strictness = Strictness.LENIENT)
class ChildServiceTest {

    @InjectMocks
    private ChildService service;

    @Mock
    private ChildRepository childRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private ChildMapper childMapper;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private JwtUtil jwtUtil;

    @Mock
    private AccessControlService accessControl;

    @Captor
    private ArgumentCaptor<Child> childCaptor;

    private Child child;
    private ChildRequest childRequest;
    private ChildResponse childResponse;
    private User user;
    List<Child> childrenList;
    List<ChildResponse> responsesList;

    @BeforeEach
    void setUp() {
        doNothing().when(accessControl).requireUserId(anyLong());
        doNothing().when(accessControl).ensureCanAccessChild(anyLong());

        child = new Child();
        child.setId(1L);
        child.setName("João");
        child.setBirthDate(LocalDate.of(2020, 1, 1));
        child.setSchoolClass("1º Ano");
        child.setCondition("Normal");

        user = new User();
        user.setId(1L);
        user.setName("Pai");

        childRequest = new ChildRequest("João", 8, "12345678901", LocalDate.of(2016, 1, 1), "1º Ano", "Normal", 1L, false, null);

        childResponse = new ChildResponse(1L, "João", LocalDate.of(2020, 1, 1), "1º Ano", "Normal", 8, "12345678901", null, false, null, false, null);

        childrenList = Arrays.asList(child);
        responsesList = Arrays.asList(childResponse);
    }

    /**
     * Teste 1: Verifica se todos os children são retornados corretamente.
     */
    @Test
    void testFindAllSucess() {
        when(childRepository.findAll()).thenReturn(childrenList);
        when(childMapper.toResponseList(childrenList)).thenReturn(responsesList);

        List<ChildResponse> result = service.findAll();

        assertNotNull(result);
        assertEquals(1, result.size());
        verify(childRepository).findAll();
        verify(childMapper).toResponseList(childrenList);
    }

    /**
     * Teste 2: Verifica se lista vazia é retornada quando não há children.
     */
    @Test
    void testFindAllEmptyList() {
        when(childRepository.findAll()).thenReturn(List.of());
        when(childMapper.toResponseList(any())).thenReturn(List.of());

        List<ChildResponse> result = service.findAll();

        assertTrue(result.isEmpty());
    }

    /**
     * Teste 3: Verifica se mapper é chamado uma vez no findAll.
     */
    @Test
    void testFindAllMapperCalledOnce() {
        service.findAll();
        verify(childMapper).toResponseList(any());
    }

    /**
     * Teste 4: Verifica se repository é chamado uma vez no findAll.
     */
    @Test
    void testFindAllRepositoryCalledOnce() {
        service.findAll();
        verify(childRepository).findAll();
    }

    /**
     * Teste 5: Verifica se child é encontrado por ID corretamente.
     */
    @Test
    void testFindByIdSuccess() {
        when(childRepository.findById(1L)).thenReturn(Optional.of(child));
        when(childMapper.toResponse(child)).thenReturn(childResponse);

        ChildResponse result = service.findById(1L);

        assertNotNull(result);
        verify(childMapper).toResponse(child);
    }

    /**
     * Teste 6: Verifica se lança exceção quando child não é encontrado por ID.
     */
    @Test
    void testFindByIdNotFound() {
        when(childRepository.findById(99L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> service.findById(99L));
    }

    /**
     * Teste 7: Verifica se mapper é chamado no findById.
     */
    @Test
    void testFindByIdMapperCalled() {
        when(childRepository.findById(1L)).thenReturn(Optional.of(child));
        when(childMapper.toResponse(child)).thenReturn(childResponse);

        service.findById(1L);
        verify(childMapper).toResponse(child);
    }

    /**
     * Teste 8: Verifica consistência com múltiplas chamadas findById.
     */
    @Test
    void testFindByIdMultipleCalls() {
        when(childRepository.findById(1L)).thenReturn(Optional.of(child));
        service.findById(1L);
        service.findById(1L);
        verify(childRepository, times(2)).findById(1L);
    }

    /**
     * Teste 9: Verifica se child é salvo corretamente.
     */
    @Test
    void testSaveSuccess() {
        when(userRepository.findById(1L)).thenReturn(Optional.of(user));
        when(childMapper.toEntity(childRequest)).thenReturn(child);
        when(childRepository.save(child)).thenReturn(child);
        when(childMapper.toResponse(child)).thenReturn(childResponse);

        ChildRegistrationResponse result = service.save(childRequest);

        assertNotNull(result);
        verify(childRepository).save(childCaptor.capture());
        assertEquals(user, childCaptor.getValue().getResponsible());
    }

    /**
     * Teste 10: Verifica se lança exceção quando user responsável não existe.
     */
    @Test
    void testSaveUserNotFound() {
        when(userRepository.findById(99L)).thenReturn(Optional.empty());

        childRequest = new ChildRequest("João", 8, "12345678901", LocalDate.now(), "1º", "Normal", 99L, false, null);

        assertThrows(ResourceNotFoundException.class, () -> service.save(childRequest));
    }

    /**
     * Teste 11: Verifica se mapper é chamado duas vezes no save (toEntity e toResponse).
     */
    @Test
    void testSaveMapperCalledTwice() {
        when(userRepository.findById(1L)).thenReturn(Optional.of(user));
        when(childMapper.toEntity(childRequest)).thenReturn(child);
        when(childRepository.save(any())).thenReturn(child);
        when(childMapper.toResponse(child)).thenReturn(childResponse);

        service.save(childRequest);

        verify(childMapper, times(1))
                .toResponse(any());
        verify(childMapper).toEntity(childRequest);
        verify(childMapper).toResponse(child);
    }

    /**
     * Teste 12: Verifica se responsible é setado corretamente no save.
     */
    @Test
    void testSaveResponsibleSet() {
        when(userRepository.findById(1L)).thenReturn(Optional.of(user));
        when(childMapper.toEntity(childRequest)).thenReturn(child);
        when(childRepository.save(any())).thenReturn(child);

        service.save(childRequest);

        verify(childRepository).save(childCaptor.capture());
        assertEquals(user, childCaptor.getValue().getResponsible());
    }

    /**
     * Teste 13: Verifica exceção quando request é null no save.
     */
    @Test
    void testSaveNullRequest() {
        assertThrows(NullPointerException.class, () -> service.save(null));
    }

    /**
     * Teste 14: Verifica se child é atualizado corretamente.
     */
    @Test
    void testUpdateSuccess() {
        when(childRepository.findById(1L)).thenReturn(Optional.of(child));
        child.setName("Maria");
        when(childRepository.save(child)).thenReturn(child);
        when(childMapper.toResponse(child)).thenReturn(childResponse);

        ChildResponse result = service.update(1L, childRequest);

        assertNotNull(result);
        verify(childRepository).save(child);
    }

    /**
     * Teste 15: Verifica exceção quando child não existe no update.
     */
    @Test
    void testUpdateChildNotFound() {
        when(childRepository.findById(99L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> service.update(99L, childRequest));
    }

    /**
     * Teste 16: Verifica se campos são atualizados corretamente no update.
     */
    @Test
    void testUpdateFieldsUpdated() {
        when(childRepository.findById(1L)).thenReturn(Optional.of(child));
        when(childRepository.save(child)).thenReturn(child);

        service.update(1L, childRequest);

        assertEquals("João", child.getName());
        assertEquals("1º Ano", child.getSchoolClass());
    }

    /**
     * Teste 17: Verifica mapper chamado no update.
     */
    @Test
    void testUpdateMapperCalled() {
        when(childRepository.findById(1L)).thenReturn(Optional.of(child));
        when(childRepository.save(child)).thenReturn(child);
        when(childMapper.toResponse(child)).thenReturn(childResponse);

        service.update(1L, childRequest);

        verify(childMapper).toResponse(child);
    }

    /**
     * Teste 18: Verifica se delete é executado sem erro.
     */
    @Test
    void testDeleteSuccess() {
        service.delete(1L);

        verify(childRepository).deleteById(1L);
    }

    /**
     * Teste 19: Verifica se DataIntegrityViolation é capturada e DataBaseExceptions lançada.
     */
    @Test
    void testDeleteDataIntegrityViolation() {
        doThrow(new DataIntegrityViolationException("")).when(childRepository).deleteById(1L);

        assertThrows(DataBaseExceptions.class, () -> service.delete(1L));
    }

    /**
     * Teste 20: Verifica repository chamado no delete.
     */
    @Test
    void testDeleteRepositoryCalled() {
        service.delete(1L);
        verify(childRepository).deleteById(1L);
    }

    /**
     * Teste 21: Verifica múltiplos deletes.
     */
    @Test
    void testDeleteMultipleCalls() {
        service.delete(1L);
        service.delete(2L);
        verify(childRepository, times(2)).deleteById(anyLong());
    }

    /**
     * Teste 22: Verifica children por responsible ID.
     */
    @Test
    void testFindByResponsibleIdSuccess() {
        when(childRepository.findByResponsibleId(1L)).thenReturn(childrenList);
        when(childMapper.toResponseList(childrenList)).thenReturn(responsesList);

        List<ChildResponse> result = service.findByResponsibleId(1L);

        assertNotNull(result);
        verify(childRepository).findByResponsibleId(1L);
    }

    /**
     * Teste 23: Verifica lista vazia quando não há children para responsible.
     */
    @Test
    void testFindByResponsibleIdEmpty() {
        when(childRepository.findByResponsibleId(99L)).thenReturn(List.of());
        when(childMapper.toResponseList(any())).thenReturn(List.of());

        List<ChildResponse> result = service.findByResponsibleId(99L);

        assertTrue(result.isEmpty());
    }

    /**
     * Teste 24: Verifica mapper chamado no findByResponsibleId.
     */
    @Test
    void testFindByResponsibleIdMapperCalled() {
        service.findByResponsibleId(1L);
        verify(childMapper).toResponseList(any());
    }

    /**
     * Teste 25: Verifica custom repo chamado no findByResponsibleId.
     */
    @Test
    void testFindByResponsibleIdRepositoryCalled() {
        service.findByResponsibleId(1L);
        verify(childRepository).findByResponsibleId(1L);
    }
}

