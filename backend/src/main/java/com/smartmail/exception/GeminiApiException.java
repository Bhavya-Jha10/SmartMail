package com.smartmail.exception;

import org.springframework.http.HttpStatus;

public class GeminiApiException extends RuntimeException {

    private final HttpStatus status;
    private final String errorCode;

    public GeminiApiException(String message) {
        super(message);
        this.status = HttpStatus.BAD_GATEWAY;
        this.errorCode = "GEMINI_ERROR";
    }

    public GeminiApiException(String message, HttpStatus status, String errorCode) {
        super(message);
        this.status = status;
        this.errorCode = errorCode;
    }

    public GeminiApiException(String message, Throwable cause, HttpStatus status, String errorCode) {
        super(message, cause);
        this.status = status;
        this.errorCode = errorCode;
    }

    public HttpStatus getStatus() {
        return status;
    }

    public String getErrorCode() {
        return errorCode;
    }
}
