package senai.tcc.zupiapi.zupibackend.services;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import senai.tcc.zupiapi.zupibackend.dto.mapper.EventMapper;
import senai.tcc.zupiapi.zupibackend.dto.request.EventRequest;
import senai.tcc.zupiapi.zupibackend.dto.response.EventResponse;
import senai.tcc.zupiapi.zupibackend.exceptions.DataBaseExceptions;
import senai.tcc.zupiapi.zupibackend.exceptions.ResourceNotFoundException;
import senai.tcc.zupiapi.zupibackend.model.*;
import senai.tcc.zupiapi.zupibackend.repositories.*;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class EventServiceTest {

    @Mock
    private EventRepository eventRepository;

    @Mock
    private SkillAreaRepository skillAreaRepository;

    @Mock
    private ChildRepository childRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private EventMapper eventMapper;

    @InjectMocks
    private EventService eventService;

    // =========================
    // FIND ALL (3 TESTES)
    // Autor: João Paulo
    // Testes responsáveis por validar a listagem de eventos
    // =========================

    @Test
    void findAll_ShouldReturnList() {
        // Verifica se retorna uma lista de eventos corretamente mapeada
        Event event = new Event();
        EventResponse response = mock(EventResponse.class);

        when(eventRepository.findAllByUserId(1L)).thenReturn(List.of(event));
        when(eventMapper.toResponseList(any())).thenReturn(List.of(response));

        List<EventResponse> result = eventService.findAll(1L);

        assertEquals(1, result.size());
    }

    @Test
    void findAll_ShouldCallRepository() {
        // Verifica se o repositório é chamado corretamente
        eventService.findAll(1L);
        verify(eventRepository).findAllByUserId(1L);
    }

    @Test
    void findAll_ShouldCallMapper() {
        // Verifica se o mapper é utilizado na conversão da lista
        when(eventRepository.findAllByUserId(1L)).thenReturn(List.of());

        eventService.findAll(1L);

        verify(eventMapper).toResponseList(any());
    }

    // =========================
    // SAVE (7 TESTES)
    // Autor: João Paulo
    // Testes responsáveis por validar o salvamento de eventos
    // =========================

    @Test
    void save_ShouldSaveSuccessfully() {
        // Verifica se um evento é salvo com sucesso
        EventRequest request = mock(EventRequest.class);
        Event event = new Event();
        EventResponse response = mock(EventResponse.class);

        when(request.userId()).thenReturn(1L);
        when(request.childId()).thenReturn(1L);
        when(request.skillAreaId()).thenReturn(1L);

        when(userRepository.findById(1L)).thenReturn(Optional.of(new User()));
        when(childRepository.findById(1L)).thenReturn(Optional.of(new Child()));
        when(skillAreaRepository.findById(1L)).thenReturn(Optional.of(new SkillArea()));

        when(eventMapper.toEntity(request)).thenReturn(event);
        when(eventRepository.save(event)).thenReturn(event);
        when(eventMapper.toResponse(event)).thenReturn(response);

        assertNotNull(eventService.save(request));
    }

    @Test
    void save_ShouldThrowUserNotFound() {
        // Verifica erro ao não encontrar usuário
        EventRequest request = mock(EventRequest.class);

        when(request.userId()).thenReturn(1L);
        when(userRepository.findById(1L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> eventService.save(request));
    }

    @Test
    void save_ShouldThrowChildNotFound() {
        // Verifica erro ao não encontrar criança
        EventRequest request = mock(EventRequest.class);

        when(request.userId()).thenReturn(1L);
        when(request.childId()).thenReturn(1L);

        when(userRepository.findById(1L)).thenReturn(Optional.of(new User()));
        when(childRepository.findById(1L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> eventService.save(request));
    }

    @Test
    void save_ShouldThrowSkillAreaNotFound() {
        // Verifica erro ao não encontrar área de habilidade
        EventRequest request = mock(EventRequest.class);

        when(request.userId()).thenReturn(1L);
        when(request.childId()).thenReturn(1L);
        when(request.skillAreaId()).thenReturn(1L);

        when(userRepository.findById(1L)).thenReturn(Optional.of(new User()));
        when(childRepository.findById(1L)).thenReturn(Optional.of(new Child()));
        when(skillAreaRepository.findById(1L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> eventService.save(request));
    }

    @Test
    void save_ShouldCallRepositorySave() {
        // Verifica se o método save do repositório é chamado
        EventRequest request = mock(EventRequest.class);
        Event event = new Event();

        when(request.userId()).thenReturn(1L);
        when(request.childId()).thenReturn(1L);
        when(request.skillAreaId()).thenReturn(1L);

        when(userRepository.findById(1L)).thenReturn(Optional.of(new User()));
        when(childRepository.findById(1L)).thenReturn(Optional.of(new Child()));
        when(skillAreaRepository.findById(1L)).thenReturn(Optional.of(new SkillArea()));
        when(eventMapper.toEntity(request)).thenReturn(event);

        eventService.save(request);

        verify(eventRepository).save(event);
    }

    @Test
    void save_ShouldSetRelations() {
        // Verifica se as relações (User, Child, SkillArea) são atribuídas corretamente
        EventRequest request = mock(EventRequest.class);
        Event event = new Event();

        User user = new User();
        Child child = new Child();
        SkillArea skill = new SkillArea();

        when(request.userId()).thenReturn(1L);
        when(request.childId()).thenReturn(1L);
        when(request.skillAreaId()).thenReturn(1L);

        when(userRepository.findById(1L)).thenReturn(Optional.of(user));
        when(childRepository.findById(1L)).thenReturn(Optional.of(child));
        when(skillAreaRepository.findById(1L)).thenReturn(Optional.of(skill));
        when(eventMapper.toEntity(request)).thenReturn(event);

        eventService.save(request);

        assertEquals(user, event.getUser());
        assertEquals(child, event.getChild());
        assertEquals(skill, event.getSkillArea());
    }

    @Test
    void save_ShouldCallMapper() {
        // Verifica se o mapper é utilizado na conversão da requisição
        EventRequest request = mock(EventRequest.class);
        Event event = new Event();

        when(request.userId()).thenReturn(1L);
        when(request.childId()).thenReturn(1L);
        when(request.skillAreaId()).thenReturn(1L);

        when(userRepository.findById(1L)).thenReturn(Optional.of(new User()));
        when(childRepository.findById(1L)).thenReturn(Optional.of(new Child()));
        when(skillAreaRepository.findById(1L)).thenReturn(Optional.of(new SkillArea()));
        when(eventMapper.toEntity(request)).thenReturn(event);

        eventService.save(request);

        verify(eventMapper).toEntity(request);
    }

    // =========================
    // UPDATE (7 TESTES)
    // Autor: João Paulo
    // Testes responsáveis por validar a atualização de eventos
    // =========================

    @Test
    void update_ShouldUpdateSuccessfully() {
        // Verifica atualização completa com sucesso
        EventRequest request = mock(EventRequest.class);
        Event event = new Event();
        EventResponse response = mock(EventResponse.class);

        when(request.userId()).thenReturn(1L);
        when(request.childId()).thenReturn(1L);
        when(request.skillAreaId()).thenReturn(1L);

        when(eventRepository.findById(1L)).thenReturn(Optional.of(event));
        when(userRepository.findById(1L)).thenReturn(Optional.of(new User()));
        when(childRepository.findById(1L)).thenReturn(Optional.of(new Child()));
        when(skillAreaRepository.findById(1L)).thenReturn(Optional.of(new SkillArea()));

        when(eventRepository.save(event)).thenReturn(event);
        when(eventMapper.toResponse(event)).thenReturn(response);

        EventResponse result = eventService.update(request, 1L);

        assertNotNull(result);
    }

    @Test
    void update_ShouldThrowEventNotFound() {
        // Verifica erro ao não encontrar evento
        when(eventRepository.findById(1L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class,
                () -> eventService.update(mock(EventRequest.class), 1L));
    }

    @Test
    void update_ShouldThrowUserNotFound() {
        // Verifica erro ao não encontrar usuário
        EventRequest request = mock(EventRequest.class);

        when(request.userId()).thenReturn(1L);
        when(eventRepository.findById(1L)).thenReturn(Optional.of(new Event()));
        when(userRepository.findById(1L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class,
                () -> eventService.update(request, 1L));
    }

    @Test
    void update_ShouldThrowChildNotFound() {
        // Verifica erro ao não encontrar criança
        EventRequest request = mock(EventRequest.class);

        when(request.userId()).thenReturn(1L);
        when(request.childId()).thenReturn(1L);

        when(eventRepository.findById(1L)).thenReturn(Optional.of(new Event()));
        when(userRepository.findById(1L)).thenReturn(Optional.of(new User()));
        when(childRepository.findById(1L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class,
                () -> eventService.update(request, 1L));
    }

    @Test
    void update_ShouldThrowSkillAreaNotFound() {
        // Verifica erro ao não encontrar área de habilidade
        EventRequest request = mock(EventRequest.class);

        when(request.userId()).thenReturn(1L);
        when(request.childId()).thenReturn(1L);
        when(request.skillAreaId()).thenReturn(1L);

        when(eventRepository.findById(1L)).thenReturn(Optional.of(new Event()));
        when(userRepository.findById(1L)).thenReturn(Optional.of(new User()));
        when(childRepository.findById(1L)).thenReturn(Optional.of(new Child()));
        when(skillAreaRepository.findById(1L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class,
                () -> eventService.update(request, 1L));
    }

    @Test
    void update_ShouldCallSave() {
        // Verifica se o save é chamado na atualização
        EventRequest request = mock(EventRequest.class);
        Event event = new Event();

        when(request.userId()).thenReturn(1L);
        when(request.childId()).thenReturn(1L);
        when(request.skillAreaId()).thenReturn(1L);

        when(eventRepository.findById(1L)).thenReturn(Optional.of(event));
        when(userRepository.findById(1L)).thenReturn(Optional.of(new User()));
        when(childRepository.findById(1L)).thenReturn(Optional.of(new Child()));
        when(skillAreaRepository.findById(1L)).thenReturn(Optional.of(new SkillArea()));

        eventService.update(request, 1L);

        verify(eventRepository).save(event);
    }

    @Test
    void update_ShouldUpdateTitle() {
        // Verifica se o título do evento é atualizado corretamente
        EventRequest request = mock(EventRequest.class);
        Event event = new Event();

        when(request.userId()).thenReturn(1L);
        when(request.childId()).thenReturn(1L);
        when(request.skillAreaId()).thenReturn(1L);
        when(request.title()).thenReturn("Novo");

        when(eventRepository.findById(1L)).thenReturn(Optional.of(event));
        when(userRepository.findById(1L)).thenReturn(Optional.of(new User()));
        when(childRepository.findById(1L)).thenReturn(Optional.of(new Child()));
        when(skillAreaRepository.findById(1L)).thenReturn(Optional.of(new SkillArea()));

        eventService.update(request, 1L);

        assertEquals("Novo", event.getTitle());
    }

    // =========================
    // DELETE (3 TESTES)
    // Autor: João Paulo
    // Testes responsáveis por validar a exclusão de eventos
    // =========================

    @Test
    void delete_ShouldDeleteSuccessfully() {
        // Verifica exclusão sem erros
        doNothing().when(eventRepository).deleteById(1L);

        assertDoesNotThrow(() -> eventService.delete(1L));
    }

    @Test
    void delete_ShouldCallRepository() {
        // Verifica se o método delete é chamado
        eventService.delete(1L);

        verify(eventRepository).deleteById(1L);
    }

    @Test
    void delete_ShouldThrowException() {
        // Verifica tratamento de erro de integridade no banco
        doThrow(new org.springframework.dao.DataIntegrityViolationException(""))
                .when(eventRepository).deleteById(1L);

        assertThrows(DataBaseExceptions.class,
                () -> eventService.delete(1L));
    }
}
