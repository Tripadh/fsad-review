package com.certitracker.backend.repository;

import com.certitracker.backend.model.Achievement;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface AchievementRepository extends JpaRepository<Achievement, String> {
    List<Achievement> findByUserIdOrderByDateDesc(String userId);
}
