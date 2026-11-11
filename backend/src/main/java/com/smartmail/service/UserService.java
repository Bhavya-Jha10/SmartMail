package com.smartmail.service;

import com.smartmail.dto.UpdateProfileRequest;
import com.smartmail.dto.UserProfileDto;
import com.smartmail.entity.User;
import com.smartmail.exception.ApiException;
import com.smartmail.exception.ResourceNotFoundException;
import com.smartmail.repository.EmailGenerationRepository;
import com.smartmail.repository.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final EmailGenerationRepository emailGenerationRepository;
    private final PasswordEncoder passwordEncoder;

    public UserService(UserRepository userRepository,
                       EmailGenerationRepository emailGenerationRepository,
                       PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.emailGenerationRepository = emailGenerationRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Transactional(readOnly = true)
    public UserProfileDto getProfile(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        UserProfileDto dto = new UserProfileDto(
                user.getId(),
                user.getName(),
                user.getEmail(),
                user.getRole(),
                user.getCreatedAt()
        );

        dto.setTotalGenerations(emailGenerationRepository.countByUserId(userId));
        dto.setTotalReplies(emailGenerationRepository.countByUserIdAndGenerationType(userId, "REPLY"));
        dto.setTotalSummaries(emailGenerationRepository.countByUserIdAndGenerationType(userId, "SUMMARY"));

        return dto;
    }

    @Transactional
    public UserProfileDto updateProfile(Long userId, UpdateProfileRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        user.setName(request.getName().trim());

        if (StringUtils.hasText(request.getNewPassword())) {
            if (!StringUtils.hasText(request.getCurrentPassword())) {
                throw new ApiException("Current password is required to set a new password", HttpStatus.BAD_REQUEST);
            }
            if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPassword())) {
                throw new ApiException("Current password does not match", HttpStatus.BAD_REQUEST);
            }
            if (request.getNewPassword().length() < 6) {
                throw new ApiException("New password must be at least 6 characters", HttpStatus.BAD_REQUEST);
            }
            user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        }

        User updatedUser = userRepository.save(user);
        return getProfile(updatedUser.getId());
    }
}
