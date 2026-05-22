package senai.tcc.zupiapi.zupibackend.controllers;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import senai.tcc.zupiapi.zupibackend.dto.ChildRegistrationResponse;
import senai.tcc.zupiapi.zupibackend.dto.request.ChildRequest;
import senai.tcc.zupiapi.zupibackend.dto.request.ResponsibleRegisterRequest;
import senai.tcc.zupiapi.zupibackend.dto.response.ResponsibleSummaryResponse;
import senai.tcc.zupiapi.zupibackend.services.SchoolService;

import java.util.List;

@RestController
@RequestMapping("/school")
public class SchoolController {

    @Autowired
    private SchoolService schoolService;

    @GetMapping("/responsibles")
    public ResponseEntity<List<ResponsibleSummaryResponse>> searchResponsibles(
            @RequestParam(required = false) String q
    ) {
        return ResponseEntity.ok(schoolService.searchResponsibles(q));
    }

    @PostMapping("/responsibles")
    public ResponseEntity<ResponsibleSummaryResponse> registerResponsible(
            @RequestBody ResponsibleRegisterRequest request
    ) {
        return ResponseEntity.ok(schoolService.registerResponsible(request));
    }

    @PostMapping("/students")
    public ResponseEntity<ChildRegistrationResponse> registerStudent(@RequestBody ChildRequest request) {
        return ResponseEntity.ok(schoolService.registerStudent(request));
    }
}
