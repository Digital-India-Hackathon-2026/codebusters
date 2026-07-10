package com.lungguard.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(
    name = "daily_check_ins",
    uniqueConstraints = @UniqueConstraint(columnNames = {"tracker_id", "check_in_date"})
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DailyCheckIn {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "tracker_id", nullable = false)
    private RecoveryTracker tracker;

    @Column(name = "check_in_date", nullable = false)
    private LocalDate checkInDate;

    private boolean didSmoke;
    private Integer cigarettesSmoked;

    private boolean didDrink;
    private Integer drinksConsumed;

    private Integer cravingLevel;
    private String mood;

    @Column(length = 2000)
    private String notes;

    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}
