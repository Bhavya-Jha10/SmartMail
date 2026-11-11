package com.smartmail.controller;

import com.smartmail.dto.UpdateProfileRequest;
import com.smartmail.dto.UserProfileDto;
import com.smartmail.security.UserPrincipal;
import com.smartmail.service.UserService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/user")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping("/profile")
    public ResponseEntity<UserProfileDto> getProfile(@AuthenticationPrincipal UserPrincipal userPrincipal) {
        UserProfileDto profile = userService.getProfile(userPrincipal.getId());
        return ResponseEntity.ok(profile);
    }

    @PutMapping("/profile")
    public ResponseEntity<UserProfileDto> updateProfile(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @Valid @RequestBody UpdateProfileRequest request) {
        UserProfileDto updatedProfile = userService.updateProfile(userPrincipal.getId(), request);
        return ResponseEntity.ok(updatedProfile);
    }
}
