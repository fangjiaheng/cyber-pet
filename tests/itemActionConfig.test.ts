import * as assert from 'node:assert/strict'

import {
  COMMODITY_ITEMS,
  FOOD_ITEMS,
  MEDICINE_ITEMS,
  getItemById,
} from '../src/shared/itemCatalog'
import {
  resolveCommodityInteractionProfile,
  resolveFoodInteractionProfile,
  resolveMedicineInteractionProfile,
} from '../src/shared/itemActionConfig'

function runTest(name: string, fn: () => void) {
  try {
    fn()
    console.log(`PASS ${name}`)
  } catch (error) {
    console.error(`FAIL ${name}`)
    throw error
  }
}

runTest('all food items resolve to an explicit interaction profile', () => {
  for (const item of FOOD_ITEMS) {
    const profile = resolveFoodInteractionProfile(item)
    assert.ok(profile.code === 'Eat1' || profile.code === 'Eat2')
    assert.ok(profile.durationMs > 0)
  }
})

runTest('all commodity items resolve to an explicit interaction profile', () => {
  for (const item of COMMODITY_ITEMS) {
    const profile = resolveCommodityInteractionProfile(item)
    assert.ok(profile.code === 'Clean1' || profile.code === 'Clean2')
    assert.ok(profile.durationMs > 0)
  }
})

runTest('all medicine items resolve to an explicit interaction profile', () => {
  for (const item of MEDICINE_ITEMS) {
    const profile = resolveMedicineInteractionProfile(item)
    assert.ok(profile.code === 'Cure1' || profile.code === 'Cure2' || profile.code === 'Revival')
    assert.ok(profile.durationMs > 0)
  }
})

runTest('known shop items map to the refined expected profiles', () => {
  assert.deepEqual(resolveFoodInteractionProfile(getItemById('102010001')!), { code: 'Eat1', durationMs: 1400 })
  assert.deepEqual(resolveFoodInteractionProfile(getItemById('102010005')!), { code: 'Eat2', durationMs: 1600 })
  assert.deepEqual(resolveCommodityInteractionProfile(getItemById('102020012')!), { code: 'Clean1', durationMs: 1500 })
  assert.deepEqual(resolveCommodityInteractionProfile(getItemById('102020009')!), { code: 'Clean2', durationMs: 1700 })
  assert.deepEqual(resolveMedicineInteractionProfile(getItemById('10001')!), { code: 'Cure1', durationMs: 1400 })
  assert.deepEqual(resolveMedicineInteractionProfile(getItemById('30001')!), { code: 'Cure2', durationMs: 1600 })
  assert.deepEqual(resolveMedicineInteractionProfile(getItemById('60001')!), { code: 'Revival', durationMs: 1800 })
})
