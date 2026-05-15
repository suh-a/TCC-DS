package senai.tcc.zupiapi.zupibackend.controllers;

import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import senai.tcc.zupiapi.zupibackend.dto.request.ContactRequest;
import senai.tcc.zupiapi.zupibackend.services.EmailService;

import java.util.Map;

@RestController
@CrossOrigin("*")
@RequestMapping("/contact")
public class ContactController {

    @Autowired
    private EmailService emailService;

    @PostMapping
    public ResponseEntity<Map<String, String>> send(@Valid @RequestBody ContactRequest request) {
        emailService.sendContactMessage(request);
        return ResponseEntity.ok(Map.of("message", "Mensagem enviada com sucesso!"));
    }
}
