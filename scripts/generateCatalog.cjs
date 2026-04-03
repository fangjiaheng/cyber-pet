const data = require('./shop_data.json');
const fs = require('fs');

let ts = '';

ts += `// 物品目录 - 从原版 QQ宠物 shop.js 转录
// 自动生成，请勿手动编辑

// ============ 类型定义 ============

export type ItemCategory = 'food' | 'commodity' | 'medicine' | 'background'
export type RecType = 'hot' | 'new' | 'recommand' | ''

export interface ShopItem {
  id: string
  name: string
  category: ItemCategory
  price: number        // -1 表示非卖品（仅通过任务/活动获得）
  starve: number       // 饥饿恢复量
  clean: number        // 清洁恢复量
  charm: number        // 魅力加成
  intel: number        // 智力加成
  strong: number       // 武力加成
  desc: string
  rectype: RecType     // 推荐类型标记
  iconPath: string     // 图标路径 (相对 public/)
}

export interface MedicineItem extends ShopItem {
  category: 'medicine'
}

// 学习科目
export type StudySubject = 'chinese' | 'mathematics' | 'politics' | 'music' | 'art' | 'manner' | 'pe' | 'labouring' | 'wushu'

// 学校等级
export type SchoolLevel = '小学' | '中学' | '大学' | '研究生'

export interface StudyEntry {
  key: string
  subject: StudySubject
  subjectName: string    // 中文科目名
  school: SchoolLevel
  tolkName: string       // 显示名称
  classTime: number      // 每节课时长(分钟)
  classNum: number       // 该等级最大学时
  classNumUp: number     // 前置学时要求
  intel: number
  charm: number
  strong: number
  starve: number         // 饥饿消耗
  clean: number          // 清洁消耗
}

export interface WorkEntry {
  id: string
  name: string
  tolkName: string       // 工作中显示名
  desc: string
  need: number           // 等级要求
  yb: number             // 元宝收益
  useTime: number        // 工作时长(分钟)
  charm: number          // 魅力奖励
  intel: number          // 智力奖励
  strong: number         // 武力奖励
  starve: number         // 饥饿消耗
  clean: number          // 清洁消耗
  mood: number           // 心情消耗
  education: Partial<Record<StudySubject, number>>  // 学历要求
}

// ============ 食物数据 ============

`;

function getIconPath(item) {
  const id = item.id;
  if (item.type === 'food') {
    return 'assets/1.2.4source/img_res/food/' + id + '.gif';
  } else if (item.type === 'commodity') {
    return 'assets/1.2.4source/img_res/commodity/' + id + '.gif';
  } else if (item.type === 'medicine') {
    return 'assets/1.2.4source/img_res/medicine/' + id + '.gif';
  } else if (item.type === 'background') {
    return 'assets/1.2.4source/Background/' + id + '.png';
  }
  return '';
}

// Food: original 10 free + all purchasable
const freeFood = ['100010031','100010032','100010033','100010034','100010035','100010036','100010037','100010038','100010039','100010040'];
const allFood = Object.values(data.food).filter(f => f.price >= 0 || freeFood.includes(f.id));

ts += 'export const FOOD_ITEMS: ShopItem[] = [\n';
allFood.forEach(f => {
  ts += '  { ' +
    'id: ' + JSON.stringify(f.id) + ', ' +
    'name: ' + JSON.stringify(f.name) + ', ' +
    'category: "food", ' +
    'price: ' + f.price + ', ' +
    'starve: ' + (f.starve || 0) + ', ' +
    'clean: ' + (f.clean || 0) + ', ' +
    'charm: ' + (f.charm || 0) + ', ' +
    'intel: ' + (f.intel || 0) + ', ' +
    'strong: ' + (f.strong || 0) + ', ' +
    'desc: ' + JSON.stringify(f.desc || '') + ', ' +
    'rectype: ' + JSON.stringify(f.rectype || '') + ', ' +
    'iconPath: ' + JSON.stringify(getIconPath(f)) +
    ' },\n';
});
ts += ']\n\n';

// Commodity: original 6 free + all purchasable
const freeCommodity = ['102020011','102020012','102020013','102020014','102020015','102020016'];
const allCommodity = Object.values(data.commodity).filter(c => c.price >= 0 || freeCommodity.includes(c.id));

ts += '// ============ 商品/清洁用品数据 ============\n\n';
ts += 'export const COMMODITY_ITEMS: ShopItem[] = [\n';
allCommodity.forEach(c => {
  ts += '  { ' +
    'id: ' + JSON.stringify(c.id) + ', ' +
    'name: ' + JSON.stringify(c.name) + ', ' +
    'category: "commodity", ' +
    'price: ' + c.price + ', ' +
    'starve: ' + (c.starve || 0) + ', ' +
    'clean: ' + (c.clean || 0) + ', ' +
    'charm: ' + (c.charm || 0) + ', ' +
    'intel: ' + (c.intel || 0) + ', ' +
    'strong: ' + (c.strong || 0) + ', ' +
    'desc: ' + JSON.stringify(c.desc || '') + ', ' +
    'rectype: ' + JSON.stringify(c.rectype || '') + ', ' +
    'iconPath: ' + JSON.stringify(getIconPath(c)) +
    ' },\n';
});
ts += ']\n\n';

// Medicine: all 22
ts += '// ============ 药品数据 ============\n\n';
ts += 'export const MEDICINE_ITEMS: ShopItem[] = [\n';
Object.values(data.medicine).forEach(m => {
  ts += '  { ' +
    'id: ' + JSON.stringify(m.id) + ', ' +
    'name: ' + JSON.stringify(m.name) + ', ' +
    'category: "medicine", ' +
    'price: ' + m.price + ', ' +
    'starve: ' + (m.starve || 0) + ', ' +
    'clean: ' + (m.clean || 0) + ', ' +
    'charm: ' + (m.charm || 0) + ', ' +
    'intel: ' + (m.intel || 0) + ', ' +
    'strong: ' + (m.strong || 0) + ', ' +
    'desc: ' + JSON.stringify(m.desc || '') + ', ' +
    'rectype: ' + JSON.stringify(m.rectype || '') + ', ' +
    'iconPath: ' + JSON.stringify(getIconPath(m)) +
    ' },\n';
});
ts += ']\n\n';

// Background: all 17
ts += '// ============ 背景数据 ============\n\n';
ts += 'export const BACKGROUND_ITEMS: ShopItem[] = [\n';
Object.values(data.background).forEach(b => {
  ts += '  { ' +
    'id: ' + JSON.stringify(b.id) + ', ' +
    'name: ' + JSON.stringify(b.name) + ', ' +
    'category: "background", ' +
    'price: ' + b.price + ', ' +
    'starve: 0, clean: 0, charm: 0, intel: 0, strong: 0, ' +
    'desc: ' + JSON.stringify(b.desc || '') + ', ' +
    'rectype: ' + JSON.stringify(b.rectype || '') + ', ' +
    'iconPath: ' + JSON.stringify(getIconPath(b)) +
    ' },\n';
});
ts += ']\n\n';

// Study entries
const subjectNameMap = {
  chinese: '语文', mathematics: '数学', politics: '政治',
  music: '音乐', art: '艺术', manner: '礼仪',
  pe: '体育', labouring: '劳技', wushu: '武术'
};

ts += '// ============ 学习数据 ============\n\n';
ts += 'export const STUDY_ENTRIES: StudyEntry[] = [\n';
Object.entries(data.study).forEach(([key, s]) => {
  ts += '  { ' +
    'key: ' + JSON.stringify(key) + ', ' +
    'subject: ' + JSON.stringify(s.value) + ' as StudySubject, ' +
    'subjectName: ' + JSON.stringify(subjectNameMap[s.value] || s.object || '') + ', ' +
    'school: ' + JSON.stringify(s.school) + ' as SchoolLevel, ' +
    'tolkName: ' + JSON.stringify(s.tolkName || '') + ', ' +
    'classTime: ' + (s.classTime || 45) + ', ' +
    'classNum: ' + (s.classNum || 0) + ', ' +
    'classNumUp: ' + (s.classNumUp || 0) + ', ' +
    'intel: ' + (s.intel || 0) + ', ' +
    'charm: ' + (s.charm || 0) + ', ' +
    'strong: ' + (s.strong || 0) + ', ' +
    'starve: ' + (s.starve || 0) + ', ' +
    'clean: ' + (s.clean || 0) +
    ' },\n';
});
ts += ']\n\n';

// Work entries
ts += '// ============ 打工数据 ============\n\n';
ts += 'export const WORK_ENTRIES: WorkEntry[] = [\n';
Object.entries(data.work).forEach(([key, w]) => {
  ts += '  { ' +
    'id: ' + JSON.stringify(w.id) + ', ' +
    'name: ' + JSON.stringify(w.name) + ', ' +
    'tolkName: ' + JSON.stringify(w.tolkName || '') + ', ' +
    'desc: ' + JSON.stringify(w.desc || '') + ', ' +
    'need: ' + (w.need || 0) + ', ' +
    'yb: ' + (w.yb || 0) + ', ' +
    'useTime: ' + (w.useTime || 30) + ', ' +
    'charm: ' + (w.charm || 0) + ', ' +
    'intel: ' + (w.intel || 0) + ', ' +
    'strong: ' + (w.strong || 0) + ', ' +
    'starve: ' + (w.starve || 0) + ', ' +
    'clean: ' + (w.clean || 0) + ', ' +
    'mood: ' + (w.mood || 0) + ', ' +
    'education: ' + JSON.stringify(w.education || {}) +
    ' },\n';
});
ts += ']\n\n';

// Lookup helpers
ts += `// ============ 查找工具 ============

/** 所有商店物品的ID索引 */
const _itemIndex = new Map<string, ShopItem>()

function _buildIndex() {
  if (_itemIndex.size > 0) return
  for (const list of [FOOD_ITEMS, COMMODITY_ITEMS, MEDICINE_ITEMS, BACKGROUND_ITEMS]) {
    for (const item of list) {
      _itemIndex.set(item.id, item)
    }
  }
}

/** 根据ID查找物品 */
export function getItemById(id: string): ShopItem | undefined {
  _buildIndex()
  return _itemIndex.get(id)
}

/** 获取某分类的可购买物品（price >= 0） */
export function getPurchasableItems(category: ItemCategory): ShopItem[] {
  const map: Record<ItemCategory, ShopItem[]> = {
    food: FOOD_ITEMS,
    commodity: COMMODITY_ITEMS,
    medicine: MEDICINE_ITEMS,
    background: BACKGROUND_ITEMS,
  }
  return (map[category] || []).filter(item => item.price >= 0)
}

/** 获取某分类的全部物品 */
export function getAllItems(category: ItemCategory): ShopItem[] {
  const map: Record<ItemCategory, ShopItem[]> = {
    food: FOOD_ITEMS,
    commodity: COMMODITY_ITEMS,
    medicine: MEDICINE_ITEMS,
    background: BACKGROUND_ITEMS,
  }
  return map[category] || []
}

/** 查找可用于治疗指定疾病的药品ID列表 */
export const DISEASE_MEDICINE_MAP: Record<string, string[]> = {
  // 感冒链
  '感冒': ['10001'],           // 板蓝根
  '发烧': ['30004'],           // 退烧药
  '重感冒': ['20001'],         // 银翘丸
  '肺炎': ['30001'],           // 金色消炎水
  // 咳嗽链
  '咳嗽': ['10003'],           // 枇杷糖浆
  '支气管炎': ['20003'],       // 甘草剂
  '哮喘': ['30003'],           // 定喘丸
  '肺结核': ['40003'],         // 通风散
  // 消化链
  '肚子胀': ['10002'],         // 消食片
  '胃炎': ['20002'],           // 蓝色消炎水
  '胃溃疡': ['30002'],         // 龙胆草
  '胃癌': ['40002'],           // 仙人汤
}

/** 万能药品 */
export const UNIVERSAL_MEDICINES = ['50001', '60001']  // 百草丹、还魂丹

/** 新建存档时的初始物品 */
export const STARTER_ITEMS: Record<string, number> = {
  '100010031': 5,   // 雪泥爽 ×5
  '100010036': 3,   // 八宝饭 ×3
  '102020012': 3,   // 宝宝金水 ×3
  '102020011': 2,   // 宝宝爽身粉 ×2
  '10001': 1,       // 板蓝根 ×1
  '10002': 1,       // 消食片 ×1
  '10003': 1,       // 枇杷糖浆 ×1
}
`;

fs.writeFileSync('D:/Code/Pet/pet/src/shared/itemCatalog.ts', ts);
console.log('Generated itemCatalog.ts, size:', ts.length, 'chars');
console.log('Food:', allFood.length, 'Commodity:', allCommodity.length);
