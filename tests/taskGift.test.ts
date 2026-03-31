import * as assert from 'node:assert/strict'

import {
  claimTaskGift,
  createInitialTaskGiftState,
  getResetBoundary,
  refreshTaskGiftState,
} from '../src/shared/taskGift'

function runTest(name: string, fn: () => void) {
  try {
    fn()
    console.log(`PASS ${name}`)
  } catch (error) {
    console.error(`FAIL ${name}`)
    throw error
  }
}

const baseNow = new Date('2026-03-30T08:00:00+08:00').getTime()

runTest('sign gifts unlock by cycle day and can be claimed once', () => {
  const initial = refreshTaskGiftState(createInitialTaskGiftState(baseNow), baseNow, 0)

  assert.equal(initial.sign.slots[0].isTake, 1)
  assert.equal(initial.sign.slots[1].isTake, 0)

  const claimed = claimTaskGift(initial, 'sign', 0, baseNow, 0)
  assert.equal(claimed.ok, true)
  assert.equal(claimed.state.sign.slots[0].isTake, 2)
  assert.ok((claimed.reward?.experience ?? 0) > 0)

  const claimedAgain = claimTaskGift(claimed.state, 'sign', 0, baseNow, 0)
  assert.equal(claimedAgain.ok, false)
  assert.equal(claimedAgain.reason, 'claimed')
})

runTest('online gifts unlock from accumulated online minutes', () => {
  const initial = refreshTaskGiftState(createInitialTaskGiftState(baseNow), baseNow, 9)
  assert.equal(initial.online.slots[0].isTake, 0)

  const unlocked = refreshTaskGiftState(initial, baseNow, 40)
  assert.equal(unlocked.online.slots[0].isTake, 1)
  assert.equal(unlocked.online.slots[1].isTake, 1)
  assert.equal(unlocked.online.slots[2].isTake, 0)

  const claimed = claimTaskGift(unlocked, 'online', 1, baseNow, 40)
  assert.equal(claimed.ok, true)
  assert.equal(claimed.state.online.slots[1].isTake, 2)
})

runTest('online gifts reset at the next 6am boundary', () => {
  const nearReset = new Date('2026-03-31T05:59:00+08:00').getTime()
  const beforeReset = refreshTaskGiftState(createInitialTaskGiftState(baseNow), nearReset, 220)
  assert.equal(beforeReset.online.slots[7].isTake, 1)

  const afterReset = new Date('2026-03-31T06:01:00+08:00').getTime()
  const refreshed = refreshTaskGiftState(beforeReset, afterReset, 0)

  assert.equal(refreshed.online.cycleStartAt, getResetBoundary(afterReset))
  assert.equal(refreshed.online.slots[0].isTake, 0)
  assert.equal(refreshed.online.slots[7].isTake, 0)
})

runTest('sign gifts roll into a fresh 12-day cycle after the last reward window', () => {
  const initial = createInitialTaskGiftState(baseNow)
  const resetAt = initial.sign.nextResetAt + 60 * 1000
  const refreshed = refreshTaskGiftState(initial, resetAt, 0)

  assert.equal(refreshed.sign.cycleStartAt, getResetBoundary(resetAt))
  assert.equal(refreshed.sign.slots[0].isTake, 1)
  assert.equal(refreshed.sign.slots[1].isTake, 0)
})
