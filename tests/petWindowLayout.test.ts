import * as assert from 'node:assert/strict'

import { getPetAnchorOffset, getPetAnchorPoint } from '../src/shared/petWindowLayout.ts'

function runTest(name: string, fn: () => void) {
  try {
    fn()
    console.log(`PASS ${name}`)
  } catch (error) {
    console.error(`FAIL ${name}`)
    throw error
  }
}

runTest('bubble resize compensation keeps the pet anchor fixed on screen', () => {
  const petAnchor = getPetAnchorPoint('pet')
  const bubbleAnchor = getPetAnchorPoint('bubble')
  const offset = getPetAnchorOffset('pet', 'bubble')

  assert.deepEqual(
    {
      x: bubbleAnchor.x + offset.x,
      y: bubbleAnchor.y + offset.y,
    },
    petAnchor,
  )
})

runTest('bubble round-trip compensation returns to the original anchor', () => {
  const petAnchor = getPetAnchorPoint('pet')
  const bubbleAnchor = getPetAnchorPoint('bubble')
  const toBubble = getPetAnchorOffset('pet', 'bubble')
  const backToPet = getPetAnchorOffset('bubble', 'pet')

  const bubbleScreenAnchor = {
    x: bubbleAnchor.x + toBubble.x,
    y: bubbleAnchor.y + toBubble.y,
  }

  const petScreenAnchor = {
    x: petAnchor.x + backToPet.x,
    y: petAnchor.y + backToPet.y,
  }

  assert.deepEqual(bubbleScreenAnchor, petAnchor)
  assert.deepEqual(petScreenAnchor, bubbleAnchor)
})

runTest('action dropdown uses the same pet anchor before entering bubble mode', () => {
  const actionDropdownAnchor = getPetAnchorPoint('action-dropdown')
  const bubbleAnchor = getPetAnchorPoint('bubble')
  const offset = getPetAnchorOffset('action-dropdown', 'bubble')

  assert.deepEqual(actionDropdownAnchor, getPetAnchorPoint('pet'))
  assert.deepEqual(
    {
      x: bubbleAnchor.x + offset.x,
      y: bubbleAnchor.y + offset.y,
    },
    actionDropdownAnchor,
  )
})

runTest('bubble mode keeps the same anchor as the pet window', () => {
  const offset = getPetAnchorOffset('pet', 'bubble')

  assert.equal(offset.x, 0)
  assert.equal(offset.y, 0)
})

runTest('chat resize compensation keeps the pet anchor fixed on screen', () => {
  const petAnchor = getPetAnchorPoint('pet')
  const chatAnchor = getPetAnchorPoint('chat')
  const offset = getPetAnchorOffset('pet', 'chat')

  assert.deepEqual(
    {
      x: chatAnchor.x + offset.x,
      y: chatAnchor.y + offset.y,
    },
    petAnchor,
  )
})

runTest('chat round-trip compensation returns to the original anchor', () => {
  const petAnchor = getPetAnchorPoint('pet')
  const chatAnchor = getPetAnchorPoint('chat')
  const toChat = getPetAnchorOffset('pet', 'chat')
  const backToPet = getPetAnchorOffset('chat', 'pet')

  const chatScreenAnchor = {
    x: chatAnchor.x + toChat.x,
    y: chatAnchor.y + toChat.y,
  }

  const petScreenAnchor = {
    x: petAnchor.x + backToPet.x,
    y: petAnchor.y + backToPet.y,
  }

  assert.deepEqual(chatScreenAnchor, petAnchor)
  assert.deepEqual(petScreenAnchor, chatAnchor)
})
