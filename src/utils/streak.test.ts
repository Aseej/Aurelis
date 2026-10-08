/**
 * Verification test suite for AURELIS Streak Engine
 */

import { calculateStreak } from './streak';
import { AppState } from '../types';
import { DEFAULT_SUBJECTS, DEFAULT_SETTINGS } from '../services/storage';

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`TEST FAILED: ${message}`);
  }
}

console.log('--- RUNNING AURELIS STREAK ENGINE TESTS ---');

const baseMockState: AppState = {
  subjects: DEFAULT_SUBJECTS,
  topics: [],
  weeklyTests: [],
  errorLogs: [],
  settings: DEFAULT_SETTINGS,
  isDemoData: false,
};

// Test 1: Active today with 3 consecutive days
{
  const today = '2026-10-08';
  const state: AppState = {
    ...baseMockState,
    studyDaysHistory: ['2026-10-06', '2026-10-07', '2026-10-08'],
  };

  const streak = calculateStreak(state, today);
  assert(streak.currentStreak === 3, `Expected current streak of 3, got ${streak.currentStreak}`);
  assert(streak.studiedToday === true, 'Should be studied today');
  assert(streak.longestStreak >= 3, 'Longest streak >= 3');
  console.log('✓ Test 1 Passed: 3-day active streak ending today verified.');
}

// Test 2: Studied yesterday but not yet today (Streak is preserved pending today's study)
{
  const today = '2026-10-08';
  const state: AppState = {
    ...baseMockState,
    studyDaysHistory: ['2026-10-05', '2026-10-06', '2026-10-07'], // ends yesterday
  };

  const streak = calculateStreak(state, today);
  assert(streak.currentStreak === 3, `Streak should be 3 (intact from yesterday), got ${streak.currentStreak}`);
  assert(streak.studiedToday === false, 'Not studied today yet');
  assert(streak.studiedYesterday === true, 'Studied yesterday');
  assert(streak.statusMessage.includes('Revise today to extend'), 'Status message prompts revision');
  console.log('✓ Test 2 Passed: Intact pending streak from yesterday verified.');
}

// Test 3: Streak broken (missed yesterday and today)
{
  const today = '2026-10-08';
  const state: AppState = {
    ...baseMockState,
    studyDaysHistory: ['2026-10-04', '2026-10-05'], // missed 06 and 07
  };

  const streak = calculateStreak(state, today);
  assert(streak.currentStreak === 0, `Expected 0 current streak, got ${streak.currentStreak}`);
  assert(streak.longestStreak === 2, `Expected longest streak of 2, got ${streak.longestStreak}`);
  console.log('✓ Test 3 Passed: Broken streak resets to 0 while preserving longest streak.');
}

// Test 4: Rolling 7-day consistency track
{
  const today = '2026-10-08';
  const state: AppState = {
    ...baseMockState,
    studyDaysHistory: ['2026-10-06', '2026-10-07', '2026-10-08'],
  };

  const streak = calculateStreak(state, today);
  assert(streak.rolling7Days.length === 7, 'Rolling 7-day list must have 7 items');
  assert(streak.rolling7Days[6].isToday === true, 'Last item is today');
  assert(streak.weeklyActiveDaysCount === 3, '3 active days this week');
  console.log('✓ Test 4 Passed: Rolling 7-day consistency track verified.');
}

console.log('--- ALL STREAK ENGINE TESTS PASSED ---');
