import type { ShopItem } from './itemCatalog'

export type FoodActionCode = 'Eat1' | 'Eat2'
export type CommodityActionCode = 'Clean1' | 'Clean2'
export type MedicineActionCode = 'Cure1' | 'Cure2' | 'Revival'

export interface ItemInteractionProfile<TCode extends string> {
  code: TCode
  durationMs: number
}

function buildExplicitMap<TCode extends string>(
  entries: ReadonlyArray<readonly [readonly string[], ItemInteractionProfile<TCode>]>,
): Record<string, ItemInteractionProfile<TCode>> {
  const result: Record<string, ItemInteractionProfile<TCode>> = {}
  for (const [ids, profile] of entries) {
    for (const id of ids) {
      result[id] = profile
    }
  }
  return result
}

const FOOD_INTERACTION_MAP = buildExplicitMap<FoodActionCode>([
  [[
    '100010031',
    '100010033',
    '100010035',
    '100010037',
    '100010039',
    '102010001',
    '102010003',
    '102010004',
    '102010007',
    '102010009',
    '102010010',
    '102010012',
    '102010013',
    '102010014',
    '102010016',
    '102010020',
    '102010024',
    '102010031',
    '102010032',
    '102010085',
    '102010090',
  ], { code: 'Eat1', durationMs: 1400 }],
  [[
    '100010032',
    '100010034',
    '100010036',
    '100010038',
    '100010040',
    '102010002',
    '102010005',
    '102010006',
    '102010008',
    '102010011',
    '102010015',
    '102010021',
    '102010022',
    '102010023',
    '102010025',
    '102010026',
    '102010027',
    '102010028',
    '102010029',
    '102010030',
    '102010033',
    '102010034',
    '102010086',
    '102010087',
    '102010088',
    '102010089',
    '102010092',
    '102010095',
    '103010088',
  ], { code: 'Eat2', durationMs: 1600 }],
])

const COMMODITY_INTERACTION_MAP = buildExplicitMap<CommodityActionCode>([
  [[
    '102020003',
    '102020005',
    '102020006',
    '102020011',
    '102020012',
    '102020013',
    '102020015',
    '102020017',
    '102020019',
    '102020021',
    '102020023',
  ], { code: 'Clean1', durationMs: 1500 }],
  [[
    '102020001',
    '102020002',
    '102020007',
    '102020008',
    '102020009',
    '102020010',
    '102020014',
    '102020016',
    '102020020',
    '102020022',
    '102020024',
  ], { code: 'Clean2', durationMs: 1700 }],
])

const MEDICINE_INTERACTION_MAP = buildExplicitMap<MedicineActionCode>([
  [[
    '10001',
    '10002',
    '10003',
    '10004',
    '10005',
  ], { code: 'Cure1', durationMs: 1400 }],
  [[
    '20001',
    '20002',
    '20003',
    '20004',
    '20005',
    '30001',
    '30002',
    '30003',
    '30004',
    '30005',
    '40001',
    '40002',
    '40003',
    '40004',
    '40005',
    '50001',
  ], { code: 'Cure2', durationMs: 1600 }],
  [[
    '60001',
  ], { code: 'Revival', durationMs: 1800 }],
])

export function resolveFoodInteractionProfile(item: ShopItem): ItemInteractionProfile<FoodActionCode> {
  return FOOD_INTERACTION_MAP[item.id] ?? { code: 'Eat1', durationMs: 1400 }
}

export function resolveCommodityInteractionProfile(item: ShopItem): ItemInteractionProfile<CommodityActionCode> {
  return COMMODITY_INTERACTION_MAP[item.id] ?? { code: 'Clean1', durationMs: 1500 }
}

export function resolveMedicineInteractionProfile(item: ShopItem): ItemInteractionProfile<MedicineActionCode> {
  return MEDICINE_INTERACTION_MAP[item.id] ?? { code: 'Cure1', durationMs: 1400 }
}

export function resolveFoodActionCode(item: ShopItem): FoodActionCode {
  return resolveFoodInteractionProfile(item).code
}

export function resolveCommodityActionCode(item: ShopItem): CommodityActionCode {
  return resolveCommodityInteractionProfile(item).code
}

export function resolveMedicineActionCode(item: ShopItem): MedicineActionCode {
  return resolveMedicineInteractionProfile(item).code
}
