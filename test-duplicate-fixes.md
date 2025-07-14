# Testing Duplicate Idea Fixes

## Test Scenario 1: Real-time Vote Broadcasting
1. Open two browser windows to http://localhost:3003/session/current
2. In Window A: Add idea "coffee-shop"
3. In Window B: Add the same idea "coffee-shop"
4. **Expected Result**: Window A should see the vote count increase from 1 to 2 in real-time

## Test Scenario 2: Multiple Duplicate Prevention
1. In the same session, same user adds "coffee-shop" again
2. **Expected Result**: Vote count should NOT increase beyond the user's single vote
3. Only the timestamp should update to show recent activity

## Test Scenario 3: Tag Format Validation
1. Try adding "coffee shop" (with space)
2. **Expected Result**: Should show validation error with suggestion "coffee-shop"
3. Try adding "saturday morning coffee meetup" (too many words)
4. **Expected Result**: Should suggest "saturday-morning-coffee"

## Test Scenario 4: Case-insensitive Deduplication
1. Add "Coffee-Shop" (different case)
2. **Expected Result**: Should merge with existing "coffee-shop" and increase vote count

## Verification Checklist
- [ ] Real-time vote updates work across multiple users
- [ ] Same user can't inflate vote counts by adding duplicates
- [ ] Tag validation prevents invalid formats
- [ ] Case-insensitive deduplication works
- [ ] Socket.io events are properly broadcast
- [ ] UI updates immediately without page refresh

## Technical Implementation
- SessionManager.addKeyword returns {keyword, isDuplicate}
- Routes check isDuplicate to broadcast correct Socket.io event
- vote-updated event for duplicates, keyword-added for new ideas
- Frontend receives proper vote arrays in real-time
- Tag validation enforced on both frontend and backend
