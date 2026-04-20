package com.engineering.alumni.dto;

import com.engineering.alumni.entity.Event;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDateTime;

public class EventDTO {
    private String id;

    @NotBlank(message = "Title is required")
    private String title;

    @NotBlank(message = "Description is required")
    private String description;

    @NotNull(message = "Event date is required")
    private LocalDateTime eventDate;

    private String location;
    private Integer capacity;

    @NotNull(message = "Event type is required")
    private Event.EventType eventType;

    private Event.EventStatus status;
    private String createdBy;
    private Event.TargetAudience targetAudience;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public EventDTO() {
    }

    public EventDTO(String id, String title, String description, LocalDateTime eventDate,
            String location, Integer capacity, Event.EventType eventType,
            Event.EventStatus status, String createdBy, Event.TargetAudience targetAudience, LocalDateTime createdAt, LocalDateTime updatedAt) {
        this.id = id;
        this.title = title;
        this.description = description;
        this.eventDate = eventDate;
        this.location = location;
        this.capacity = capacity;
        this.eventType = eventType;
        this.status = status;
        this.createdBy = createdBy;
        this.targetAudience = targetAudience;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    // Getters and Setters
    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public LocalDateTime getEventDate() {
        return eventDate;
    }

    public void setEventDate(LocalDateTime eventDate) {
        this.eventDate = eventDate;
    }

    public String getLocation() {
        return location;
    }

    public void setLocation(String location) {
        this.location = location;
    }

    public Integer getCapacity() {
        return capacity;
    }

    public void setCapacity(Integer capacity) {
        this.capacity = capacity;
    }

    public Event.EventType getEventType() {
        return eventType;
    }

    public void setEventType(Event.EventType eventType) {
        this.eventType = eventType;
    }

    public Event.EventStatus getStatus() {
        return status;
    }

    public void setStatus(Event.EventStatus status) {
        this.status = status;
    }

    public String getCreatedBy() { return createdBy; }
    public void setCreatedBy(String createdBy) { this.createdBy = createdBy; }
    public Event.TargetAudience getTargetAudience() { return targetAudience; }
    public void setTargetAudience(Event.TargetAudience targetAudience) { this.targetAudience = targetAudience; }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }

    // Manual builder
    public static Builder builder() {
        return new Builder();
    }

    public static class Builder {
        private String id;
        private String title;
        private String description;
        private LocalDateTime eventDate;
        private String location;
        private Integer capacity;
        private Event.EventType eventType;
        private Event.EventStatus status;
        private String createdBy;
        private Event.TargetAudience targetAudience;
        private LocalDateTime createdAt;
        private LocalDateTime updatedAt;

        public Builder id(String id) {
            this.id = id;
            return this;
        }

        public Builder title(String title) {
            this.title = title;
            return this;
        }

        public Builder description(String description) {
            this.description = description;
            return this;
        }

        public Builder eventDate(LocalDateTime eventDate) {
            this.eventDate = eventDate;
            return this;
        }

        public Builder location(String location) {
            this.location = location;
            return this;
        }

        public Builder capacity(Integer capacity) {
            this.capacity = capacity;
            return this;
        }

        public Builder eventType(Event.EventType eventType) {
            this.eventType = eventType;
            return this;
        }

        public Builder status(Event.EventStatus status) {
            this.status = status;
            return this;
        }

        public Builder createdBy(String createdBy) {
            this.createdBy = createdBy;
            return this;
        }

        public Builder targetAudience(Event.TargetAudience targetAudience) {
            this.targetAudience = targetAudience;
            return this;
        }

        public Builder createdAt(LocalDateTime createdAt) {
            this.createdAt = createdAt;
            return this;
        }

        public Builder updatedAt(LocalDateTime updatedAt) {
            this.updatedAt = updatedAt;
            return this;
        }

        public EventDTO build() {
            return new EventDTO(id, title, description, eventDate, location, capacity, eventType, status, createdBy, targetAudience, createdAt, updatedAt);
        }
    }

    // Convert DTO to Entity
    public Event toEntity() {
        return Event.builder()
                .title(this.title)
                .description(this.description)
                .eventDate(this.eventDate)
                .location(this.location)
                .capacity(this.capacity)
                .eventType(this.eventType)
                .status(this.status != null ? this.status : Event.EventStatus.DRAFT)
                .createdBy(this.createdBy)
                .targetAudience(this.targetAudience != null ? this.targetAudience : Event.TargetAudience.BOTH)
                .build();
    }

    // Convert Entity to DTO
    public static EventDTO fromEntity(Event event) {
        return EventDTO.builder()
                .id(event.getId())
                .title(event.getTitle())
                .description(event.getDescription())
                .eventDate(event.getEventDate())
                .location(event.getLocation())
                .capacity(event.getCapacity())
                .eventType(event.getEventType())
                .status(event.getStatus())
                .createdBy(event.getCreatedBy())
                .targetAudience(event.getTargetAudience())
                .createdAt(event.getCreatedAt())
                .updatedAt(event.getUpdatedAt())
                .build();
    }
}
