package io.github.piponsio.smartfinances_api.exception;

import java.util.LinkedHashMap;
import java.util.Map;

import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import io.github.piponsio.smartfinances_api.utils.CustomResponse;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<CustomResponse<Void>> handleResourceNotFound(ResourceNotFoundException ex) {
        CustomResponse<Void> response = CustomResponse.<Void>builder()
            .data(null)
            .message(ex.getMessage())
            .statusCode(HttpStatus.NOT_FOUND.value())
            .build();
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
    }

    @ExceptionHandler(IllegalStateException.class)
    public ResponseEntity<CustomResponse<Void>> handleIllegalState(IllegalStateException ex) {
        CustomResponse<Void> response = CustomResponse.<Void>builder()
            .data(null)
            .message(ex.getMessage())
            .statusCode(HttpStatus.CONFLICT.value())
            .build();
        return ResponseEntity.status(HttpStatus.CONFLICT).body(response);
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<CustomResponse<Map<String, String>>> handleValidationErrors(MethodArgumentNotValidException ex) {
        Map<String, String> errors = new LinkedHashMap<>();
        ex.getBindingResult().getFieldErrors()
            .forEach(error -> errors.put(error.getField(), error.getDefaultMessage()));
        CustomResponse<Map<String, String>> response = CustomResponse.<Map<String, String>>builder()
            .data(errors)
            .message("Validation failed")
            .statusCode(HttpStatus.BAD_REQUEST.value())
            .build();
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
    }

    @ExceptionHandler(BadCredentialsException.class)
    public ResponseEntity<CustomResponse<Void>> handleBadCredentials(BadCredentialsException ex) {
        CustomResponse<Void> response = CustomResponse.<Void>builder()
            .data(null)
            .message("Invalid email or password")
            .statusCode(HttpStatus.UNAUTHORIZED.value())
            .build();
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
    }

    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<CustomResponse<Void>> handleDataIntegrityViolation(DataIntegrityViolationException ex) {
        CustomResponse<Void> response = CustomResponse.<Void>builder()
            .data(null)
            .message("This operation could not be completed because the record is still referenced by other data")
            .statusCode(HttpStatus.CONFLICT.value())
            .build();
        return ResponseEntity.status(HttpStatus.CONFLICT).body(response);
    }

    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<CustomResponse<Void>> handleRuntimeException(RuntimeException ex) {
        CustomResponse<Void> response = CustomResponse.<Void>builder()
            .data(null)
            .message(ex.getMessage())
            .statusCode(HttpStatus.BAD_REQUEST.value())
            .build();
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<CustomResponse<Void>> handleGenericException(Exception ex) {
        CustomResponse<Void> response = CustomResponse.<Void>builder()
            .data(null)
            .message("An unexpected error occurred")
            .statusCode(HttpStatus.INTERNAL_SERVER_ERROR.value())
            .build();
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
    }
}
