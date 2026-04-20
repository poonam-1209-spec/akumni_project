package com.engineering.alumni.service;

import com.engineering.alumni.dto.EventDTO;
import com.engineering.alumni.dto.EventStatisticsDTO;
import com.engineering.alumni.entity.Event;
import com.engineering.alumni.repository.EventRepository;
import com.engineering.alumni.repository.EventRegistrationRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class EventService {
    private static final Logger log = LoggerFactory.getLogger(EventService.class);
    private final EventRepository eventRepository;
    private final EventRegistrationRepository eventRegistrationRepository;

    public EventService(EventRepository eventRepository, EventRegistrationRepository eventRegistrationRepository) {
        this.eventRepository = eventRepository;
        this.eventRegistrationRepository = eventRegistrationRepository;
    }

    // Get all events
    public List<EventDTO> getAllEvents() {
        log.info("Fetching all events");
        return eventRepository.findAll().stream()
            .map(EventDTO::fromEntity)
            .collect(Collectors.toList());
    }

    // Get event by ID
    public EventDTO getEventById(String id) {
        log.info("Fetching event with ID: {}", id);
        return eventRepository.findById(id)
            .map(EventDTO::fromEntity)
            .orElseThrow(() -> new RuntimeException("Event not found with ID: " + id));
    }

    // Create new event
    public EventDTO createEvent(EventDTO eventDTO) {
        log.info("Creating new event: {}", eventDTO.getTitle());
        Event event = eventDTO.toEntity();
        Event savedEvent = eventRepository.save(event);
        return EventDTO.fromEntity(savedEvent);
    }

    // Update event
    public EventDTO updateEvent(String id, EventDTO eventDTO) {
        log.info("Updating event with ID: {}", id);
        
        Event event = eventRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Event not found with ID: " + id));

        event.setTitle(eventDTO.getTitle());
        event.setDescription(eventDTO.getDescription());
        event.setEventDate(eventDTO.getEventDate());
        event.setLocation(eventDTO.getLocation());
        event.setCapacity(eventDTO.getCapacity());
        event.setEventType(eventDTO.getEventType());
        if (eventDTO.getStatus() != null) {
            event.setStatus(eventDTO.getStatus());
        }

        Event updatedEvent = eventRepository.save(event);
        return EventDTO.fromEntity(updatedEvent);
    }

    // Delete event
    public void deleteEvent(String id) {
        log.info("Deleting event with ID: {}", id);

        if (!eventRepository.existsById(id)) {
            throw new RuntimeException("Event not found with ID: " + id);
        }

        // Delete related registrations first to avoid FK constraint violation
        eventRegistrationRepository.findByEventId(id).forEach(r ->
            eventRegistrationRepository.deleteById(r.getId()));

        eventRepository.deleteById(id);
    }

    // Get upcoming events
    public List<EventDTO> getUpcomingEvents() {
        log.info("Fetching upcoming events");
        return eventRepository.findUpcomingEvents(LocalDateTime.now()).stream()
            .map(EventDTO::fromEntity)
            .collect(Collectors.toList());
    }

    // Get past events
    public List<EventDTO> getPastEvents() {
        log.info("Fetching past events");
        return eventRepository.findPastEvents(LocalDateTime.now()).stream()
            .map(EventDTO::fromEntity)
            .collect(Collectors.toList());
    }

    // Get events by type
    public List<EventDTO> getEventsByType(Event.EventType eventType) {
        log.info("Fetching events by type: {}", eventType);
        return eventRepository.findByEventType(eventType).stream()
            .map(EventDTO::fromEntity)
            .collect(Collectors.toList());
    }

    // Get events by status
    public List<EventDTO> getEventsByStatus(Event.EventStatus status) {
        log.info("Fetching events by status: {}", status);
        return eventRepository.findByStatus(status).stream()
            .map(EventDTO::fromEntity)
            .collect(Collectors.toList());
    }

    // Search events
    public List<EventDTO> searchEvents(String searchTerm) {
        log.info("Searching events with term: {}", searchTerm);
        return eventRepository.searchEvents(searchTerm).stream()
            .map(EventDTO::fromEntity)
            .collect(Collectors.toList());
    }

    // Approve alumni-submitted event
    public EventDTO approveEvent(String id) {
        log.info("Approving event with ID: {}", id);
        Event event = eventRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Event not found with ID: " + id));
        event.setStatus(Event.EventStatus.PUBLISHED);
        return EventDTO.fromEntity(eventRepository.save(event));
    }

    // Reject alumni-submitted event
    public EventDTO rejectEvent(String id) {
        log.info("Rejecting event with ID: {}", id);
        Event event = eventRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Event not found with ID: " + id));
        event.setStatus(Event.EventStatus.REJECTED);
        return EventDTO.fromEntity(eventRepository.save(event));
    }

    // Get event statistics
    public EventStatisticsDTO getEventStatistics() {
        log.info("Fetching event statistics");
        
        long totalEvents = eventRepository.count();
        long upcomingCount = eventRepository.findUpcomingEvents(LocalDateTime.now()).size();

        var eventTypeBreakdown = eventRepository.getEventCountByType().stream()
            .collect(Collectors.toMap(
                obj -> ((Event.EventType) obj[0]).getDisplayName(),
                obj -> ((Number) obj[1]).longValue()
            ));

        return EventStatisticsDTO.builder()
            .totalEvents(totalEvents)
            .upcomingEvents(upcomingCount)
            .eventTypeBreakdown(eventTypeBreakdown)
            .build();
    }
}
