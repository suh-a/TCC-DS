package senai.tcc.zupiapi.zupibackend.controllers;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import senai.tcc.zupiapi.zupibackend.dto.request.SupportTicketRequest;
import senai.tcc.zupiapi.zupibackend.dto.response.SupportTicketResponse;
import senai.tcc.zupiapi.zupibackend.services.SupportService;

import java.util.List;

@RestController
@CrossOrigin("*")
@RequestMapping("/support")
public class SupportController {

    @Autowired
    private SupportService supportService;

    @PostMapping("/ticket")
    public ResponseEntity<SupportTicketResponse> createTicket(@RequestBody SupportTicketRequest request) {
        return ResponseEntity.ok(supportService.createTicket(request));
    }

    @GetMapping("/tickets")
    public ResponseEntity<List<SupportTicketResponse>> getAllTickets() {
        return ResponseEntity.ok(supportService.getAllTickets());
    }

    @GetMapping("/tickets/{email}")
    public ResponseEntity<List<SupportTicketResponse>> getTicketsByRequester(@PathVariable String email) {
        return ResponseEntity.ok(supportService.getTicketsForRequester(email));
    }
}
