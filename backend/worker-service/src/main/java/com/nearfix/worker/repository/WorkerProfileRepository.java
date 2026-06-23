package com.nearfix.worker.repository;

import com.nearfix.worker.entity.WorkerProfile;
import com.nearfix.worker.entity.WorkerStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface WorkerProfileRepository extends JpaRepository<WorkerProfile, Long> {

    List<WorkerProfile> findByVerifiedAndStatus(Boolean verified, WorkerStatus status);

    @Query("SELECT w FROM WorkerProfile w WHERE w.verified = true AND w.status = 'AVAILABLE' " +
           "AND (:skill IS NULL OR :skill = '' OR LOWER(w.skill) = LOWER(:skill)) " +
           "AND (:city IS NULL OR :city = '' OR LOWER(w.city) = LOWER(:city)) " +
           "AND (:minRating IS NULL OR w.rating >= :minRating)")
    List<WorkerProfile> searchWorkers(
            @Param("skill") String skill,
            @Param("city") String city,
            @Param("minRating") Double minRating
    );
}
