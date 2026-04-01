package senai.tcc.zupiapi.zupibackend.services;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;
import senai.tcc.zupiapi.zupibackend.dto.mapper.EventMapper;
import senai.tcc.zupiapi.zupibackend.dto.request.EventRequest;
import senai.tcc.zupiapi.zupibackend.dto.response.EventResponse;
import senai.tcc.zupiapi.zupibackend.exceptions.DataBaseExceptions;
import senai.tcc.zupiapi.zupibackend.exceptions.ResourceNotFoundException;
import senai.tcc.zupiapi.zupibackend.model.Child;
import senai.tcc.zupiapi.zupibackend.model.Event;
import senai.tcc.zupiapi.zupibackend.model.SkillArea;
import senai.tcc.zupiapi.zupibackend.model.User;
import senai.tcc.zupiapi.zupibackend.repositories.ChildRepository;
import senai.tcc.zupiapi.zupibackend.repositories.EventRepository;
import senai.tcc.zupiapi.zupibackend.repositories.SkillAreaRepository;
import senai.tcc.zupiapi.zupibackend.repositories.UserRepository;

import java.util.List;

@Service
public class EventService {

    @Autowired
    private EventRepository eventRepository;

    @Autowired
    private SkillAreaRepository skillAreaRepository;

    @Autowired
    private ChildRepository childRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private EventMapper eventMapper;

    public List<EventResponse> findAll(Long id) {
        return eventMapper.toResponseList(eventRepository.findAllByUserId(id));
    }

    public EventResponse save(EventRequest event) {
        User user = userRepository.findById(event.userId())
                .orElseThrow(() -> new ResourceNotFoundException("user not found"));
        Child child = childRepository.findById(event.childId())
                .orElseThrow(() -> new ResourceNotFoundException("child not found") );
        SkillArea newSkillArea = skillAreaRepository.findById(event.skillAreaId())
                .orElseThrow(() -> new ResourceNotFoundException("skill area not found"));

        Event newEvent = eventMapper.toEntity(event);

        newEvent.setSkillArea(newSkillArea);
        newEvent.setChild(child);
        newEvent.setUser(user);
        return eventMapper.toResponse(eventRepository.save(newEvent));
    }

    public EventResponse update(EventRequest eventRequest, Long eventId) {
        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new ResourceNotFoundException("event not found"));
        User user = userRepository.findById(eventRequest.userId())
                .orElseThrow(() -> new ResourceNotFoundException("user not found"));
        Child child = childRepository.findById(eventRequest.childId())
                .orElseThrow(() -> new ResourceNotFoundException("child not found") );
        SkillArea newSkillArea = skillAreaRepository.findById(eventRequest.skillAreaId())
                .orElseThrow(() -> new ResourceNotFoundException("skill area not found"));

        event.setDate(eventRequest.date());
        event.setFinish(eventRequest.finish());
        event.setTitle(eventRequest.title());
        event.setSkillArea(newSkillArea);
        event.setChild(child);
        event.setUser(user);

        return eventMapper.toResponse(eventRepository.save(event));

    }

    public void delete(Long eventId) {
        try {
            eventRepository.deleteById(eventId);
        }catch (DataIntegrityViolationException e){
            throw new DataBaseExceptions("Not possible to delete event");
        }
    }
}
