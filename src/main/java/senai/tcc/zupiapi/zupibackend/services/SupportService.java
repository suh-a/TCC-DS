package senai.tcc.zupiapi.zupibackend.services;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import senai.tcc.zupiapi.zupibackend.dto.request.SupportTicketRequest;
import senai.tcc.zupiapi.zupibackend.dto.response.SupportTicketResponse;
import senai.tcc.zupiapi.zupibackend.model.SupportTicket;
import senai.tcc.zupiapi.zupibackend.repositories.SupportTicketRepository;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class SupportService {

    @Autowired
    private SupportTicketRepository supportTicketRepository;

    public SupportTicketResponse createTicket(SupportTicketRequest request) {
        SupportTicket ticket = new SupportTicket();
        ticket.setRequesterName(request.requesterName());
        ticket.setRequesterEmail(request.requesterEmail());
        ticket.setUserType(request.userType());
        ticket.setSubject(request.subject());
        ticket.setMessage(request.message());
        ticket.setStatus("ABERTO");

        SupportTicket saved = supportTicketRepository.save(ticket);
        return mapToResponse(saved);
    }

    public List<SupportTicketResponse> getAllTickets() {
        return supportTicketRepository.findAll().stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    public List<SupportTicketResponse> getTicketsForRequester(String email) {
        return supportTicketRepository.findByRequesterEmail(email).stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    private SupportTicketResponse mapToResponse(SupportTicket ticket) {
        return new SupportTicketResponse(
                ticket.getId(),
                ticket.getRequesterName(),
                ticket.getRequesterEmail(),
                ticket.getUserType(),
                ticket.getSubject(),
                ticket.getMessage(),
                ticket.getStatus(),
                ticket.getCreatedAt()
        );
    }
}
