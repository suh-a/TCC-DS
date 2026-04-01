package senai.tcc.zupiapi.zupibackend.controllers;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;
import senai.tcc.zupiapi.zupibackend.dto.request.ChildRequest;
import senai.tcc.zupiapi.zupibackend.dto.response.ChildResponse;
import senai.tcc.zupiapi.zupibackend.model.Child;
import senai.tcc.zupiapi.zupibackend.services.ChildService;

import java.net.URI;
import java.util.List;

@RestController
@CrossOrigin("*")
@RequestMapping(value = "/child")
public class ChildController {

    @Autowired
    private ChildService childService;

    @GetMapping
    public ResponseEntity<List<ChildResponse>> findAll() {
        return ResponseEntity.ok().body(childService.findAll());
    }

    @GetMapping(value = "/{id}")
    public ResponseEntity< List<ChildResponse>> findByResponsibleId(@PathVariable Long id) {
        return ResponseEntity.ok().body(childService.findByResponsibleId(id));
    }

    @PostMapping
    public ResponseEntity<ChildResponse> save(@RequestBody ChildRequest child) {

        ChildResponse savedChild = childService.save(child);

        URI uri = ServletUriComponentsBuilder
                .fromCurrentRequest()
                .path("/{id}")
                .buildAndExpand(savedChild.id())
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
