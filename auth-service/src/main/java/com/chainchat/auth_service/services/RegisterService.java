package com.chainchat.auth_service.services;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import com.chainchat.auth_service.repositories.UserRepository;
import com.chainchat.auth_service.model.RegisterRequest;
import com.chainchat.auth_service.model.User;
import com.chainchat.auth_service.model.UserResponse;

@Service
public class RegisterService  {
    private final UserRepository userRepository;

    @Autowired
    public RegisterService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public ResponseEntity<UserResponse> register(RegisterRequest registerRequest) {
        User user = new User();
        UserResponse userResponse = new UserResponse();
        user.setFirstName(registerRequest.getFirstName());
        user.setLastName(registerRequest.getLastName());
        user.setUsername(registerRequest.getUsername());
        user.setEmail(registerRequest.getEmail());
        user.setPassword(registerRequest.getPassword());

        if (this.userRepository.existsByUsername(user.getUsername())) {
            return ResponseEntity.status(401).build();
        }
        
        userResponse.setUsername(user.getUsername());
        userResponse.setEmail(user.getEmail());

        this.userRepository.save(user); 
        return ResponseEntity.ok(userResponse);
    }

}
