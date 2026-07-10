package com.lungguard.repository;

import com.lungguard.model.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

/*
 * Repository talks to users table.
 * JpaRepository gives save(), findAll(), findById(), deleteById().
 */
public interface UserRepository extends JpaRepository<User, Long> {

    /*
     * Finds full User object by email.
     * Return type is Optional because user may or may not exist.
     */
    Optional<User> findByEmail(String email);

    /*
     * Returns true/false if email already exists.
     * Used during registration.
     */
    boolean existsByEmail(String email);
}