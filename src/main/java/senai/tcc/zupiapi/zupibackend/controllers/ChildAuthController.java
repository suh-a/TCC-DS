package senai.tcc.zupiapi.zupibackend.controllers;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import senai.tcc.zupiapi.zupibackend.dto.ChildLoginResponse;
import senai.tcc.zupiapi.zupibackend.dto.request.ChildLoginDTO;
import senai.tcc.zupiapi.zupibackend.services.ChildService;

@RestController
@CrossOrigin("*")
@RequestMapping("/auth/child")
public class ChildAuthController {

    @Autowired
    private ChildService childService;

    @PostMapping("/login")
    public ResponseEntity<ChildLoginResponse> login(@RequestBody ChildLoginDTO loginRequest) {
        ChildLoginResponse response = childService.login(loginRequest);
        return ResponseEntity.ok(response);
    }
}
