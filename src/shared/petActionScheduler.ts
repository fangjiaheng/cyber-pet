export type PetActionKind =
  | 'feed'
  | 'clean'
  | 'heal'
  | 'task-reward'
  | 'play'
  | 'travel'
  | 'transition'
  | 'idle-random'
  | 'hide'
  | 'quit'

export interface PetActionRequest {
  kind: PetActionKind
  durationMs: number
  power?: number
  canSelfInterrupt?: boolean
  queueWhenBlocked?: boolean
  returnToIdle?: boolean
  interruptLeadMs?: number
  interruptibleAfterMs?: number
}

interface PetActionRule {
  power: number
  canSelfInterrupt: boolean
  queueWhenBlocked: boolean
  returnToIdle: boolean
  interruptLeadMs: number
}

const DEFAULT_ACTION_RULES: Record<PetActionKind, PetActionRule> = {
  feed: {
    power: 60,
    canSelfInterrupt: true,
    queueWhenBlocked: true,
    returnToIdle: true,
    interruptLeadMs: 220,
  },
  clean: {
    power: 60,
    canSelfInterrupt: true,
    queueWhenBlocked: true,
    returnToIdle: true,
    interruptLeadMs: 220,
  },
  heal: {
    power: 75,
    canSelfInterrupt: true,
    queueWhenBlocked: true,
    returnToIdle: true,
    interruptLeadMs: 260,
  },
  'task-reward': {
    power: 70,
    canSelfInterrupt: true,
    queueWhenBlocked: true,
    returnToIdle: true,
    interruptLeadMs: 180,
  },
  play: {
    power: 50,
    canSelfInterrupt: true,
    queueWhenBlocked: false,
    returnToIdle: true,
    interruptLeadMs: 240,
  },
  travel: {
    power: 55,
    canSelfInterrupt: true,
    queueWhenBlocked: true,
    returnToIdle: true,
    interruptLeadMs: 240,
  },
  transition: {
    power: 95,
    canSelfInterrupt: false,
    queueWhenBlocked: false,
    returnToIdle: true,
    interruptLeadMs: 120,
  },
  'idle-random': {
    power: 10,
    canSelfInterrupt: false,
    queueWhenBlocked: false,
    returnToIdle: true,
    interruptLeadMs: 300,
  },
  hide: {
    power: 120,
    canSelfInterrupt: false,
    queueWhenBlocked: false,
    returnToIdle: false,
    interruptLeadMs: 0,
  },
  quit: {
    power: 130,
    canSelfInterrupt: false,
    queueWhenBlocked: false,
    returnToIdle: false,
    interruptLeadMs: 0,
  },
}

interface NormalizedPetActionRequest<T extends PetActionRequest> {
  request: T
  power: number
  canSelfInterrupt: boolean
  queueWhenBlocked: boolean
  returnToIdle: boolean
  durationMs: number
  interruptibleAfterMs: number
}

export interface ActivePetAction<T extends PetActionRequest = PetActionRequest> {
  token: number
  request: T
  kind: PetActionKind
  power: number
  canSelfInterrupt: boolean
  queueWhenBlocked: boolean
  returnToIdle: boolean
  startedAt: number
  interruptibleAt: number
  endsAt: number
}

export interface PetActionMachineState<T extends PetActionRequest = PetActionRequest> {
  current: ActivePetAction<T> | null
  pending: T | null
  lastToken: number
}

export interface RequestPetActionResult<T extends PetActionRequest = PetActionRequest> {
  state: PetActionMachineState<T>
  status: 'started' | 'queued' | 'ignored'
  started: ActivePetAction<T> | null
  reason: 'accepted' | 'queued' | 'blocked-by-power' | 'self-interrupt-disabled'
}

export interface CompletePetActionResult<T extends PetActionRequest = PetActionRequest> {
  state: PetActionMachineState<T>
  completed: ActivePetAction<T> | null
  started: ActivePetAction<T> | null
  shouldReturnToIdle: boolean
}

export function createPetActionMachineState<T extends PetActionRequest = PetActionRequest>(): PetActionMachineState<T> {
  return {
    current: null,
    pending: null,
    lastToken: 0,
  }
}

function normalizePetActionRequest<T extends PetActionRequest>(request: T): NormalizedPetActionRequest<T> {
  const rule = DEFAULT_ACTION_RULES[request.kind]
  const durationMs = Math.max(0, request.durationMs)
  const interruptibleAfterMs = request.interruptibleAfterMs
    ?? Math.max(0, durationMs - (request.interruptLeadMs ?? rule.interruptLeadMs))

  return {
    request,
    power: request.power ?? rule.power,
    canSelfInterrupt: request.canSelfInterrupt ?? rule.canSelfInterrupt,
    queueWhenBlocked: request.queueWhenBlocked ?? rule.queueWhenBlocked,
    returnToIdle: request.returnToIdle ?? rule.returnToIdle,
    durationMs,
    interruptibleAfterMs: Math.min(durationMs, Math.max(0, interruptibleAfterMs)),
  }
}

function startPetAction<T extends PetActionRequest>(
  state: PetActionMachineState<T>,
  normalized: NormalizedPetActionRequest<T>,
  now: number,
): { state: PetActionMachineState<T>; started: ActivePetAction<T> } {
  const token = state.lastToken + 1
  const started: ActivePetAction<T> = {
    token,
    request: normalized.request,
    kind: normalized.request.kind,
    power: normalized.power,
    canSelfInterrupt: normalized.canSelfInterrupt,
    queueWhenBlocked: normalized.queueWhenBlocked,
    returnToIdle: normalized.returnToIdle,
    startedAt: now,
    interruptibleAt: now + normalized.interruptibleAfterMs,
    endsAt: now + normalized.durationMs,
  }

  return {
    state: {
      current: started,
      pending: null,
      lastToken: token,
    },
    started,
  }
}

function shouldReplacePending<T extends PetActionRequest>(pending: T, incoming: T): boolean {
  const pendingNormalized = normalizePetActionRequest(pending)
  const incomingNormalized = normalizePetActionRequest(incoming)

  if (incomingNormalized.power !== pendingNormalized.power) {
    return incomingNormalized.power > pendingNormalized.power
  }

  if (incoming.kind !== pending.kind) {
    return true
  }

  return incomingNormalized.canSelfInterrupt
}

export function requestPetAction<T extends PetActionRequest>(
  state: PetActionMachineState<T>,
  request: T,
  now: number,
): RequestPetActionResult<T> {
  const current = state.current
  const normalizedIncoming = normalizePetActionRequest(request)

  if (!current) {
    const started = startPetAction(state, normalizedIncoming, now)
    return {
      state: started.state,
      status: 'started',
      started: started.started,
      reason: 'accepted',
    }
  }

  const isSameKind = current.kind === request.kind
  if (isSameKind && !normalizedIncoming.canSelfInterrupt) {
    if (normalizedIncoming.queueWhenBlocked) {
      const nextPending = state.pending && !shouldReplacePending(state.pending, request)
        ? state.pending
        : request

      return {
        state: {
          ...state,
          pending: nextPending,
        },
        status: 'queued',
        started: null,
        reason: 'self-interrupt-disabled',
      }
    }

    return {
      state,
      status: 'ignored',
      started: null,
      reason: 'self-interrupt-disabled',
    }
  }

  const canInterruptImmediately =
    normalizedIncoming.power > current.power
    || (normalizedIncoming.power === current.power && now >= current.interruptibleAt)

  if (canInterruptImmediately) {
    const started = startPetAction(state, normalizedIncoming, now)
    return {
      state: started.state,
      status: 'started',
      started: started.started,
      reason: 'accepted',
    }
  }

  if (normalizedIncoming.queueWhenBlocked) {
    const nextPending = state.pending && !shouldReplacePending(state.pending, request)
      ? state.pending
      : request

    return {
      state: {
        ...state,
        pending: nextPending,
      },
      status: 'queued',
      started: null,
      reason: 'queued',
    }
  }

  return {
    state,
    status: 'ignored',
    started: null,
    reason: 'blocked-by-power',
  }
}

export function completePetAction<T extends PetActionRequest>(
  state: PetActionMachineState<T>,
  now: number,
  options?: { force?: boolean },
): CompletePetActionResult<T> {
  const current = state.current

  if (!current) {
    return {
      state,
      completed: null,
      started: null,
      shouldReturnToIdle: false,
    }
  }

  if (!options?.force && now < current.endsAt) {
    return {
      state,
      completed: null,
      started: null,
      shouldReturnToIdle: false,
    }
  }

  const pending = state.pending
  if (pending) {
    const started = startPetAction(
      {
        current: null,
        pending: null,
        lastToken: state.lastToken,
      },
      normalizePetActionRequest(pending),
      now,
    )

    return {
      state: started.state,
      completed: current,
      started: started.started,
      shouldReturnToIdle: false,
    }
  }

  return {
    state: {
      current: null,
      pending: null,
      lastToken: state.lastToken,
    },
    completed: current,
    started: null,
    shouldReturnToIdle: current.returnToIdle,
  }
}
