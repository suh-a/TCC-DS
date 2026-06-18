package senai.tcc.zupiapi.zupibackend.controllers;

import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import senai.tcc.zupiapi.zupibackend.dto.request.GameSessionRequest;
import senai.tcc.zupiapi.zupibackend.dto.response.GameSessionResponse;
import senai.tcc.zupiapi.zupibackend.services.AutoReportService;
import senai.tcc.zupiapi.zupibackend.services.GameSessionService;

import java.util.List;
import java.util.Map;

@RestController
@CrossOrigin("*")
@RequestMapping("/child/{childId}/games")
public class GameSessionController {

    @Autowired
    private GameSessionService gameSessionService;

    @Autowired
    private AutoReportService autoReportService;

    @PostMapping("/session")
    public ResponseEntity<GameSessionResponse> record(
            @PathVariable Long childId,
            @Valid @RequestBody GameSessionRequest request
    ) {
        return ResponseEntity.ok(gameSessionService.recordSession(childId, request));
    }

    @GetMapping("/sessions")
    public ResponseEntity<List<GameSessionResponse>> list(@PathVariable Long childId) {
        return ResponseEntity.ok(gameSessionService.findByChild(childId));
    }

    @GetMapping("/progress")
    public ResponseEntity<Map<String, Object>> progress(@PathVariable Long childId) {
        return ResponseEntity.ok(autoReportService.buildProgressSummary(childId));
    }
}
