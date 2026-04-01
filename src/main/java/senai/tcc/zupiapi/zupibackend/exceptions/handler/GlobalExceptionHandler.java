package senai.tcc.zupiapi.zupibackend.exceptions.handler;

import org.springframework.http.HttpStatus;
import org.springframework.http.ProblemDetail;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import senai.tcc.zupiapi.zupibackend.exceptions.BusinessExceptions;
import senai.tcc.zupiapi.zupibackend.exceptions.DataBaseExceptions;
import senai.tcc.zupiapi.zupibackend.exceptions.ResourceNotFoundException;

import java.time.Instant;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(BusinessExceptions.class)
    public ProblemDetail businessException(BusinessExceptions businessExceptions) {
        ProblemDetail problem = ProblemDetail.forStatus(HttpStatus.BAD_REQUEST);

        problem.setDetail(businessExceptions.getMessage());
        problem.setProperty("timeStamp", Instant.now());

        return problem;

    }

    @ExceptionHandler(DataBaseExceptions.class)
    public ProblemDetail dataBaseException(DataBaseExceptions dataBaseExceptions) {
        ProblemDetail problem = ProblemDetail.forStatus(HttpStatus.BAD_REQUEST);

        problem.setDetail(dataBaseExceptions.getMessage());
        problem.setProperty("timeStamp", Instant.now());

        return problem;
    }

    @ExceptionHandler(ResourceNotFoundException.class)
    public ProblemDetail resourceNotFoundException(ResourceNotFoundException resourceNotFoundException) {
        ProblemDetail problem = ProblemDetail.forStatus(HttpStatus.NOT_FOUND);

        problem.setDetail(resourceNotFoundException.getMessage());
        problem.setProperty("timeStamp", Instant.now());

        return problem;
    }
}
