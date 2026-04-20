package com.engineering.alumni.controller;

import com.engineering.alumni.dto.ApiResponse;
import com.engineering.alumni.dto.EventDTO;
import com.engineering.alumni.entity.Event;
import com.engineering.alumni.service.EventService;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/events")
public class EventController {
    private static final Logger log = LoggerFactory.getLogger(EventController.class);
    private final EventService eventService;

    public EventController(EventService eventService) {
        this.eventService = eventService;
    }

    /**
     * Get all events
     */
    @GetMapping
    public ResponseEntity<ApiResponse<List<EventDTO>>> getAllEvents() {
        log.info("GET /api/events - Fetching all events");
        List<EventDTO> events = eventService.getAllEvents();
        return ResponseEntity.ok(ApiResponse.success("Events fetched successfully", events));
    }

    /**
     * Get event by ID
     */
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<EventDTO>> getEventById(@PathVariable String id) {
        log.info("GET /api/events/{} - Fetching event by ID", id);
        EventDTO event = eventService.getEventById(id);
        return ResponseEntity.ok(ApiResponse.success("Event fetched successfully", event));
    }

    /**
     * Create new event
     */
    @PostMapping
    public ResponseEntity<ApiResponse<EventDTO>> createEvent(@Valid @RequestBody EventDTO eventDTO) {
        log.info("POST /api/events - Creating new event: {}", eventDTO.getTitle());
        EventDTO createdEvent = eventService.createEvent(eventDTO);
        return ResponseEntity.status(HttpStatus.CREATED)
            .body(ApiResponse.success("Event created successfully", createdEvent));
    }

    /**
     * Update event
     */
    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<EventDTO>> updateEvent(
            @PathVariable String id,
            @Valid @RequestBody EventDTO eventDTO) {
        log.info("PUT /api/events/{} - Updating event", id);
        EventDTO updatedEvent = eventService.updateEvent(id, eventDTO);
        return ResponseEntity.ok(ApiResponse.success("Event updated successfully", updatedEvent));
    }

    /**
     * Delete event
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteEvent(@PathVariable String id) {
        log.info("DELETE /api/events/{} - Deleting event", id);
        eventService.deleteEvent(id);
        return ResponseEntity.ok(ApiResponse.success("Event deleted successfully"));
    }

    /**
     * Get upcoming events
     */
    @GetMapping("/upcoming")
    public ResponseEntity<ApiResponse<List<EventDTO>>> getUpcomingEvents() {
        log.info("GET /api/events/upcoming - Fetching upcoming events");
        List<EventDTO> events = eventService.getUpcomingEvents();
        return ResponseEntity.ok(ApiResponse.success("Upcoming events fetched successfully", events));
    }

    /**
     * Get past events
     */
    @GetMapping("/past")
    public ResponseEntity<ApiResponse<List<EventDTO>>> getPastEvents() {
        log.info("GET /api/events/past - Fetching past events");
        List<EventDTO> events = eventService.getPastEvents();
        return ResponseEntity.ok(ApiResponse.success("Past events fetched successfully", events));
    }

    /**
     * Get events by type
     */
    @GetMapping("/type/{type}")
    public ResponseEntity<ApiResponse<List<EventDTO>>> getEventsByType(
            @PathVariable Event.EventType type) {
        log.info("GET /api/events/type/{} - Fetching events by type", type);
        List<EventDTO> events = eventService.getEventsByType(type);
        return ResponseEntity.ok(ApiResponse.success("Events by type fetched successfully", events));
    }

    /**
     * Get events by status
     */
    @GetMapping("/status/{status}")
    public ResponseEntity<ApiResponse<List<EventDTO>>> getEventsByStatus(
            @PathVariable Event.EventStatus status) {
        log.info("GET /api/events/status/{} - Fetching events by status", status);
        List<EventDTO> events = eventService.getEventsByStatus(status);
        return ResponseEntity.ok(ApiResponse.success("Events by status fetched successfully", events));
    }

    /**
     * Search events
     */
    @GetMapping("/search")
    public ResponseEntity<ApiResponse<List<EventDTO>>> searchEvents(
            @RequestParam String query) {
        log.info("GET /api/events/search - Searching events with query: {}", query);
        List<EventDTO> events = eventService.searchEvents(query);
        return ResponseEntity.ok(ApiResponse.success("Event search results", events));
    }

    /**
     * Get events pending admin approval (submitted by alumni)
     */
    @GetMapping("/pending-approval")
    public ResponseEntity<ApiResponse<List<EventDTO>>> getPendingApprovalEvents() {
        log.info("GET /api/events/pending-approval - Fetching events pending approval");
        List<EventDTO> events = eventService.getEventsByStatus(Event.EventStatus.PENDING_APPROVAL);
        return ResponseEntity.ok(ApiResponse.success("Pending approval events fetched", events));
    }

    /**
     * Approve an alumni-submitted event (publish it)
     */
    @PutMapping("/{id}/approve")
    public ResponseEntity<ApiResponse<EventDTO>> approveEvent(@PathVariable String id) {
        log.info("PUT /api/events/{}/approve - Approving event", id);
        EventDTO updatedEvent = eventService.approveEvent(id);
        return ResponseEntity.ok(ApiResponse.success("Event approved and published", updatedEvent));
    }

    /**
     * Reject an alumni-submitted event
     */
    @PutMapping("/{id}/reject")
    public ResponseEntity<ApiResponse<EventDTO>> rejectEvent(@PathVariable String id) {
        log.info("PUT /api/events/{}/reject - Rejecting event", id);
        EventDTO updatedEvent = eventService.rejectEvent(id);
        return ResponseEntity.ok(ApiResponse.success("Event rejected", updatedEvent));
    }

    /**
     * Get event statistics
     */
    @GetMapping("/stats/overview")
    public ResponseEntity<ApiResponse<?>> getEventStatistics() {
        log.info("GET /api/events/stats/overview - Fetching event statistics");
        return ResponseEntity.ok(ApiResponse.success("Event statistics", eventService.getEventStatistics()));
    }
}
