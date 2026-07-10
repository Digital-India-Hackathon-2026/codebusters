package com.lungguard.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "simulation_results")

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SimulationResult {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /*
     * User Information
     */
    private Integer age;

    private Integer cigarettesPerDay;

    private Integer smokingYears;

    /*
     * Values:
     * daily
     * weekly
     * monthly
     * never
     */
    private String alcoholFrequency;

    /*
     * 5 Year Prediction
     */
    private Integer lungCapacityAfter5Years;

    private Integer copdRiskAfter5Years;

    private Integer cancerRiskAfter5Years;

    /*
     * 10 Year Prediction
     */
    private Integer lungCapacityAfter10Years;

    private Integer copdRiskAfter10Years;

    private Integer cancerRiskAfter10Years;

    /*
     * Estimated money spent on smoking/alcohol
     */
    private Double moneyBurned;

    /*
     * Health recommendation
     */
    @Column(length = 1000)
    private String recommendation;

    /*
     * Simulation creation time
     */
    private LocalDateTime createdAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;
}