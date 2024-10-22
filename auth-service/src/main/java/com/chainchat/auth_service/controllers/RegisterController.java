package com.chainchat.auth_service.controllers;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RestController;

import com.chainchat.auth_service.services.RegisterService;
import com.chainchat.auth_service.model.RegisterRequest;
import com.chainchat.auth_service.model.UserResponse;
import com.chainchat.auth_service.rest.AuthApi;


@RestController
public class RegisterController implements AuthApi {
    private final RegisterService registerService;

    @Autowired
    public RegisterController(RegisterService registerService) {
        this.registerService = registerService;
    }

    @Override
    public ResponseEntity<UserResponse> authRegisterPost(RegisterRequest registerRequest) {
        return registerService.register(registerRequest);
    }

}
