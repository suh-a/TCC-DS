package senai.tcc.zupiapi.zupibackend.controllers;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;
import senai.tcc.zupiapi.zupibackend.dto.ChildRegistrationResponse;
import senai.tcc.zupiapi.zupibackend.dto.request.ChildRequest;
import senai.tcc.zupiapi.zupibackend.dto.response.ChildResponse;
import senai.tcc.zupiapi.zupibackend.model.Child;
import senai.tcc.zupiapi.zupibackend.services.ChildService;

import java.net.URI;
import java.util.List;

@RestController
@RequestMapping(value = "/child")
public class ChildController {

    @Autowired
    private ChildService childService;

    @GetMapping("/me")
    public ResponseEntity<List<ChildResponse>> me() {
        return ResponseEntity.ok(childService.findForCurrentResponsible());
    }

    @GetMapping(value = "/{userId}")
    public ResponseEntity< List<ChildResponse>> findByResponsibleId(@PathVariable Long userId) {
        return ResponseEntity.ok().body(childService.findByResponsibleId(userId));
    }

    @GetMapping(value = "/details/{id}")
    public ResponseEntity<ChildResponse> findById(@PathVariable Long id) {
        return ResponseEntity.ok().body(childService.findById(id));
    }

    @PostMapping
    public ResponseEntity<ChildRegistrationResponse> save(@RequestBody ChildRequest child) {

        ChildRegistrationResponse savedChild = childService.save(child);

        URI uri = ServletUriComponentsBuilder
                .fromCurrentRequest()
                .path("/{id}")
                .buildAndExpand(savedChild.child().id())
                .toUri();

        return ResponseEntity.created(uri).body(savedChild);
    }

    @PutMapping("/{id}")
    public ResponseEntity<ChildResponse> update(
            @PathVariable Long id,
            @RequestBody ChildRequest child
    ) {
        ChildResponse updatedChild = childService.update(id, child);

        return ResponseEntity.ok().body(updatedChild);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        childService.delete(id);

        return ResponseEntity.noContent().build();
    }

}
