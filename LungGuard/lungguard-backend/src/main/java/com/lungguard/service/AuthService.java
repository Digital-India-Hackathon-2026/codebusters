package com.lungguard.service;

import com.lungguard.dto.LoginRequest;
import com.lungguard.dto.RegisterRequest;
import com.lungguard.model.User;
import com.lungguard.repository.UserRepository;
import com.lungguard.security.JwtTokenProvider;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Collections;
import java.util.Map;
import java.util.Optional;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;

    public AuthService(UserRepository userRepository, PasswordEncoder passwordEncoder, JwtTokenProvider jwtTokenProvider) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtTokenProvider = jwtTokenProvider;
    }

    public String registerUser(RegisterRequest request){
        if(userRepository.existsByEmail(request.getEmail())){
            return "Email already registered";
        }

        User user = new User();
        user.setFullName(request.getFullName());
        user.setEmail(request.getEmail());
        // Hash the password using BCrypt
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setAge(request.getAge());
        user.setGender(request.getGender());
        user.setCreatedAt(LocalDateTime.now());

        userRepository.save(user);

        return "User Registered Successfully";
    }

    public Map<String, String> loginUser(LoginRequest request){
        Optional<User> userOpt = userRepository.findByEmail(request.getEmail());

        if(userOpt.isEmpty()){
            return Map.of("error", "Invalid Email");
        }

        User user = userOpt.get();

        if(!passwordEncoder.matches(request.getPassword(), user.getPassword())){
            return Map.of("error", "Invalid Password");
        }

        // Generate UserDetails
        org.springframework.security.core.userdetails.UserDetails userDetails = 
                new org.springframework.security.core.userdetails.User(
                        user.getEmail(),
                        user.getPassword(),
                        Collections.emptyList()
                );

        String token = jwtTokenProvider.generateToken(userDetails);

        return Map.of(
                "token", token,
                "email", user.getEmail(),
                "fullName", user.getFullName()
        );
    }
}