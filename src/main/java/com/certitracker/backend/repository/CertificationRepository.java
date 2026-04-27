package com.certitracker.backend.repository;

import com.certitracker.backend.model.Certification;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CertificationRepository extends JpaRepository<Certification, String> {
    List<Certification> findByUserIdOrderByCreatedAtDesc(String userId);
}
