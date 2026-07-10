package com.lungguard.service;

import com.lungguard.dto.DailyCheckInRequest;
import com.lungguard.dto.TrackerResponse;
import com.lungguard.dto.TrackerSetupRequest;
import com.lungguard.model.DailyCheckIn;
import com.lungguard.model.RecoveryTracker;
import com.lungguard.model.User;
import com.lungguard.repository.DailyCheckInRepository;
import com.lungguard.repository.RecoveryTrackerRepository;
import com.lungguard.repository.UserRepository;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class RecoveryTrackerService {

    private final RecoveryTrackerRepository trackerRepository;
    private final DailyCheckInRepository checkInRepository;
    private final UserRepository userRepository;

    public RecoveryTrackerService(RecoveryTrackerRepository trackerRepository,
                                  DailyCheckInRepository checkInRepository,
                                  UserRepository userRepository) {
        this.trackerRepository = trackerRepository;
        this.checkInRepository = checkInRepository;
        this.userRepository = userRepository;
    }

    private User getAuthenticatedUser() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    @Transactional
    public TrackerResponse setupTracker(TrackerSetupRequest request) {
        User user = getAuthenticatedUser();
        
        if (trackerRepository.findByUser(user).isPresent()) {
            throw new RuntimeException("Tracker already exists for this user. Use update instead.");
        }

        RecoveryTracker tracker = RecoveryTracker.builder()
                .user(user)
                .quitSmokingDate(request.getQuitSmokingDate())
                .quitAlcoholDate(request.getQuitAlcoholDate())
                .cigarettesPerDay(request.getCigarettesPerDay())
                .pricePerCigarette(request.getPricePerCigarette())
                .cigarettesPerPacket(request.getCigarettesPerPacket())
                .drinksPerWeek(request.getDrinksPerWeek())
                .costPerDrink(request.getCostPerDrink())
                .currency(request.getCurrency() != null ? request.getCurrency() : "$")
                .dailyGoal(request.getDailyGoal())
                .motivationMessage(request.getMotivationMessage())
                .build();

        trackerRepository.save(tracker);
        return getTracker();
    }

    @Transactional
    public TrackerResponse updateTracker(TrackerSetupRequest request) {
        User user = getAuthenticatedUser();
        RecoveryTracker tracker = trackerRepository.findByUser(user)
                .orElseThrow(() -> new RuntimeException("Tracker not found"));

        tracker.setQuitSmokingDate(request.getQuitSmokingDate());
        tracker.setQuitAlcoholDate(request.getQuitAlcoholDate());
        tracker.setCigarettesPerDay(request.getCigarettesPerDay());
        tracker.setPricePerCigarette(request.getPricePerCigarette());
        tracker.setCigarettesPerPacket(request.getCigarettesPerPacket());
        tracker.setDrinksPerWeek(request.getDrinksPerWeek());
        tracker.setCostPerDrink(request.getCostPerDrink());
        tracker.setCurrency(request.getCurrency() != null ? request.getCurrency() : "$");
        tracker.setDailyGoal(request.getDailyGoal());
        tracker.setMotivationMessage(request.getMotivationMessage());

        trackerRepository.save(tracker);
        return getTracker();
    }

    @Transactional
    public TrackerResponse saveCheckIn(DailyCheckInRequest request) {
        User user = getAuthenticatedUser();
        RecoveryTracker tracker = trackerRepository.findByUser(user)
                .orElseThrow(() -> new RuntimeException("Tracker not found"));

        DailyCheckIn checkIn = checkInRepository.findByTrackerAndCheckInDate(tracker, request.getCheckInDate())
                .orElse(new DailyCheckIn());

        checkIn.setTracker(tracker);
        checkIn.setCheckInDate(request.getCheckInDate());
        checkIn.setDidSmoke(request.isDidSmoke());
        checkIn.setCigarettesSmoked(request.getCigarettesSmoked());
        checkIn.setDidDrink(request.isDidDrink());
        checkIn.setDrinksConsumed(request.getDrinksConsumed());
        checkIn.setCravingLevel(request.getCravingLevel());
        checkIn.setMood(request.getMood());
        checkIn.setNotes(request.getNotes());

        checkInRepository.save(checkIn);
        return getTracker();
    }

    public TrackerResponse getTracker() {
        User user = getAuthenticatedUser();
        RecoveryTracker tracker = trackerRepository.findByUser(user)
                .orElseThrow(() -> new RuntimeException("Tracker not found"));

        List<DailyCheckIn> checkIns = checkInRepository.findByTrackerOrderByCheckInDateAsc(tracker);

        int smokeFreeDays = 0;
        int alcoholFreeDays = 0;
        int cigarettesAvoided = 0;
        int drinksAvoided = 0;

        for (DailyCheckIn ci : checkIns) {
            if (tracker.getQuitSmokingDate() != null && !ci.getCheckInDate().isBefore(tracker.getQuitSmokingDate())) {
                if (!ci.isDidSmoke()) {
                    smokeFreeDays++;
                    cigarettesAvoided += tracker.getCigarettesPerDay() != null ? tracker.getCigarettesPerDay() : 0;
                } else if (tracker.getCigarettesPerDay() != null && ci.getCigarettesSmoked() != null) {
                    int avoidedToday = tracker.getCigarettesPerDay() - ci.getCigarettesSmoked();
                    if (avoidedToday > 0) cigarettesAvoided += avoidedToday;
                }
            }

            if (tracker.getQuitAlcoholDate() != null && !ci.getCheckInDate().isBefore(tracker.getQuitAlcoholDate())) {
                if (!ci.isDidDrink()) {
                    alcoholFreeDays++;
                    drinksAvoided += tracker.getDrinksPerWeek() != null ? tracker.getDrinksPerWeek() / 7 : 0; // approximate daily
                } else if (tracker.getDrinksPerWeek() != null && ci.getDrinksConsumed() != null) {
                    int dailyDrinks = tracker.getDrinksPerWeek() / 7;
                    int avoidedToday = dailyDrinks - ci.getDrinksConsumed();
                    if (avoidedToday > 0) drinksAvoided += avoidedToday;
                }
            }
        }

        double moneySavedCigarettes = 0;
        if (tracker.getPricePerCigarette() != null && cigarettesAvoided > 0) {
            moneySavedCigarettes = cigarettesAvoided * tracker.getPricePerCigarette();
        } else if (tracker.getCigarettesPerPacket() != null && tracker.getCigarettesPerPacket() > 0 && tracker.getPricePerCigarette() != null) {
             // If price was per packet, we'd adjust here, but assuming pricePerCigarette is computed by frontend or directly provided
             moneySavedCigarettes = cigarettesAvoided * tracker.getPricePerCigarette();
        }

        double moneySavedAlcohol = 0;
        if (tracker.getCostPerDrink() != null && drinksAvoided > 0) {
            moneySavedAlcohol = drinksAvoided * tracker.getCostPerDrink();
        }

        int currentSmokingStreak = calculateStreak(checkIns, true, tracker.getQuitSmokingDate());
        int bestSmokingStreak = calculateBestStreak(checkIns, true, tracker.getQuitSmokingDate());
        int currentAlcoholStreak = calculateStreak(checkIns, false, tracker.getQuitAlcoholDate());
        int bestAlcoholStreak = calculateBestStreak(checkIns, false, tracker.getQuitAlcoholDate());

        LocalDate startDate = tracker.getQuitSmokingDate();
        if (tracker.getQuitAlcoholDate() != null) {
            if (startDate == null || tracker.getQuitAlcoholDate().isBefore(startDate)) {
                startDate = tracker.getQuitAlcoholDate();
            }
        }

        int maxStreak = Math.max(currentSmokingStreak, currentAlcoholStreak);
        int habitJourneyProgress = (int) Math.min(100, (maxStreak * 100.0) / 365.0);

        List<String> milestones = calculateMilestones(smokeFreeDays, alcoholFreeDays);

        List<TrackerResponse.DailyCheckInDto> checkInDtos = checkIns.stream().map(ci -> 
            TrackerResponse.DailyCheckInDto.builder()
                .date(ci.getCheckInDate())
                .didSmoke(ci.isDidSmoke())
                .cigarettesSmoked(ci.getCigarettesSmoked())
                .didDrink(ci.isDidDrink())
                .drinksConsumed(ci.getDrinksConsumed())
                .cravingLevel(ci.getCravingLevel())
                .mood(ci.getMood())
                .notes(ci.getNotes())
                .build()
        ).collect(Collectors.toList());

        return TrackerResponse.builder()
                .smokeFreeDays(smokeFreeDays)
                .alcoholFreeDays(alcoholFreeDays)
                .cigarettesAvoided(cigarettesAvoided)
                .drinksAvoided(drinksAvoided)
                .moneySavedCigarettes(moneySavedCigarettes)
                .moneySavedAlcohol(moneySavedAlcohol)
                .currentSmokingStreak(currentSmokingStreak)
                .currentAlcoholStreak(currentAlcoholStreak)
                .bestSmokingStreak(bestSmokingStreak)
                .bestAlcoholStreak(bestAlcoholStreak)
                .startDate(startDate)
                .habitJourneyProgress(habitJourneyProgress)
                .quitSmokingDate(tracker.getQuitSmokingDate())
                .quitAlcoholDate(tracker.getQuitAlcoholDate())
                .cigarettesPerDay(tracker.getCigarettesPerDay())
                .pricePerCigarette(tracker.getPricePerCigarette())
                .cigarettesPerPacket(tracker.getCigarettesPerPacket())
                .drinksPerWeek(tracker.getDrinksPerWeek())
                .costPerDrink(tracker.getCostPerDrink())
                .currency(tracker.getCurrency() != null ? tracker.getCurrency() : "$")
                .dailyGoal(tracker.getDailyGoal())
                .motivationMessage(tracker.getMotivationMessage())
                .dailyMotivationalQuote("Every day is a new beginning. Take a deep breath and start again.")
                .milestones(milestones)
                .checkIns(checkInDtos)
                .build();
    }

    private int calculateStreak(List<DailyCheckIn> checkIns, boolean isSmoking, LocalDate quitDate) {
        if (checkIns.isEmpty() || quitDate == null) return 0;
        
        java.util.Set<LocalDate> successfulDates = checkIns.stream()
                .filter(ci -> !ci.getCheckInDate().isBefore(quitDate))
                .filter(ci -> isSmoking ? !ci.isDidSmoke() : !ci.isDidDrink())
                .map(DailyCheckIn::getCheckInDate)
                .collect(Collectors.toSet());

        int streak = 0;
        LocalDate d = LocalDate.now();
        if (!successfulDates.contains(d)) {
            d = d.minusDays(1);
        }
        while (successfulDates.contains(d)) {
            streak++;
            d = d.minusDays(1);
        }
        return streak;
    }

    private int calculateBestStreak(List<DailyCheckIn> checkIns, boolean isSmoking, LocalDate quitDate) {
        if (checkIns.isEmpty() || quitDate == null) return 0;
        
        List<LocalDate> successfulDates = checkIns.stream()
                .filter(ci -> !ci.getCheckInDate().isBefore(quitDate))
                .filter(ci -> isSmoking ? !ci.isDidSmoke() : !ci.isDidDrink())
                .map(DailyCheckIn::getCheckInDate)
                .sorted()
                .collect(Collectors.toList());

        int bestStreak = 0;
        int currentStreak = 0;
        LocalDate lastDate = null;

        for (LocalDate date : successfulDates) {
            if (lastDate == null || date.equals(lastDate.plusDays(1))) {
                currentStreak++;
            } else {
                currentStreak = 1;
            }
            bestStreak = Math.max(bestStreak, currentStreak);
            lastDate = date;
        }
        return bestStreak;
    }

    private List<String> calculateMilestones(int smokeFreeDays, int alcoholFreeDays) {
        List<String> milestones = new ArrayList<>();
        int maxDays = Math.max(smokeFreeDays, alcoholFreeDays);
        
        if (maxDays >= 1) milestones.add("1 day");
        if (maxDays >= 3) milestones.add("3 days");
        if (maxDays >= 7) milestones.add("7 days");
        if (maxDays >= 14) milestones.add("14 days");
        if (maxDays >= 30) milestones.add("30 days");
        if (maxDays >= 60) milestones.add("60 days");
        if (maxDays >= 90) milestones.add("90 days");
        if (maxDays >= 180) milestones.add("6 months");
        if (maxDays >= 365) milestones.add("1 year");
        
        return milestones;
    }
}
