package com.nearfix.worker.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "worker_profiles")
public class WorkerProfile {

    @Id
    private Long id;

    @Column(nullable = false)
    private String skill;

    @Column(nullable = false)
    private Integer experience;

    @Column(nullable = false)
    private String city;

    @Column(name = "aadhaar_number", nullable = false)
    private String aadhaarNumber;

    @Column(nullable = false)
    private Double rating = 0.0;

    @Column(nullable = false)
    private Boolean verified = false;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private WorkerStatus status = WorkerStatus.OFFLINE;

    public WorkerProfile() {}

    public WorkerProfile(Long id, String skill, Integer experience, String city, String aadhaarNumber) {
        this.id = id;
        this.skill = skill;
        this.experience = experience;
        this.city = city;
        this.aadhaarNumber = aadhaarNumber;
        this.rating = 0.0;
        this.verified = false;
        this.status = WorkerStatus.OFFLINE;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getSkill() {
        return skill;
    }

    public void setSkill(String skill) {
        this.skill = skill;
    }

    public Integer getExperience() {
        return experience;
    }

    public void setExperience(Integer experience) {
        this.experience = experience;
    }

    public String getCity() {
        return city;
    }

    public void setCity(String city) {
        this.city = city;
    }

    public String getAadhaarNumber() {
        return aadhaarNumber;
    }

    public void setAadhaarNumber(String aadhaarNumber) {
        this.aadhaarNumber = aadhaarNumber;
    }

    public Double getRating() {
        return rating;
    }

    public void setRating(Double rating) {
        this.rating = rating;
    }

    public Boolean getVerified() {
        return verified;
    }

    public void setVerified(Boolean verified) {
        this.verified = verified;
    }

    public WorkerStatus getStatus() {
        return status;
    }

    public void setStatus(WorkerStatus status) {
        this.status = status;
    }
}
