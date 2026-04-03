package senai.tcc.zupiapi.zupibackend.services;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import senai.tcc.zupiapi.zupibackend.dto.mapper.SkillAreaMapper;
import senai.tcc.zupiapi.zupibackend.dto.request.SkillAreaRequest;
import senai.tcc.zupiapi.zupibackend.dto.response.SkillAreaResponse;
import senai.tcc.zupiapi.zupibackend.exceptions.ResourceNotFoundException;
import senai.tcc.zupiapi.zupibackend.model.SkillArea;
import senai.tcc.zupiapi.zupibackend.repositories.SkillAreaRepository;

import java.util.Collections;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

/*Autor: Kerlon Neves
Data: 02/04/2026 */


@ExtendWith(MockitoExtension.class)
class SkillAreaServiceTest {

    @InjectMocks
    private SkillAreaService service;

    @Mock
    private SkillAreaRepository repository;

    @Mock
    private SkillAreaMapper mapper;

    private SkillArea skillArea;
    private SkillAreaRequest request;
    private SkillAreaResponse response;

    @BeforeEach
    void setup() {
        skillArea = new SkillArea();
        skillArea.setName("Aprendizado");

        request = new SkillAreaRequest("Aprendizado");

        response = new SkillAreaResponse(1L, "Aprendizado");
    }

    // find all tests
    //1
    @Test
    void shouldReturnAllSkillAreas() {
        List<SkillArea> list = List.of(skillArea);
        List<SkillAreaResponse> responseList = List.of(response);

        when(repository.findAll()).thenReturn(list);
        when(mapper.toResponse(list)).thenReturn(responseList);

        List<SkillAreaResponse> result = service.findAllSkillAreas();

        assertEquals(1, result.size());
        verify(repository).findAll();
    }
    //2
    @Test
    void shouldReturnEmptyListWhenNoSkillAreas() {
        when(repository.findAll()).thenReturn(Collections.emptyList());
        when(mapper.toResponse(Collections.emptyList())).thenReturn(Collections.emptyList());

        List<SkillAreaResponse> result = service.findAllSkillAreas();

        assertTrue(result.isEmpty());
    }
    //3
    @Test
    void shouldCallMapperOnFindAll() {
        List<SkillArea> list = List.of(skillArea);

        when(repository.findAll()).thenReturn(list);
        when(mapper.toResponse(list)).thenReturn(List.of(response));

        service.findAllSkillAreas();

        verify(mapper).toResponse(list);
    }
    //4
    @Test
    void shouldCallRepositoryOnceOnFindAll() {
        when(repository.findAll()).thenReturn(List.of(skillArea));
        when(mapper.toResponse(anyList())).thenReturn(List.of(response));

        service.findAllSkillAreas();

        verify(repository, times(1)).findAll();
    }
    //5
    @Test
    void shouldReturnCorrectDataFromFindAll() {
        when(repository.findAll()).thenReturn(List.of(skillArea));
        when(mapper.toResponse(anyList())).thenReturn(List.of(response));

        List<SkillAreaResponse> result = service.findAllSkillAreas();

        assertEquals("Aprendizado", result.getFirst().name());
    }

    // Save tests
    //6
    @Test
    void shouldSaveSkillArea() {
        when(mapper.toEntity(request)).thenReturn(skillArea);
        when(repository.save(skillArea)).thenReturn(skillArea);
        when(mapper.toResponse(skillArea)).thenReturn(response);

        SkillAreaResponse result = service.save(request);

        assertNotNull(result);
        verify(repository).save(skillArea);
    }
    //7
    @Test
    void shouldCallMapperToEntityOnSave() {
        service.save(request);
        verify(mapper).toEntity(request);
    }
    //8
    @Test
    void shouldCallMapperToResponseOnSave() {
        when(mapper.toEntity(request)).thenReturn(skillArea);
        when(repository.save(skillArea)).thenReturn(skillArea);
        when(mapper.toResponse(skillArea)).thenReturn(response);

        service.save(request);

        verify(mapper).toResponse(skillArea);
    }
    //9
    @Test
    void shouldReturnCorrectResponseOnSave() {
        when(mapper.toEntity(request)).thenReturn(skillArea);
        when(repository.save(skillArea)).thenReturn(skillArea);
        when(mapper.toResponse(skillArea)).thenReturn(response);

        SkillAreaResponse result = service.save(request);

        assertEquals("Aprendizado", result.name());
    }
    //10
    @Test
    void shouldThrowExceptionWhenMapperFailsOnSave() {
        when(mapper.toEntity(request)).thenThrow(RuntimeException.class);

        assertThrows(RuntimeException.class, () -> service.save(request));
    }

    // update tests
    //11
    @Test
    void shouldUpdateSkillAreaSuccessfully() {
        when(repository.findById(1L)).thenReturn(Optional.of(skillArea));
        when(repository.save(skillArea)).thenReturn(skillArea);
        when(mapper.toResponse(skillArea)).thenReturn(response);

        SkillAreaResponse result = service.update(1L, request);

        assertEquals("Aprendizado", result.name());
    }
    //12
    @Test
    void shouldThrowExceptionWhenSkillAreaNotFound() {
        when(repository.findById(1L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class,
                () -> service.update(1L, request));
    }
    //13
    @Test
    void shouldCallFindByIdOnUpdate() {
        when(repository.findById(1L)).thenReturn(Optional.of(skillArea));
        when(repository.save(skillArea)).thenReturn(skillArea);
        when(mapper.toResponse(skillArea)).thenReturn(response);

        service.update(1L, request);

        verify(repository).findById(1L);
    }
    //14
    @Test
    void shouldCallSaveOnUpdate() {
        when(repository.findById(1L)).thenReturn(Optional.of(skillArea));
        when(repository.save(skillArea)).thenReturn(skillArea);
        when(mapper.toResponse(skillArea)).thenReturn(response);

        service.update(1L, request);

        verify(repository).save(skillArea);
    }
    //15
    @Test
    void shouldUpdateNameField() {
        when(repository.findById(1L)).thenReturn(Optional.of(skillArea));
        when(repository.save(skillArea)).thenReturn(skillArea);
        when(mapper.toResponse(skillArea)).thenReturn(response);

        service.update(1L, new SkillAreaRequest("Frontend"));

        assertEquals("Frontend", skillArea.getName());
    }
    //16
    @Test
    void shouldCallMapperOnUpdate() {
        when(repository.findById(1L)).thenReturn(Optional.of(skillArea));
        when(repository.save(skillArea)).thenReturn(skillArea);
        when(mapper.toResponse(skillArea)).thenReturn(response);

        service.update(1L, request);

        verify(mapper).toResponse(skillArea);
    }
    //17
    @Test
    void shouldReturnUpdatedResponse() {
        SkillAreaResponse updatedResponse = new SkillAreaResponse(1L, "Frontend");

        when(repository.findById(1L)).thenReturn(Optional.of(skillArea));
        when(repository.save(skillArea)).thenReturn(skillArea);
        when(mapper.toResponse(skillArea)).thenReturn(updatedResponse);

        SkillAreaResponse result = service.update(1L, new SkillAreaRequest("Frontend"));

        assertEquals("Frontend", result.name());
    }
    //18
    @Test
    void shouldNotCallSaveWhenNotFound() {
        when(repository.findById(1L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class,
                () -> service.update(1L, request));

        verify(repository, never()).save(any());
    }
    //19
    @Test
    void shouldOnlyCallFindByIdOnce() {
        when(repository.findById(1L)).thenReturn(Optional.of(skillArea));
        when(repository.save(skillArea)).thenReturn(skillArea);
        when(mapper.toResponse(skillArea)).thenReturn(response);

        service.update(1L, request);

        verify(repository, times(1)).findById(1L);
    }
    // 20
    @Test
    void shouldHandleNullNameOnUpdate() {
        when(repository.findById(1L)).thenReturn(Optional.of(skillArea));
        when(repository.save(skillArea)).thenReturn(skillArea);
        when(mapper.toResponse(skillArea)).thenReturn(response);

        SkillAreaRequest nullRequest = new SkillAreaRequest(null);

        service.update(1L, nullRequest);

        assertNull(skillArea.getName());
    }
}