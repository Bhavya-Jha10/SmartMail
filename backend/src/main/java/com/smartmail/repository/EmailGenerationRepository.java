package com.smartmail.repository;

import com.smartmail.entity.EmailGeneration;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface EmailGenerationRepository extends JpaRepository<EmailGeneration, Long> {

    Page<EmailGeneration> findByUserIdOrderByCreatedAtDesc(Long userId, Pageable pageable);

    Page<EmailGeneration> findByUserIdAndGenerationTypeOrderByCreatedAtDesc(Long userId, String generationType, Pageable pageable);

    @Query("SELECT e FROM EmailGeneration e WHERE e.user.id = :userId AND " +
           "(:type IS NULL OR e.generationType = :type) AND " +
           "(:tone IS NULL OR e.tone = :tone) AND " +
           "(:keyword IS NULL OR LOWER(e.originalContent) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "LOWER(e.generatedContent) LIKE LOWER(CONCAT('%', :keyword, '%'))) " +
           "ORDER BY e.createdAt DESC")
    Page<EmailGeneration> searchGenerations(@Param("userId") Long userId,
                                            @Param("type") String type,
                                            @Param("tone") String tone,
                                            @Param("keyword") String keyword,
                                            Pageable pageable);

    Optional<EmailGeneration> findByIdAndUserId(Long id, Long userId);

    long countByUserId(Long userId);

    long countByUserIdAndGenerationType(Long userId, String generationType);

    List<EmailGeneration> findTop5ByUserIdOrderByCreatedAtDesc(Long userId);

    void deleteByIdAndUserId(Long id, Long userId);
}
