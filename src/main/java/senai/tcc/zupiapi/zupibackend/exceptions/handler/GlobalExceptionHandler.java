package senai.tcc.zupiapi.zupibackend.exceptions.handler;

import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ProblemDetail;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.multipart.MaxUploadSizeExceededException;
import org.springframework.web.server.ResponseStatusException;
import senai.tcc.zupiapi.zupibackend.exceptions.BusinessException;
import senai.tcc.zupiapi.zupibackend.exceptions.DataBaseExceptions;
import senai.tcc.zupiapi.zupibackend.exceptions.ResourceNotFoundException;

import java.time.Instant;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(BusinessException.class)
    public ProblemDetail businessException(BusinessException businessExceptions) {
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

    @ExceptionHandler(ResponseStatusException.class)
    public ProblemDetail responseStatusException(ResponseStatusException ex) {
        ProblemDetail problem = ProblemDetail.forStatus(ex.getStatusCode());
        problem.setDetail(ex.getReason());
        problem.setProperty("timeStamp", Instant.now());
        return problem;
    }

    @ExceptionHandler(DataIntegrityViolationException.class)
    public ProblemDetail dataIntegrityViolationException(DataIntegrityViolationException ex) {
        ProblemDetail problem = ProblemDetail.forStatus(HttpStatus.CONFLICT);
        problem.setDetail("Ja existe um cadastro com estes dados");
        problem.setProperty("timeStamp", Instant.now());
        return problem;
    }

    @ExceptionHandler(MaxUploadSizeExceededException.class)
    public ProblemDetail maxUploadSizeExceededException(MaxUploadSizeExceededException ex) {
        ProblemDetail problem = ProblemDetail.forStatus(HttpStatus.BAD_REQUEST);
        problem.setDetail("O PDF deve ter no maximo 10MB");
        problem.setProperty("timeStamp", Instant.now());
        return problem;
    }
}
