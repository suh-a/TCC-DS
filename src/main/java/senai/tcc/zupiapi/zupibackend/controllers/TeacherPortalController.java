package senai.tcc.zupiapi.zupibackend.controllers;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import senai.tcc.zupiapi.zupibackend.dto.request.SchoolActivityRequest;
import senai.tcc.zupiapi.zupibackend.dto.request.SchoolChatMessageRequest;
import senai.tcc.zupiapi.zupibackend.dto.request.SchoolQuizRequest;
import senai.tcc.zupiapi.zupibackend.dto.response.*;
import senai.tcc.zupiapi.zupibackend.services.SchoolLearningService;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/teacher")
public class TeacherPortalController {

    @Autowired
    private SchoolLearningService schoolLearningService;

    @GetMapping("/dashboard")
    public ResponseEntity<Map<String, Object>> dashboard() {
        return ResponseEntity.ok(schoolLearningService.teacherDashboard());
    }

    @GetMapping("/classes")
    public ResponseEntity<List<SchoolClassResponse>> classes() {
        return ResponseEntity.ok(schoolLearningService.teacherClasses());
    }

    @GetMapping("/students")
    public ResponseEntity<List<ChildResponse>> students() {
        return ResponseEntity.ok(schoolLearningService.teacherStudents());
    }

    @GetMapping("/reports/summary")
    public ResponseEntity<SchoolReportSummaryResponse> reportsSummary() {
        return ResponseEntity.ok(schoolLearningService.teacherReportsSummary());
    }

    @GetMapping("/activities")
    public ResponseEntity<List<SchoolActivityResponse>> activities() {
        return ResponseEntity.ok(schoolLearningService.teacherActivities());
    }

    @PostMapping("/activities")
    public ResponseEntity<SchoolActivityResponse> createActivity(@RequestBody SchoolActivityRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(schoolLearningService.createActivity(request));
    }

    @GetMapping("/quizzes")
    public ResponseEntity<List<SchoolQuizResponse>> quizzes() {
        return ResponseEntity.ok(schoolLearningService.teacherQuizzes());
    }

    @PostMapping("/quizzes")
    public ResponseEntity<SchoolQuizResponse> createQuiz(@RequestBody SchoolQuizRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(schoolLearningService.createQuiz(request));
    }

    @GetMapping("/chat")
    public ResponseEntity<List<SchoolChatMessageResponse>> chatMessages() {
        return ResponseEntity.ok(schoolLearningService.chatMessages());
    }

    @PostMapping("/chat")
    public ResponseEntity<SchoolChatMessageResponse> postChat(@RequestBody SchoolChatMessageRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(schoolLearningService.postChatMessage(request));
    }
}
