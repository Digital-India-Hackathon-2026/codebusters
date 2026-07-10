package com.lungguard.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "recovery_trackers")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RecoveryTracker {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", unique = true)
    private User user;

    private LocalDate quitSmokingDate;
    private LocalDate quitAlcoholDate;

    private Integer cigarettesPerDay;
    private Double pricePerCigarette;
    private Integer cigarettesPerPacket;

    private Integer drinksPerWeek;
    private Double costPerDrink;

    private String currency;

    private String dailyGoal;

    @Column(length = 1000)
    private String motivationMessage;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
