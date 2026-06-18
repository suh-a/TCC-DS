package senai.tcc.zupiapi.zupibackend.controllers;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.Resource;
import org.springframework.http.ContentDisposition;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import senai.tcc.zupiapi.zupibackend.dto.ChildRegistrationResponse;
import senai.tcc.zupiapi.zupibackend.dto.request.AccessEmailRequest;
import senai.tcc.zupiapi.zupibackend.dto.request.ChildRequest;
import senai.tcc.zupiapi.zupibackend.dto.request.ResponsibleRegisterRequest;
import senai.tcc.zupiapi.zupibackend.dto.request.SchoolChatMessageRequest;
import senai.tcc.zupiapi.zupibackend.dto.request.SchoolClassRequest;
import senai.tcc.zupiapi.zupibackend.dto.request.TeacherRequest;
import senai.tcc.zupiapi.zupibackend.dto.response.ChildResponse;
import senai.tcc.zupiapi.zupibackend.dto.response.LibraryBookResponse;
import senai.tcc.zupiapi.zupibackend.dto.response.PasswordResetResponse;
import senai.tcc.zupiapi.zupibackend.dto.response.ResponsibleSummaryResponse;
import senai.tcc.zupiapi.zupibackend.dto.response.SchoolAccessResponse;
import senai.tcc.zupiapi.zupibackend.dto.response.SchoolChatMessageResponse;
import senai.tcc.zupiapi.zupibackend.dto.response.SchoolClassResponse;
import senai.tcc.zupiapi.zupibackend.dto.response.TeacherResponse;
import senai.tcc.zupiapi.zupibackend.services.SchoolLearningService;
import senai.tcc.zupiapi.zupibackend.services.SchoolService;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/school")
public class SchoolController {

    @Autowired
    private SchoolService schoolService;

    @Autowired
    private SchoolLearningService schoolLearningService;

    @GetMapping("/dashboard")
    public ResponseEntity<Map<String, Object>> dashboard() {
        return ResponseEntity.ok(schoolService.dashboard());
    }

    @GetMapping("/students")
    public ResponseEntity<List<ChildResponse>> listStudents() {
        return ResponseEntity.ok(schoolService.listStudents());
    }

    @PostMapping("/students")
    public ResponseEntity<ChildRegistrationResponse> registerStudent(@RequestBody ChildRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(schoolService.registerStudent(request));
    }

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

    @GetMapping("/teachers")
    public ResponseEntity<List<TeacherResponse>> listTeachers() {
        return ResponseEntity.ok(schoolService.listTeachers());
    }

    @PostMapping("/teachers")
    public ResponseEntity<TeacherResponse> registerTeacher(@RequestBody TeacherRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(schoolService.registerTeacher(request));
    }

    @GetMapping("/classes")
    public ResponseEntity<List<SchoolClassResponse>> listClasses() {
        return ResponseEntity.ok(schoolService.listClasses());
    }

    @PostMapping("/classes")
    public ResponseEntity<SchoolClassResponse> createClass(@RequestBody SchoolClassRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(schoolService.createClass(request));
    }

    @GetMapping("/accesses")
    public ResponseEntity<SchoolAccessResponse> listAccesses() {
        return ResponseEntity.ok(schoolService.listAccesses());
    }

    @PatchMapping("/accesses/teachers/{id}/email")
    public ResponseEntity<Void> updateTeacherEmail(@PathVariable Long id, @RequestBody AccessEmailRequest request) {
        schoolService.updateTeacherEmail(id, request);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/accesses/teachers/{id}/password/reset")
    public ResponseEntity<PasswordResetResponse> resetTeacherPassword(@PathVariable Long id) {
        return ResponseEntity.ok(schoolService.resetTeacherPassword(id));
    }

    @PatchMapping("/accesses/students/{id}/login")
    public ResponseEntity<Void> updateStudentLogin(@PathVariable Long id, @RequestBody AccessEmailRequest request) {
        schoolService.updateStudentLogin(id, request);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/accesses/students/{id}/password/reset")
    public ResponseEntity<PasswordResetResponse> resetStudentPassword(@PathVariable Long id) {
        return ResponseEntity.ok(schoolService.resetStudentPassword(id));
    }

    @PatchMapping("/accesses/responsibles/{id}/email")
    public ResponseEntity<Void> updateResponsibleEmail(@PathVariable Long id, @RequestBody AccessEmailRequest request) {
        schoolService.updateResponsibleEmail(id, request);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/accesses/responsibles/{id}/password/reset")
    public ResponseEntity<PasswordResetResponse> resetResponsiblePassword(@PathVariable Long id) {
        return ResponseEntity.ok(schoolService.resetResponsiblePassword(id));
    }

    @GetMapping("/reports/summary")
    public ResponseEntity<Map<String, Object>> reportsSummary() {
        return ResponseEntity.ok(schoolService.reportsSummary());
    }

    @GetMapping("/chat")
    public ResponseEntity<List<SchoolChatMessageResponse>> chatMessages() {
        return ResponseEntity.ok(schoolLearningService.chatMessages());
    }

    @PostMapping("/chat")
    public ResponseEntity<SchoolChatMessageResponse> postChat(@RequestBody SchoolChatMessageRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(schoolLearningService.postChatMessage(request));
    }

    @GetMapping("/library/books")
    public ResponseEntity<List<LibraryBookResponse>> listBooks() {
        return ResponseEntity.ok(schoolService.listBooks());
    }

    @PostMapping(value = "/library/books", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<LibraryBookResponse> createBook(
            @RequestParam String title,
            @RequestParam("file") MultipartFile file
    ) {
        return ResponseEntity.status(HttpStatus.CREATED).body(schoolService.createBook(title, file));
    }

    @GetMapping("/library/books/{id}/file")
    public ResponseEntity<Resource> bookFile(@PathVariable Long id) {
        SchoolService.LibraryBookFile file = schoolService.getBookFile(id);
        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_PDF)
                .header(HttpHeaders.CONTENT_DISPOSITION,
                        ContentDisposition.inline().filename(file.filename()).build().toString())
                .body(file.resource());
    }
}
