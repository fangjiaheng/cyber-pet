import * as assert from 'node:assert/strict'

import {
  completePetAction,
  createPetActionMachineState,
  requestPetAction,
  type PetActionRequest,
} from '../src/shared/petActionScheduler'

function runTest(name: string, fn: () => void) {
  try {
    fn()
    console.log(`PASS ${name}`)
  } catch (error) {
    console.error(`FAIL ${name}`)
    throw error
  }
}

runTest('higher power action interrupts a lower power action immediately', () => {
  const initial = createPetActionMachineState()
  const play = requestPetAction(initial, { kind: 'idle-random', durationMs: 3000 }, 1_000)
  assert.equal(play.status, 'started')
  assert.equal(play.started?.kind, 'idle-random')

  const heal = requestPetAction(play.state, { kind: 'heal', durationMs: 1600 }, 1_200)
  assert.equal(heal.status, 'started')
  assert.equal(heal.started?.kind, 'heal')
  assert.equal(heal.state.current?.kind, 'heal')
  assert.equal(heal.state.pending, null)
})

runTest('lower power action is queued while a higher power action is still running', () => {
  const initial = createPetActionMachineState()
  const heal = requestPetAction(initial, { kind: 'heal', durationMs: 1600 }, 2_000)
  assert.equal(heal.status, 'started')

  const feed = requestPetAction(heal.state, { kind: 'feed', durationMs: 1400 }, 2_100)
  assert.equal(feed.status, 'queued')
  assert.equal(feed.state.pending?.kind, 'feed')

  const completed = completePetAction(feed.state, 3_700, { force: true })
  assert.equal(completed.completed?.kind, 'heal')
  assert.equal(completed.started?.kind, 'feed')
  assert.equal(completed.state.current?.kind, 'feed')
})

runTest('same action respects canSelfInterrupt = false', () => {
  const initial = createPetActionMachineState()
  const hide = requestPetAction(initial, {
    kind: 'hide',
    durationMs: 2500,
  }, 5_000)
  assert.equal(hide.status, 'started')

  const hideAgain = requestPetAction(hide.state, {
    kind: 'hide',
    durationMs: 2500,
  }, 5_100)
  assert.equal(hideAgain.status, 'ignored')
  assert.equal(hideAgain.reason, 'self-interrupt-disabled')
  assert.equal(hideAgain.state.current?.kind, 'hide')
})

runTest('pending action keeps the higher power candidate when multiple actions are queued', () => {
  const initial = createPetActionMachineState()
  const transition = requestPetAction(initial, { kind: 'transition', durationMs: 2800 }, 8_000)
  assert.equal(transition.status, 'started')

  const randomPlay = requestPetAction(transition.state, { kind: 'idle-random', durationMs: 3000 }, 8_100)
  assert.equal(randomPlay.status, 'ignored')

  const travel = requestPetAction(transition.state, { kind: 'travel', durationMs: 1800 }, 8_150)
  assert.equal(travel.status, 'queued')
  assert.equal(travel.state.pending?.kind, 'travel')

  const taskReward = requestPetAction(travel.state, { kind: 'task-reward', durationMs: 1600 }, 8_200)
  assert.equal(taskReward.status, 'queued')
  assert.equal(taskReward.state.pending?.kind, 'task-reward')
})

runTest('completing an action without a queued successor returns to idle when configured', () => {
  const initial = createPetActionMachineState<PetActionRequest>()
  const clean = requestPetAction(initial, { kind: 'clean', durationMs: 1600 }, 10_000)
  assert.equal(clean.status, 'started')

  const completed = completePetAction(clean.state, 11_700, { force: true })
  assert.equal(completed.started, null)
  assert.equal(completed.shouldReturnToIdle, true)
  assert.equal(completed.state.current, null)
})
