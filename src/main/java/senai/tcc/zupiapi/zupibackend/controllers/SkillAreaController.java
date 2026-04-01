package senai.tcc.zupiapi.zupibackend.controllers;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;
import senai.tcc.zupiapi.zupibackend.dto.request.SkillAreaRequest;
import senai.tcc.zupiapi.zupibackend.dto.response.SkillAreaResponse;
import senai.tcc.zupiapi.zupibackend.model.SkillArea;
import senai.tcc.zupiapi.zupibackend.services.SkillAreaService;

import java.net.URI;
import java.util.List;

@RestController
@CrossOrigin("*")
@RequestMapping(value = "/skillAreas")
public class SkillAreaController {

    @Autowired
    private SkillAreaService skillAreaService;

    @GetMapping
    public ResponseEntity<List<SkillAreaResponse>>  findAllSkillAreas(){
        List<SkillAreaResponse> skillAreas = skillAreaService.findAllSkillAreas();

        return ResponseEntity.ok().body(skillAreas);
    }

    @PostMapping
    public ResponseEntity<SkillAreaResponse> save(
            @RequestBody SkillAreaRequest skillArea
    ){
        SkillAreaResponse saved = skillAreaService.save(skillArea);

        URI uri = ServletUriComponentsBuilder
                .fromCurrentRequest()
                .path("/{id}")
                .buildAndExpand(saved.id())
                .toUri();

        return ResponseEntity.created(uri).body(saved);
    }

    @PutMapping("/{id}")
    public ResponseEntity<SkillAreaResponse> updateSkillArea(
            @PathVariable Long id,
            @RequestBody SkillAreaRequest skillAreaRequest
    ){
        SkillAreaResponse response = skillAreaService.update(id, skillAreaRequest);
        return ResponseEntity.ok().body(response);
    }
}
