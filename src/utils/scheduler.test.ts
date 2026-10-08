/**
 * Verification test suite for AURELIS Scheduling Engine
 * Run with tsx to validate all calendar calculations.
 */

import {
  addCalendarDays,
  differenceInCalendarDays,
  generateSchedule,
  recalculateScheduleOnDateChange,
  DEFAULT_REVISION_INTERVALS,
} from './scheduler';

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`TEST FAILED: ${message}`);
  }
}

console.log('--- RUNNING AURELIS SCHEDULER ENGINE TESTS ---');

// Test 1: Day 1 -> Day 3, 5, 7, 14, 21, 28 calculation from Oct 8, 2026
{
  const base = '2026-10-08';
  const schedule = generateSchedule('topic_1', base, DEFAULT_REVISION_INTERVALS);

  assert(schedule.length === 7, 'Should generate 7 steps');
  assert(schedule[0].scheduledDate === '2026-10-08', 'Step 0 (Learn) should be Day 1: 2026-10-08');
  assert(schedule[1].scheduledDate === '2026-10-10', 'Step 1 (Revision 1) should be Day 3 (+2 days): 2026-10-10');
  assert(schedule[2].scheduledDate === '2026-10-12', 'Step 2 (Revision 2) should be Day 5 (+4 days): 2026-10-12');
  assert(schedule[3].scheduledDate === '2026-10-14', 'Step 3 (Weekly Test) should be Day 7 (+6 days): 2026-10-14');
  assert(schedule[4].scheduledDate === '2026-10-21', 'Step 4 (Review 1) should be Day 14 (+13 days): 2026-10-21');
  assert(schedule[5].scheduledDate === '2026-10-28', 'Step 5 (Review 2) should be Day 21 (+20 days): 2026-10-28');
  assert(schedule[6].scheduledDate === '2026-11-04', 'Step 6 (Review 3) should be Day 28 (+27 days): 2026-11-04 (month rollover)');
  console.log('✓ Test 1 Passed: Standard intervals and October -> November month transition verified.');
}

// Test 2: Month transition crossing 30-day month (e.g. Sept 28 -> Oct)
{
  const base = '2026-09-28';
  assert(addCalendarDays(base, 2) === '2026-09-30', 'Sept 28 + 2 = Sept 30');
  assert(addCalendarDays(base, 3) === '2026-10-01', 'Sept 28 + 3 = Oct 01');
  assert(addCalendarDays(base, 6) === '2026-10-04', 'Sept 28 + 6 = Oct 04');
  console.log('✓ Test 2 Passed: 30-day month transition verified.');
}

// Test 3: Leap year handling (2028 is a leap year; Feb has 29 days)
{
  const leapBase = '2028-02-27';
  assert(addCalendarDays(leapBase, 1) === '2028-02-28', 'Leap year Feb 27 + 1 = Feb 28');
  assert(addCalendarDays(leapBase, 2) === '2028-02-29', 'Leap year Feb 27 + 2 = Feb 29 (leap day!)');
  assert(addCalendarDays(leapBase, 3) === '2028-03-01', 'Leap year Feb 27 + 3 = March 01');
  assert(differenceInCalendarDays('2028-03-01', leapBase) === 3, 'Difference across leap day is 3');

  // Compare non-leap year (2027)
  const nonLeapBase = '2027-02-27';
  assert(addCalendarDays(nonLeapBase, 2) === '2027-03-01', 'Non-leap year Feb 27 + 2 = March 01');
  console.log('✓ Test 3 Passed: Leap year vs Non-leap year calculations verified.');
}

// Test 4: Year boundary transition (Dec 25 -> Jan)
{
  const yearEnd = '2026-12-25';
  assert(addCalendarDays(yearEnd, 7) === '2027-01-01', 'Dec 25 + 7 = Jan 01 next year');
  assert(addCalendarDays(yearEnd, 20) === '2027-01-14', 'Dec 25 + 20 = Jan 14 next year');
  console.log('✓ Test 4 Passed: Year boundary transition verified.');
}

// Test 5: Multiple topics on the same date with independent schedules
{
  const date = '2026-10-08';
  const topicPhysics = generateSchedule('topic_phy', date);
  const topicChem = generateSchedule('topic_chem', date);

  assert(topicPhysics[1].scheduledDate === topicChem[1].scheduledDate, 'Same date topics have identical schedule dates initially');
  // Complete one, the other remains scheduled
  topicPhysics[1].status = 'completed';
  assert(topicPhysics[1].status === 'completed', 'Physics step completed');
  assert(topicChem[1].status === 'scheduled', 'Chem step remains scheduled independently');
  console.log('✓ Test 5 Passed: Multiple topics on same date remain independent.');
}

// Test 6: Safe recalculation on study date change (preserving completed reviews)
{
  const originalDate = '2026-10-01';
  const schedule = generateSchedule('topic_edit', originalDate);
  // Mark step 0 and step 1 as completed
  schedule[0].status = 'completed';
  schedule[1].status = 'completed';
  schedule[1].confidenceRating = 'easy';

  // Move base studiedDate to 2026-10-05
  const updatedSchedule = recalculateScheduleOnDateChange(schedule, '2026-10-05');

  assert(updatedSchedule[0].status === 'completed', 'Completed step 0 must be preserved');
  assert(updatedSchedule[1].status === 'completed', 'Completed step 1 must be preserved');
  assert(updatedSchedule[1].scheduledDate === '2026-10-03', 'Completed step 1 date preserved');
  // Future uncompleted step 2 (+4 days from Oct 5) should now be Oct 9
  assert(updatedSchedule[2].scheduledDate === '2026-10-09', 'Step 2 recalculates to 2026-10-09');
  console.log('✓ Test 6 Passed: Historical reviews preserved during date shift.');
}

console.log('--- ALL 6 SCHEDULER TESTS COMPLETED SUCCESSFULLY ---');
