package senai.tcc.zupiapi.zupibackend.controllers;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import senai.tcc.zupiapi.zupibackend.dto.request.QuizAnswerRequest;
import senai.tcc.zupiapi.zupibackend.dto.response.QuizResponse;
import senai.tcc.zupiapi.zupibackend.services.QuizService;

@RestController
@CrossOrigin("*")
@RequestMapping("/quiz")
public class QuizController {

    @Autowired
    private QuizService quizService;

    @GetMapping("/child/{childId}")
    public ResponseEntity<QuizResponse> getLatestQuiz(@PathVariable Long childId) {
        return ResponseEntity.ok(quizService.getLatestQuiz(childId));
    }

    @PostMapping("/child/{childId}")
    public ResponseEntity<QuizResponse> createInitialQuiz(@PathVariable Long childId) {
        return ResponseEntity.ok(quizService.createInitialQuiz(childId));
    }

    @PostMapping("/complete")
    public ResponseEntity<QuizResponse> completeQuiz(@RequestBody QuizAnswerRequest request) {
        return ResponseEntity.ok(quizService.completeQuiz(request));
    }
}
