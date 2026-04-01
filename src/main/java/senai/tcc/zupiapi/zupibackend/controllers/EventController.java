package senai.tcc.zupiapi.zupibackend.controllers;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;
import senai.tcc.zupiapi.zupibackend.dto.request.EventRequest;
import senai.tcc.zupiapi.zupibackend.dto.response.EventResponse;
import senai.tcc.zupiapi.zupibackend.services.EventService;

import java.net.URI;
import java.util.List;
    
@RestController
@CrossOrigin("*")
@RequestMapping(value = "/{userId}/events")
public class    EventController {

    @Autowired
    private EventService eventService;

    @GetMapping("")
    public ResponseEntity<List<EventResponse>> findAll(@PathVariable Long userId) {
        List<EventResponse> events = eventService.findAll(userId);

        return ResponseEntity.ok().body(events);
    }

    @PostMapping
    public ResponseEntity<EventResponse> save(
            @RequestBody EventRequest event
    ) {
        EventResponse newEvent = eventService.save(event);

        URI uri = ServletUriComponentsBuilder
                .fromCurrentRequest()
                .path("/{id}")
                .buildAndExpand(newEvent.id())
                .toUri();

        return ResponseEntity.created(uri).body(newEvent);
    }

    @PutMapping("/{id}")
    public ResponseEntity<EventResponse> update(
            @PathVariable Long id,
            @RequestBody EventRequest eventRequest
    ){
        EventResponse event = eventService.update(eventRequest,id);
        return ResponseEntity.ok().body(event);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id){
        eventService.delete(id);

        return ResponseEntity.noContent().build();
    }
}
