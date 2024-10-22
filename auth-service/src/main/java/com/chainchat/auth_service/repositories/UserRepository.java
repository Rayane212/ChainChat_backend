package com.chainchat.auth_service.repositories;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.chainchat.auth_service.model.User;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User>  findByUsername(String username);
    Optional<User> findByEmail(String email);
    Optional<User>  findByUsernameOrEmail(String username, String email);
    Boolean existsByUsername(String username);
    Boolean existsByEmail(String email);
   
}
