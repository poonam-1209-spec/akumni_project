package com.engineering.alumni.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
// Lombok removed; manual code below

import java.time.LocalDateTime;

@Entity
@Table(name = "events")
// Manual code below
public class Event {
    public Event() {}

    public Event(String id, String title, String description, LocalDateTime eventDate, String location, Integer capacity, EventType eventType, EventStatus status, String createdBy, TargetAudience targetAudience, LocalDateTime createdAt, LocalDateTime updatedAt) {
        this.id = id;
        this.title = title;
        this.description = description;
        this.eventDate = eventDate;
        this.location = location;
        this.capacity = capacity;
        this.eventType = eventType;
        this.status = status;
        this.createdBy = createdBy;
        this.targetAudience = targetAudience != null ? targetAudience : TargetAudience.BOTH;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    public static Builder builder() { return new Builder(); }
    public static class Builder {
        private String id;
        private String title;
        private String description;
        private LocalDateTime eventDate;
        private String location;
        private Integer capacity;
        private EventType eventType;
        private EventStatus status;
        private String createdBy;
        private TargetAudience targetAudience;
        private LocalDateTime createdAt;
        private LocalDateTime updatedAt;

        public Builder id(String id) { this.id = id; return this; }
        public Builder title(String title) { this.title = title; return this; }
        public Builder description(String description) { this.description = description; return this; }
        public Builder eventDate(LocalDateTime eventDate) { this.eventDate = eventDate; return this; }
        public Builder location(String location) { this.location = location; return this; }
        public Builder capacity(Integer capacity) { this.capacity = capacity; return this; }
        public Builder eventType(EventType eventType) { this.eventType = eventType; return this; }
        public Builder status(EventStatus status) { this.status = status; return this; }
        public Builder createdBy(String createdBy) { this.createdBy = createdBy; return this; }
        public Builder targetAudience(TargetAudience targetAudience) { this.targetAudience = targetAudience; return this; }
        public Builder createdAt(LocalDateTime createdAt) { this.createdAt = createdAt; return this; }
        public Builder updatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; return this; }
        public Event build() {
            return new Event(id, title, description, eventDate, location, capacity, eventType, status, createdBy, targetAudience, createdAt, updatedAt);
        }
    }

    // Getters and setters
    public String getCreatedBy() { return createdBy; }
    public void setCreatedBy(String createdBy) { this.createdBy = createdBy; }
    public TargetAudience getTargetAudience() { return targetAudience; }
    public void setTargetAudience(TargetAudience targetAudience) { this.targetAudience = targetAudience; }
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public LocalDateTime getEventDate() { return eventDate; }
    public void setEventDate(LocalDateTime eventDate) { this.eventDate = eventDate; }
    public String getLocation() { return location; }
    public void setLocation(String location) { this.location = location; }
    public Integer getCapacity() { return capacity; }
    public void setCapacity(Integer capacity) { this.capacity = capacity; }
    public EventType getEventType() { return eventType; }
    public void setEventType(EventType eventType) { this.eventType = eventType; }
    public EventStatus getStatus() { return status; }
    public void setStatus(EventStatus status) { this.status = status; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
    
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @NotBlank(message = "Event title is required")
    @Column(nullable = false)
    private String title;

    @NotBlank(message = "Description is required")
    @Column(nullable = false, columnDefinition = "TEXT")
    private String description;

    @NotNull(message = "Event date is required")
    @Column(nullable = false)
    private LocalDateTime eventDate;

    @Column
    private String location;

    @Column
    private Integer capacity;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private EventType eventType;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private EventStatus status;

    @Column
    private String createdBy; // email of alumni who submitted the event

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TargetAudience targetAudience = TargetAudience.BOTH;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(nullable = false)
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
        if (status == null) {
            status = EventStatus.DRAFT;
        }
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    public enum EventType {
        REUNION("Alumni Reunion"),
        WORKSHOP("Technical Workshop"),
        WEBINAR("Webinar"),
        NETWORKING("Networking Event"),
        SEMINAR("Seminar");

        private final String displayName;

        EventType(String displayName) {
            this.displayName = displayName;
        }

        public String getDisplayName() {
            return displayName;
        }
    }

    public enum EventStatus {
        DRAFT("Draft"),
        PENDING_APPROVAL("Pending Approval"),
        PUBLISHED("Published"),
        ONGOING("Ongoing"),
        COMPLETED("Completed"),
        CANCELLED("Cancelled"),
        REJECTED("Rejected");

        private final String displayName;

        EventStatus(String displayName) {
            this.displayName = displayName;
        }

        public String getDisplayName() {
            return displayName;
        }
    }

    public enum TargetAudience {
        STUDENT, ALUMNI, BOTH;
    }
}
