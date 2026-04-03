// 物品目录 - 从原版 QQ宠物 shop.js 转录
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

export const FOOD_ITEMS: ShopItem[] = [
  { id: "100010031", name: "雪泥爽", category: "food", price: -1, starve: 720, clean: 0, charm: 0, intel: 8, strong: 0, desc: "", rectype: "", iconPath: "assets/1.2.4source/img_res/food/100010031.gif" },
  { id: "100010032", name: "小笼包", category: "food", price: -1, starve: 500, clean: 500, charm: 100, intel: 100, strong: 100, desc: "一颗小笼包，原地爆炸三千里~", rectype: "", iconPath: "assets/1.2.4source/img_res/food/100010032.gif" },
  { id: "100010033", name: "黑森林蛋糕", category: "food", price: -1, starve: 720, clean: 0, charm: 8, intel: 0, strong: 0, desc: "", rectype: "", iconPath: "assets/1.2.4source/img_res/food/100010033.gif" },
  { id: "100010034", name: "鱼肉香肠", category: "food", price: -1, starve: 1080, clean: 0, charm: 0, intel: 0, strong: 15, desc: "", rectype: "", iconPath: "assets/1.2.4source/img_res/food/100010034.gif" },
  { id: "100010035", name: "葡萄香槟", category: "food", price: -1, starve: 900, clean: 0, charm: 0, intel: 12, strong: 0, desc: "", rectype: "", iconPath: "assets/1.2.4source/img_res/food/100010035.gif" },
  { id: "100010036", name: "八宝饭", category: "food", price: -1, starve: 540, clean: 0, charm: 0, intel: 5, strong: 0, desc: "", rectype: "", iconPath: "assets/1.2.4source/img_res/food/100010036.gif" },
  { id: "100010037", name: "长寿面", category: "food", price: -1, starve: 720, clean: 0, charm: 0, intel: 0, strong: 8, desc: "", rectype: "", iconPath: "assets/1.2.4source/img_res/food/100010037.gif" },
  { id: "100010038", name: "火腿汉堡", category: "food", price: -1, starve: 720, clean: 0, charm: 8, intel: 0, strong: 0, desc: "", rectype: "", iconPath: "assets/1.2.4source/img_res/food/100010038.gif" },
  { id: "100010039", name: "饺子", category: "food", price: -1, starve: 900, clean: 0, charm: 0, intel: 12, strong: 0, desc: "", rectype: "", iconPath: "assets/1.2.4source/img_res/food/100010039.gif" },
  { id: "100010040", name: "年糕", category: "food", price: -1, starve: 900, clean: 0, charm: 0, intel: 0, strong: 12, desc: "", rectype: "", iconPath: "assets/1.2.4source/img_res/food/100010040.gif" },
  { id: "102010001", name: "圈圈冰激凌", category: "food", price: 5, starve: 90, clean: 0, charm: 0, intel: 0, strong: 0, desc: "", rectype: "new", iconPath: "assets/1.2.4source/img_res/food/102010001.gif" },
  { id: "102010002", name: "跳跳玉米鱼", category: "food", price: 40, starve: 720, clean: 0, charm: 0, intel: 0, strong: 0, desc: "", rectype: "new", iconPath: "assets/1.2.4source/img_res/food/102010002.gif" },
  { id: "102010003", name: "月光饼饼", category: "food", price: 10, starve: 180, clean: 0, charm: 0, intel: 0, strong: 0, desc: "", rectype: "new", iconPath: "assets/1.2.4source/img_res/food/102010003.gif" },
  { id: "102010004", name: "果味米米花", category: "food", price: 20, starve: 360, clean: 0, charm: 0, intel: 0, strong: 0, desc: "", rectype: "new", iconPath: "assets/1.2.4source/img_res/food/102010004.gif" },
  { id: "102010005", name: "炸虾盖饭", category: "food", price: 100, starve: 1800, clean: 0, charm: 0, intel: 0, strong: 0, desc: "", rectype: "recommand", iconPath: "assets/1.2.4source/img_res/food/102010005.gif" },
  { id: "102010006", name: "蹦豆豆卷", category: "food", price: 60, starve: 1080, clean: 0, charm: 0, intel: 0, strong: 0, desc: "", rectype: "new", iconPath: "assets/1.2.4source/img_res/food/102010006.gif" },
  { id: "102010007", name: "青松茶笋", category: "food", price: 40, starve: 720, clean: 0, charm: 0, intel: 0, strong: 0, desc: "", rectype: "new", iconPath: "assets/1.2.4source/img_res/food/102010007.gif" },
  { id: "102010008", name: "雨披蛋花", category: "food", price: 90, starve: 1620, clean: 0, charm: 0, intel: 0, strong: 0, desc: "", rectype: "hot", iconPath: "assets/1.2.4source/img_res/food/102010008.gif" },
  { id: "102010009", name: "漂漂孔雀果", category: "food", price: 40, starve: 720, clean: 0, charm: 0, intel: 0, strong: 0, desc: "", rectype: "new", iconPath: "assets/1.2.4source/img_res/food/102010009.gif" },
  { id: "102010010", name: "伟大可乐", category: "food", price: 20, starve: 360, clean: 0, charm: 0, intel: 0, strong: 0, desc: "", rectype: "new", iconPath: "assets/1.2.4source/img_res/food/102010010.gif" },
  { id: "102010011", name: "断码香肠", category: "food", price: 80, starve: 1440, clean: 0, charm: 0, intel: 0, strong: 0, desc: "", rectype: "hot", iconPath: "assets/1.2.4source/img_res/food/102010011.gif" },
  { id: "102010012", name: "桃桃布丁", category: "food", price: 10, starve: 180, clean: 0, charm: 0, intel: 0, strong: 0, desc: "", rectype: "new", iconPath: "assets/1.2.4source/img_res/food/102010012.gif" },
  { id: "102010013", name: "怪怪巧克力", category: "food", price: 50, starve: 900, clean: 0, charm: 0, intel: 0, strong: 0, desc: "", rectype: "new", iconPath: "assets/1.2.4source/img_res/food/102010013.gif" },
  { id: "102010014", name: "西湖龙井", category: "food", price: 20, starve: 360, clean: 0, charm: 0, intel: 0, strong: 0, desc: "", rectype: "new", iconPath: "assets/1.2.4source/img_res/food/102010014.gif" },
  { id: "102010015", name: "下岛咖啡", category: "food", price: 40, starve: 720, clean: 0, charm: 0, intel: 0, strong: 0, desc: "", rectype: "new", iconPath: "assets/1.2.4source/img_res/food/102010015.gif" },
  { id: "102010016", name: "滴答果果", category: "food", price: 20, starve: 360, clean: 0, charm: 0, intel: 0, strong: 0, desc: "", rectype: "new", iconPath: "assets/1.2.4source/img_res/food/102010016.gif" },
  { id: "102010020", name: "冰红茶", category: "food", price: 20, starve: 360, clean: 0, charm: 0, intel: 0, strong: 0, desc: "", rectype: "new", iconPath: "assets/1.2.4source/img_res/food/102010020.gif" },
  { id: "102010021", name: "康师傅红茶", category: "food", price: 40, starve: 720, clean: 0, charm: 0, intel: 0, strong: 0, desc: "", rectype: "new", iconPath: "assets/1.2.4source/img_res/food/102010021.gif" },
  { id: "102010022", name: "康师傅绿茶", category: "food", price: 40, starve: 720, clean: 0, charm: 0, intel: 0, strong: 0, desc: "", rectype: "new", iconPath: "assets/1.2.4source/img_res/food/102010022.gif" },
  { id: "102010023", name: "金钢竹筒饭", category: "food", price: 100, starve: 1800, clean: 0, charm: 0, intel: 0, strong: 0, desc: "", rectype: "recommand", iconPath: "assets/1.2.4source/img_res/food/102010023.gif" },
  { id: "102010024", name: "霹雳啪啦糖", category: "food", price: 50, starve: 900, clean: 0, charm: 0, intel: 0, strong: 0, desc: "", rectype: "new", iconPath: "assets/1.2.4source/img_res/food/102010024.gif" },
  { id: "102010025", name: "温泉溜溜蛋", category: "food", price: 60, starve: 1080, clean: 0, charm: 0, intel: 0, strong: 0, desc: "", rectype: "new", iconPath: "assets/1.2.4source/img_res/food/102010025.gif" },
  { id: "102010026", name: "五彩沙拉", category: "food", price: 40, starve: 720, clean: 0, charm: 0, intel: 0, strong: 0, desc: "", rectype: "new", iconPath: "assets/1.2.4source/img_res/food/102010026.gif" },
  { id: "102010027", name: "蛋黄甩甩饼", category: "food", price: 50, starve: 900, clean: 0, charm: 0, intel: 0, strong: 0, desc: "", rectype: "new", iconPath: "assets/1.2.4source/img_res/food/102010027.gif" },
  { id: "102010028", name: "金玉良缘", category: "food", price: 60, starve: 1080, clean: 0, charm: 0, intel: 0, strong: 0, desc: "", rectype: "new", iconPath: "assets/1.2.4source/img_res/food/102010028.gif" },
  { id: "102010029", name: "黑白棋子豆", category: "food", price: 60, starve: 1080, clean: 0, charm: 0, intel: 0, strong: 0, desc: "", rectype: "new", iconPath: "assets/1.2.4source/img_res/food/102010029.gif" },
  { id: "102010030", name: "魔力香草草", category: "food", price: 60, starve: 1080, clean: 0, charm: 0, intel: 0, strong: 0, desc: "", rectype: "new", iconPath: "assets/1.2.4source/img_res/food/102010030.gif" },
  { id: "102010031", name: "人参火果汁", category: "food", price: 50, starve: 900, clean: 0, charm: 0, intel: 0, strong: 0, desc: "", rectype: "new", iconPath: "assets/1.2.4source/img_res/food/102010031.gif" },
  { id: "102010032", name: "灵芝仙人掌", category: "food", price: 50, starve: 900, clean: 0, charm: 0, intel: 0, strong: 0, desc: "", rectype: "new", iconPath: "assets/1.2.4source/img_res/food/102010032.gif" },
  { id: "102010033", name: "彩虹鱼脆脆", category: "food", price: 80, starve: 1440, clean: 0, charm: 0, intel: 0, strong: 0, desc: "", rectype: "new", iconPath: "assets/1.2.4source/img_res/food/102010033.gif" },
  { id: "102010034", name: "咯咯蛋蛋面", category: "food", price: 80, starve: 1440, clean: 0, charm: 0, intel: 0, strong: 0, desc: "", rectype: "new", iconPath: "assets/1.2.4source/img_res/food/102010034.gif" },
  { id: "102010085", name: "徐福记话梅糖", category: "food", price: 30, starve: 540, clean: 0, charm: 0, intel: 0, strong: 0, desc: "", rectype: "new", iconPath: "assets/1.2.4source/img_res/food/102010085.gif" },
  { id: "102010086", name: "德克士盖饭", category: "food", price: 65, starve: 1170, clean: 0, charm: 0, intel: 0, strong: 0, desc: "", rectype: "new", iconPath: "assets/1.2.4source/img_res/food/102010086.gif" },
  { id: "102010087", name: "德克士袋饭", category: "food", price: 100, starve: 1800, clean: 0, charm: 0, intel: 0, strong: 0, desc: "", rectype: "hot", iconPath: "assets/1.2.4source/img_res/food/102010087.gif" },
  { id: "102010088", name: "南山奶粉", category: "food", price: 40, starve: 720, clean: 0, charm: 0, intel: 0, strong: 0, desc: "", rectype: "new", iconPath: "assets/1.2.4source/img_res/food/102010088.gif" },
  { id: "102010089", name: "运动菓珍", category: "food", price: 40, starve: 720, clean: 0, charm: 0, intel: 0, strong: 0, desc: "", rectype: "new", iconPath: "assets/1.2.4source/img_res/food/102010089.gif" },
  { id: "102010090", name: "菓珍甜橙味", category: "food", price: 30, starve: 540, clean: 0, charm: 0, intel: 0, strong: 0, desc: "", rectype: "new", iconPath: "assets/1.2.4source/img_res/food/102010090.gif" },
  { id: "102010092", name: "酷睿能量包", category: "food", price: 50, starve: 900, clean: 0, charm: 0, intel: 0, strong: 0, desc: "", rectype: "new", iconPath: "assets/1.2.4source/img_res/food/102010092.gif" },
  { id: "102010095", name: "呦呦柚子茶", category: "food", price: 40, starve: 720, clean: 0, charm: 0, intel: 0, strong: 0, desc: "", rectype: "new", iconPath: "assets/1.2.4source/img_res/food/102010095.gif" },
  { id: "103010088", name: "蒙牛酸酸乳", category: "food", price: 50, starve: 900, clean: 0, charm: 0, intel: 0, strong: 0, desc: "", rectype: "new", iconPath: "assets/1.2.4source/img_res/food/103010088.gif" },
]

// ============ 商品/清洁用品数据 ============

export const COMMODITY_ITEMS: ShopItem[] = [
  { id: "102020001", name: "震动减肥仪", category: "commodity", price: 20, starve: 0, clean: 720, charm: 0, intel: 0, strong: 0, desc: "", rectype: "hot", iconPath: "assets/1.2.4source/img_res/commodity/102020001.gif" },
  { id: "102020002", name: "强力电吹风", category: "commodity", price: 30, starve: 0, clean: 1080, charm: 0, intel: 0, strong: 0, desc: "", rectype: "recommand", iconPath: "assets/1.2.4source/img_res/commodity/102020002.gif" },
  { id: "102020003", name: "舒爽喷湿器", category: "commodity", price: 10, starve: 0, clean: 360, charm: 0, intel: 0, strong: 0, desc: "", rectype: "new", iconPath: "assets/1.2.4source/img_res/commodity/102020003.gif" },
  { id: "102020005", name: "舒儿按摩器", category: "commodity", price: 20, starve: 0, clean: 720, charm: 0, intel: 0, strong: 0, desc: "", rectype: "new", iconPath: "assets/1.2.4source/img_res/commodity/102020005.gif" },
  { id: "102020006", name: "茶爽牙膏", category: "commodity", price: 20, starve: 0, clean: 720, charm: 0, intel: 0, strong: 0, desc: "", rectype: "new", iconPath: "assets/1.2.4source/img_res/commodity/102020006.gif" },
  { id: "102020007", name: "绒绒毛巾", category: "commodity", price: 25, starve: 0, clean: 900, charm: 0, intel: 0, strong: 0, desc: "", rectype: "hot", iconPath: "assets/1.2.4source/img_res/commodity/102020007.gif" },
  { id: "102020008", name: "妙味香皂", category: "commodity", price: 30, starve: 0, clean: 1080, charm: 0, intel: 0, strong: 0, desc: "", rectype: "recommand", iconPath: "assets/1.2.4source/img_res/commodity/102020008.gif" },
  { id: "102020009", name: "冰爽沐浴液", category: "commodity", price: 50, starve: 0, clean: 1800, charm: 0, intel: 0, strong: 0, desc: "", rectype: "recommand", iconPath: "assets/1.2.4source/img_res/commodity/102020009.gif" },
  { id: "102020010", name: "柠檬洗面奶", category: "commodity", price: 40, starve: 0, clean: 1440, charm: 0, intel: 0, strong: 0, desc: "", rectype: "new", iconPath: "assets/1.2.4source/img_res/commodity/102020010.gif" },
  { id: "102020011", name: "宝宝爽身粉", category: "commodity", price: 30, starve: 0, clean: 1080, charm: 0, intel: 0, strong: 0, desc: "", rectype: "new", iconPath: "assets/1.2.4source/img_res/commodity/102020011.gif" },
  { id: "102020012", name: "宝宝金水", category: "commodity", price: 15, starve: 0, clean: 540, charm: 0, intel: 0, strong: 0, desc: "", rectype: "new", iconPath: "assets/1.2.4source/img_res/commodity/102020012.gif" },
  { id: "102020013", name: "含香凝露", category: "commodity", price: 20, starve: 0, clean: 720, charm: 0, intel: 0, strong: 0, desc: "", rectype: "new", iconPath: "assets/1.2.4source/img_res/commodity/102020013.gif" },
  { id: "102020014", name: "啤酒香波", category: "commodity", price: 65, starve: 0, clean: 2340, charm: 0, intel: 0, strong: 0, desc: "", rectype: "new", iconPath: "assets/1.2.4source/img_res/commodity/102020014.gif" },
  { id: "102020015", name: "飘飘护发素", category: "commodity", price: 30, starve: 0, clean: 1080, charm: 0, intel: 0, strong: 0, desc: "", rectype: "new", iconPath: "assets/1.2.4source/img_res/commodity/102020015.gif" },
  { id: "102020016", name: "保湿啧喱", category: "commodity", price: 75, starve: 0, clean: 2700, charm: 0, intel: 0, strong: 0, desc: "", rectype: "new", iconPath: "assets/1.2.4source/img_res/commodity/102020016.gif" },
  { id: "102020017", name: "自动喷湿器", category: "commodity", price: 25, starve: 0, clean: 900, charm: 0, intel: 0, strong: 0, desc: "", rectype: "hot", iconPath: "assets/1.2.4source/img_res/commodity/102020017.gif" },
  { id: "102020019", name: "QQ魔镜", category: "commodity", price: 25, starve: 0, clean: 900, charm: 0, intel: 0, strong: 0, desc: "", rectype: "new", iconPath: "assets/1.2.4source/img_res/commodity/102020019.gif" },
  { id: "102020020", name: "魔幻矿泉泥", category: "commodity", price: 50, starve: 0, clean: 1800, charm: 0, intel: 0, strong: 0, desc: "", rectype: "recommand", iconPath: "assets/1.2.4source/img_res/commodity/102020020.gif" },
  { id: "102020021", name: "迷魂防蚊水", category: "commodity", price: 25, starve: 0, clean: 900, charm: 0, intel: 0, strong: 0, desc: "", rectype: "new", iconPath: "assets/1.2.4source/img_res/commodity/102020021.gif" },
  { id: "102020022", name: "保健生发梳", category: "commodity", price: 75, starve: 0, clean: 2700, charm: 0, intel: 0, strong: 0, desc: "", rectype: "new", iconPath: "assets/1.2.4source/img_res/commodity/102020022.gif" },
  { id: "102020023", name: "情人香果", category: "commodity", price: 30, starve: 0, clean: 1080, charm: 0, intel: 0, strong: 0, desc: "", rectype: "hot", iconPath: "assets/1.2.4source/img_res/commodity/102020023.gif" },
  { id: "102020024", name: "玫瑰香薰", category: "commodity", price: 40, starve: 0, clean: 1440, charm: 0, intel: 0, strong: 0, desc: "", rectype: "hot", iconPath: "assets/1.2.4source/img_res/commodity/102020024.gif" },
]

// ============ 药品数据 ============

export const MEDICINE_ITEMS: ShopItem[] = [
  { id: "10001", name: "板蓝根", category: "medicine", price: 50, starve: 0, clean: 0, charm: 0, intel: 0, strong: 0, desc: "用于治疗感冒", rectype: "", iconPath: "assets/1.2.4source/img_res/medicine/10001.gif" },
  { id: "10002", name: "消食片", category: "medicine", price: 50, starve: 0, clean: 0, charm: 0, intel: 0, strong: 0, desc: "用于治疗消化不良", rectype: "", iconPath: "assets/1.2.4source/img_res/medicine/10002.gif" },
  { id: "10003", name: "枇杷糖浆", category: "medicine", price: 50, starve: 0, clean: 0, charm: 0, intel: 0, strong: 0, desc: "用于治疗咳嗽", rectype: "", iconPath: "assets/1.2.4source/img_res/medicine/10003.gif" },
  { id: "10004", name: "清凉油", category: "medicine", price: 50, starve: 0, clean: 0, charm: 0, intel: 0, strong: 0, desc: "用于治疗头晕", rectype: "", iconPath: "assets/1.2.4source/img_res/medicine/10004.gif" },
  { id: "10005", name: "润肤露", category: "medicine", price: 50, starve: 0, clean: 0, charm: 0, intel: 0, strong: 0, desc: "用于治疗皮肤瘙痒", rectype: "", iconPath: "assets/1.2.4source/img_res/medicine/10005.gif" },
  { id: "20001", name: "银翘丸", category: "medicine", price: 80, starve: 0, clean: 0, charm: 0, intel: 0, strong: 0, desc: "用于治疗重感冒", rectype: "", iconPath: "assets/1.2.4source/img_res/medicine/20001.gif" },
  { id: "20002", name: "蓝色消炎水", category: "medicine", price: 80, starve: 0, clean: 0, charm: 0, intel: 0, strong: 0, desc: "用于治疗胃炎", rectype: "", iconPath: "assets/1.2.4source/img_res/medicine/20002.gif" },
  { id: "20003", name: "甘草剂", category: "medicine", price: 80, starve: 0, clean: 0, charm: 0, intel: 0, strong: 0, desc: "用于治疗上呼吸道感染", rectype: "", iconPath: "assets/1.2.4source/img_res/medicine/20003.gif" },
  { id: "20004", name: "止痛片", category: "medicine", price: 80, starve: 0, clean: 0, charm: 0, intel: 0, strong: 0, desc: "用于治疗偏头痛", rectype: "", iconPath: "assets/1.2.4source/img_res/medicine/20004.gif" },
  { id: "20005", name: "薄荷油", category: "medicine", price: 80, starve: 0, clean: 0, charm: 0, intel: 0, strong: 0, desc: "用于治疗皮肤干裂", rectype: "", iconPath: "assets/1.2.4source/img_res/medicine/20005.gif" },
  { id: "30001", name: "金色消炎水", category: "medicine", price: 120, starve: 0, clean: 0, charm: 0, intel: 0, strong: 0, desc: "用于治疗肺炎", rectype: "", iconPath: "assets/1.2.4source/img_res/medicine/30001.gif" },
  { id: "30002", name: "龙胆草", category: "medicine", price: 120, starve: 0, clean: 0, charm: 0, intel: 0, strong: 0, desc: "用于治疗胃溃疡", rectype: "", iconPath: "assets/1.2.4source/img_res/medicine/30002.gif" },
  { id: "30003", name: "定喘丸", category: "medicine", price: 120, starve: 0, clean: 0, charm: 0, intel: 0, strong: 0, desc: "用于治疗哮喘", rectype: "", iconPath: "assets/1.2.4source/img_res/medicine/30003.gif" },
  { id: "30004", name: "退烧药", category: "medicine", price: 120, starve: 0, clean: 0, charm: 0, intel: 0, strong: 0, desc: "用于治疗发高烧", rectype: "", iconPath: "assets/1.2.4source/img_res/medicine/30004.gif" },
  { id: "30005", name: "生肌膏", category: "medicine", price: 120, starve: 0, clean: 0, charm: 0, intel: 0, strong: 0, desc: "用于治疗皮肤溃疡", rectype: "", iconPath: "assets/1.2.4source/img_res/medicine/30005.gif" },
  { id: "40001", name: "噗噗神水", category: "medicine", price: 200, starve: 0, clean: 0, charm: 0, intel: 0, strong: 0, desc: "用于治疗肺结核", rectype: "", iconPath: "assets/1.2.4source/img_res/medicine/40001.gif" },
  { id: "40002", name: "仙人汤", category: "medicine", price: 200, starve: 0, clean: 0, charm: 0, intel: 0, strong: 0, desc: "用于治疗胃癌", rectype: "", iconPath: "assets/1.2.4source/img_res/medicine/40002.gif" },
  { id: "40003", name: "通风散", category: "medicine", price: 200, starve: 0, clean: 0, charm: 0, intel: 0, strong: 0, desc: "用于治疗支气管炎", rectype: "", iconPath: "assets/1.2.4source/img_res/medicine/40003.gif" },
  { id: "40004", name: "何首乌", category: "medicine", price: 200, starve: 0, clean: 0, charm: 0, intel: 0, strong: 0, desc: "用于治疗心力衰竭", rectype: "", iconPath: "assets/1.2.4source/img_res/medicine/40004.gif" },
  { id: "40005", name: "茶树油", category: "medicine", price: 200, starve: 0, clean: 0, charm: 0, intel: 0, strong: 0, desc: "用于治疗皮肤溃疡感染", rectype: "", iconPath: "assets/1.2.4source/img_res/medicine/40005.gif" },
  { id: "50001", name: "百草丹", category: "medicine", price: 240, starve: 0, clean: 0, charm: 0, intel: 0, strong: 0, desc: "包治百病，一粒见效", rectype: "", iconPath: "assets/1.2.4source/img_res/medicine/50001.gif" },
  { id: "60001", name: "还魂丹", category: "medicine", price: 400, starve: 500, clean: 500, charm: 0, intel: 0, strong: 100, desc: "用于复活宠物，也可治百病,吃一颗长生不老！", rectype: "hot", iconPath: "assets/1.2.4source/img_res/medicine/60001.gif" },
]

// ============ 背景数据 ============

export const BACKGROUND_ITEMS: ShopItem[] = [
  { id: "b0000000", name: "无背景", category: "background", price: -1, starve: 0, clean: 0, charm: 0, intel: 0, strong: 0, desc: "无背景，装备可以卸下正在使用的背景。", rectype: "", iconPath: "assets/1.2.4source/Background/b0000000.png" },
  { id: "b0000001", name: "背景1", category: "background", price: -1, starve: 0, clean: 0, charm: 0, intel: 0, strong: 0, desc: "", rectype: "", iconPath: "assets/1.2.4source/Background/b0000001.png" },
  { id: "b0000002", name: "背景2", category: "background", price: -1, starve: 0, clean: 0, charm: 0, intel: 0, strong: 0, desc: "", rectype: "", iconPath: "assets/1.2.4source/Background/b0000002.png" },
  { id: "b0000003", name: "背景3", category: "background", price: -1, starve: 0, clean: 0, charm: 0, intel: 0, strong: 0, desc: "", rectype: "", iconPath: "assets/1.2.4source/Background/b0000003.png" },
  { id: "b0000004", name: "背景4", category: "background", price: -1, starve: 0, clean: 0, charm: 0, intel: 0, strong: 0, desc: "", rectype: "", iconPath: "assets/1.2.4source/Background/b0000004.png" },
  { id: "b0000005", name: "背景5", category: "background", price: -1, starve: 0, clean: 0, charm: 0, intel: 0, strong: 0, desc: "", rectype: "", iconPath: "assets/1.2.4source/Background/b0000005.png" },
  { id: "b0000006", name: "背景6", category: "background", price: -1, starve: 0, clean: 0, charm: 0, intel: 0, strong: 0, desc: "", rectype: "", iconPath: "assets/1.2.4source/Background/b0000006.png" },
  { id: "b0000007", name: "背景7", category: "background", price: -1, starve: 0, clean: 0, charm: 0, intel: 0, strong: 0, desc: "", rectype: "", iconPath: "assets/1.2.4source/Background/b0000007.png" },
  { id: "b0000008", name: "背景8", category: "background", price: -1, starve: 0, clean: 0, charm: 0, intel: 0, strong: 0, desc: "", rectype: "", iconPath: "assets/1.2.4source/Background/b0000008.png" },
  { id: "b0000009", name: "背景9", category: "background", price: -1, starve: 0, clean: 0, charm: 0, intel: 0, strong: 0, desc: "", rectype: "", iconPath: "assets/1.2.4source/Background/b0000009.png" },
  { id: "b0000010", name: "背景10", category: "background", price: -1, starve: 0, clean: 0, charm: 0, intel: 0, strong: 0, desc: "", rectype: "", iconPath: "assets/1.2.4source/Background/b0000010.png" },
  { id: "b0000011", name: "背景11", category: "background", price: -1, starve: 0, clean: 0, charm: 0, intel: 0, strong: 0, desc: "", rectype: "", iconPath: "assets/1.2.4source/Background/b0000011.png" },
  { id: "b0000012", name: "背景12", category: "background", price: -1, starve: 0, clean: 0, charm: 0, intel: 0, strong: 0, desc: "", rectype: "", iconPath: "assets/1.2.4source/Background/b0000012.png" },
  { id: "b0000013", name: "背景13", category: "background", price: -1, starve: 0, clean: 0, charm: 0, intel: 0, strong: 0, desc: "", rectype: "", iconPath: "assets/1.2.4source/Background/b0000013.png" },
  { id: "b0000014", name: "背景14", category: "background", price: -1, starve: 0, clean: 0, charm: 0, intel: 0, strong: 0, desc: "", rectype: "", iconPath: "assets/1.2.4source/Background/b0000014.png" },
  { id: "b0000015", name: "背景15", category: "background", price: -1, starve: 0, clean: 0, charm: 0, intel: 0, strong: 0, desc: "", rectype: "", iconPath: "assets/1.2.4source/Background/b0000015.png" },
  { id: "b0000016", name: "背景16", category: "background", price: -1, starve: 0, clean: 0, charm: 0, intel: 0, strong: 0, desc: "", rectype: "", iconPath: "assets/1.2.4source/Background/b0000016.png" },
]

// ============ 学习数据 ============

export const STUDY_ENTRIES: StudyEntry[] = [
  { key: "_xx-chinese", subject: "chinese" as StudySubject, subjectName: "语文", school: "小学" as SchoolLevel, tolkName: "小学语文", classTime: 45, classNum: 9, classNumUp: 0, intel: 15, charm: 5, strong: 0, starve: 90, clean: 0 },
  { key: "_xx-mathematics", subject: "mathematics" as StudySubject, subjectName: "数学", school: "小学" as SchoolLevel, tolkName: "小学数学", classTime: 45, classNum: 9, classNumUp: 0, intel: 20, charm: 0, strong: 0, starve: 135, clean: 0 },
  { key: "_xx-politics", subject: "politics" as StudySubject, subjectName: "政治", school: "小学" as SchoolLevel, tolkName: "小学政治", classTime: 45, classNum: 9, classNumUp: 0, intel: 25, charm: 0, strong: 0, starve: 180, clean: 0 },
  { key: "_xx-music", subject: "music" as StudySubject, subjectName: "音乐", school: "小学" as SchoolLevel, tolkName: "小学音乐", classTime: 45, classNum: 9, classNumUp: 0, intel: 0, charm: 15, strong: 0, starve: 45, clean: 0 },
  { key: "_xx-art", subject: "art" as StudySubject, subjectName: "艺术", school: "小学" as SchoolLevel, tolkName: "小学艺术", classTime: 45, classNum: 9, classNumUp: 0, intel: 20, charm: 20, strong: 0, starve: 135, clean: 90 },
  { key: "_xx-manner", subject: "manner" as StudySubject, subjectName: "礼仪", school: "小学" as SchoolLevel, tolkName: "小学礼仪", classTime: 45, classNum: 9, classNumUp: 0, intel: 0, charm: 20, strong: 0, starve: 90, clean: 45 },
  { key: "_xx-pe", subject: "pe" as StudySubject, subjectName: "体育", school: "小学" as SchoolLevel, tolkName: "小学体育", classTime: 45, classNum: 9, classNumUp: 0, intel: 0, charm: 0, strong: 15, starve: 90, clean: 90 },
  { key: "_xx-labouring", subject: "labouring" as StudySubject, subjectName: "劳技", school: "小学" as SchoolLevel, tolkName: "小学劳技", classTime: 45, classNum: 9, classNumUp: 0, intel: 0, charm: 0, strong: 10, starve: 90, clean: 45 },
  { key: "_xx-wushu", subject: "wushu" as StudySubject, subjectName: "武术", school: "小学" as SchoolLevel, tolkName: "小学武术", classTime: 45, classNum: 9, classNumUp: 0, intel: 0, charm: 0, strong: 25, starve: 180, clean: 180 },
  { key: "_zx-chinese", subject: "chinese" as StudySubject, subjectName: "语文", school: "中学" as SchoolLevel, tolkName: "中学语文", classTime: 45, classNum: 20, classNumUp: 9, intel: 25, charm: 15, strong: 0, starve: 90, clean: 0 },
  { key: "_zx-mathematics", subject: "mathematics" as StudySubject, subjectName: "数学", school: "中学" as SchoolLevel, tolkName: "中学数学", classTime: 45, classNum: 20, classNumUp: 9, intel: 30, charm: 10, strong: 0, starve: 135, clean: 0 },
  { key: "_zx-politics", subject: "politics" as StudySubject, subjectName: "政治", school: "中学" as SchoolLevel, tolkName: "中学政治", classTime: 45, classNum: 20, classNumUp: 9, intel: 35, charm: 0, strong: 0, starve: 180, clean: 0 },
  { key: "_zx-music", subject: "music" as StudySubject, subjectName: "音乐", school: "中学" as SchoolLevel, tolkName: "中学音乐", classTime: 45, classNum: 20, classNumUp: 9, intel: 0, charm: 25, strong: 0, starve: 45, clean: 0 },
  { key: "_zx-art", subject: "art" as StudySubject, subjectName: "艺术", school: "中学" as SchoolLevel, tolkName: "中学艺术", classTime: 45, classNum: 20, classNumUp: 9, intel: 30, charm: 30, strong: 0, starve: 135, clean: 90 },
  { key: "_zx-manner", subject: "manner" as StudySubject, subjectName: "礼仪", school: "中学" as SchoolLevel, tolkName: "中学礼仪", classTime: 45, classNum: 20, classNumUp: 9, intel: 0, charm: 30, strong: 0, starve: 90, clean: 45 },
  { key: "_zx-pe", subject: "pe" as StudySubject, subjectName: "体育", school: "中学" as SchoolLevel, tolkName: "中学体育", classTime: 45, classNum: 20, classNumUp: 9, intel: 0, charm: 5, strong: 25, starve: 90, clean: 90 },
  { key: "_zx-labouring", subject: "labouring" as StudySubject, subjectName: "劳技", school: "中学" as SchoolLevel, tolkName: "中学劳技", classTime: 45, classNum: 20, classNumUp: 9, intel: 0, charm: 0, strong: 20, starve: 90, clean: 45 },
  { key: "_zx-wushu", subject: "wushu" as StudySubject, subjectName: "武术", school: "中学" as SchoolLevel, tolkName: "中学武术", classTime: 45, classNum: 20, classNumUp: 9, intel: 0, charm: 0, strong: 35, starve: 180, clean: 180 },
  { key: "_dx-chinese", subject: "chinese" as StudySubject, subjectName: "语文", school: "大学" as SchoolLevel, tolkName: "大学语文", classTime: 55, classNum: 40, classNumUp: 29, intel: 45, charm: 35, strong: 0, starve: 110, clean: 0 },
  { key: "_dx-mathematics", subject: "mathematics" as StudySubject, subjectName: "数学", school: "大学" as SchoolLevel, tolkName: "大学数学", classTime: 55, classNum: 40, classNumUp: 29, intel: 50, charm: 30, strong: 0, starve: 165, clean: 0 },
  { key: "_dx-politics", subject: "politics" as StudySubject, subjectName: "政治", school: "大学" as SchoolLevel, tolkName: "大学政治", classTime: 55, classNum: 40, classNumUp: 29, intel: 55, charm: 0, strong: 0, starve: 220, clean: 0 },
  { key: "_dx-music", subject: "music" as StudySubject, subjectName: "音乐", school: "大学" as SchoolLevel, tolkName: "大学音乐", classTime: 55, classNum: 40, classNumUp: 29, intel: 0, charm: 45, strong: 0, starve: 55, clean: 0 },
  { key: "_dx-art", subject: "art" as StudySubject, subjectName: "艺术", school: "大学" as SchoolLevel, tolkName: "大学艺术", classTime: 55, classNum: 40, classNumUp: 29, intel: 50, charm: 50, strong: 0, starve: 165, clean: 110 },
  { key: "_dx-manner", subject: "manner" as StudySubject, subjectName: "礼仪", school: "大学" as SchoolLevel, tolkName: "大学礼仪", classTime: 55, classNum: 40, classNumUp: 29, intel: 0, charm: 50, strong: 0, starve: 110, clean: 55 },
  { key: "_dx-pe", subject: "pe" as StudySubject, subjectName: "体育", school: "大学" as SchoolLevel, tolkName: "大学体育", classTime: 55, classNum: 40, classNumUp: 29, intel: 0, charm: 25, strong: 45, starve: 110, clean: 110 },
  { key: "_dx-labouring", subject: "labouring" as StudySubject, subjectName: "劳技", school: "大学" as SchoolLevel, tolkName: "大学劳技", classTime: 55, classNum: 40, classNumUp: 29, intel: 0, charm: 20, strong: 40, starve: 110, clean: 55 },
  { key: "_dx-wushu", subject: "wushu" as StudySubject, subjectName: "武术", school: "大学" as SchoolLevel, tolkName: "大学武术", classTime: 55, classNum: 40, classNumUp: 29, intel: 0, charm: 0, strong: 55, starve: 220, clean: 220 },
  { key: "_yjs-chinese", subject: "chinese" as StudySubject, subjectName: "语文", school: "研究生" as SchoolLevel, tolkName: "研究生语文", classTime: 55, classNum: 95, classNumUp: 69, intel: 85, charm: 75, strong: 0, starve: 110, clean: 0 },
  { key: "_yjs-mathematics", subject: "mathematics" as StudySubject, subjectName: "数学", school: "研究生" as SchoolLevel, tolkName: "研究生数学", classTime: 55, classNum: 95, classNumUp: 69, intel: 90, charm: 70, strong: 0, starve: 165, clean: 0 },
  { key: "_yjs-politics", subject: "politics" as StudySubject, subjectName: "政治", school: "研究生" as SchoolLevel, tolkName: "研究生政治", classTime: 55, classNum: 95, classNumUp: 69, intel: 95, charm: 0, strong: 0, starve: 220, clean: 0 },
  { key: "_yjs-music", subject: "music" as StudySubject, subjectName: "音乐", school: "研究生" as SchoolLevel, tolkName: "研究生音乐", classTime: 55, classNum: 95, classNumUp: 69, intel: 0, charm: 85, strong: 0, starve: 55, clean: 0 },
  { key: "_yjs-art", subject: "art" as StudySubject, subjectName: "艺术", school: "研究生" as SchoolLevel, tolkName: "研究生艺术", classTime: 55, classNum: 95, classNumUp: 69, intel: 90, charm: 90, strong: 0, starve: 165, clean: 110 },
  { key: "_yjs-manner", subject: "manner" as StudySubject, subjectName: "礼仪", school: "研究生" as SchoolLevel, tolkName: "研究生礼仪", classTime: 55, classNum: 95, classNumUp: 69, intel: 0, charm: 90, strong: 0, starve: 110, clean: 55 },
  { key: "_yjs-pe", subject: "pe" as StudySubject, subjectName: "体育", school: "研究生" as SchoolLevel, tolkName: "研究生体育", classTime: 55, classNum: 95, classNumUp: 69, intel: 0, charm: 65, strong: 85, starve: 110, clean: 110 },
  { key: "_yjs-labouring", subject: "labouring" as StudySubject, subjectName: "劳技", school: "研究生" as SchoolLevel, tolkName: "研究生劳技", classTime: 55, classNum: 95, classNumUp: 69, intel: 0, charm: 60, strong: 80, starve: 110, clean: 55 },
  { key: "_yjs-wushu", subject: "wushu" as StudySubject, subjectName: "武术", school: "研究生" as SchoolLevel, tolkName: "研究生武术", classTime: 55, classNum: 95, classNumUp: 69, intel: 0, charm: 0, strong: 95, starve: 220, clean: 220 },
]

// ============ 打工数据 ============

export const WORK_ENTRIES: WorkEntry[] = [
  { id: "bz", name: "搬砖", tolkName: "搬砖", desc: "搬砖赚钱了~~", need: 0, yb: 10, useTime: 30, charm: 0, intel: 0, strong: 1, starve: 300, clean: 200, mood: 90, education: {} },
  { id: "nwg", name: "泥瓦工", tolkName: "做泥瓦工", desc: "嘿咻嘿咻~~", need: 3, yb: 10, useTime: 30, charm: 0, intel: 1, strong: 1, starve: 200, clean: 300, mood: 80, education: {"labouring":9} },
  { id: "hj", name: "花匠", tolkName: "做花匠", desc: "花儿真美丽~~", need: 6, yb: 13, useTime: 30, charm: 10, intel: 0, strong: 0, starve: 300, clean: 100, mood: 80, education: {"manner":9} },
  { id: "yd", name: "园丁", tolkName: "做园丁", desc: "我要做一个城堡！~~", need: 9, yb: 14, useTime: 30, charm: 0, intel: 10, strong: 0, starve: 400, clean: 300, mood: 80, education: {"chinese":9,"art":9} },
  { id: "mj", name: "木匠", tolkName: "做木匠", desc: "鲁班大师是我的偶像！~~", need: 6, yb: 13, useTime: 30, charm: 0, intel: 10, strong: 0, starve: 400, clean: 300, mood: 80, education: {"labouring":9} },
  { id: "jzs", name: "建筑师", tolkName: "做建筑师", desc: "看到没，外滩就是我监工的！~~", need: 24, yb: 20, useTime: 30, charm: 0, intel: 10, strong: 0, starve: 400, clean: 300, mood: 80, education: {"art":40,"mathematics":40} },
  { id: "ba", name: "保安", tolkName: "做保安", desc: "我的小区我做主！~~", need: 9, yb: 14, useTime: 30, charm: 0, intel: 0, strong: 10, starve: 300, clean: 300, mood: 80, education: {"politics":9,"wushu":9} },
  { id: "yy", name: "演员", tolkName: "做演员", desc: "欢迎来到我的舞台！~~", need: 9, yb: 14, useTime: 30, charm: 20, intel: 0, strong: 0, starve: 500, clean: 100, mood: 80, education: {"manner":9,"labouring":9} },
  { id: "jl", name: "教练", tolkName: "做教练", desc: "学妹最喜欢的就是我了，我该挑哪个呢！~~", need: 12, yb: 16, useTime: 30, charm: 40, intel: 50, strong: 0, starve: 500, clean: 500, mood: 20, education: {"pe":40} },
  { id: "ls", name: "律师", tolkName: "做律师", desc: "我是一个正义的律师！~~", need: 12, yb: 16, useTime: 30, charm: 0, intel: 30, strong: 0, starve: 300, clean: 100, mood: 80, education: {"politics":20} },
  { id: "gs", name: "歌手", tolkName: "做歌手", desc: "夜空中最亮的星，就是我！~~", need: 12, yb: 16, useTime: 30, charm: 40, intel: 0, strong: 0, starve: 400, clean: 200, mood: 80, education: {"music":20} },
  { id: "mhj", name: "漫画家", tolkName: "做漫画家", desc: "我是要成为海贼王的男人！~~", need: 15, yb: 80, useTime: 30, charm: 0, intel: 40, strong: 0, starve: 100, clean: 100, mood: 20, education: {"art":20,"labouring":20} },
  { id: "jc", name: "警察", tolkName: "做警察", desc: "我是人民警察，为人民！~~", need: 15, yb: 17, useTime: 30, charm: 50, intel: 50, strong: 50, starve: 500, clean: 500, mood: 20, education: {"politics":20,"wushu":20} },
  { id: "cqz", name: "词曲者", tolkName: "做词曲者", desc: "天青色等烟雨，而我在等你！~~", need: 15, yb: 17, useTime: 30, charm: 50, intel: 20, strong: 0, starve: 100, clean: 100, mood: 20, education: {"chinese":20,"music":20} },
  { id: "bj", name: "编辑", tolkName: "做编辑", desc: "好事是好事，坏事也是好事！~~", need: 18, yb: 18, useTime: 30, charm: 10, intel: 50, strong: 0, starve: 300, clean: 100, mood: 20, education: {"chinese":40} },
  { id: "sys", name: "摄影师", tolkName: "做摄影师", desc: "来，看这里，你笑得太假了！~~", need: 18, yb: 18, useTime: 30, charm: 100, intel: 100, strong: 100, starve: 500, clean: 500, mood: 20, education: {"art":40} },
  { id: "zdx", name: "科研人员", tolkName: "做科研人员", desc: "助理，过来下，这个药剂这样配！~~", need: 19, yb: 1024, useTime: 80, charm: 200, intel: 200, strong: 200, starve: 500, clean: 500, mood: 20, education: {"chinese":40,"mathematics":40,"art":40,"pe":40} },
  { id: "spg", name: "公务员", tolkName: "做公务员", desc: "一切为了党！为了人民！~~", need: 19, yb: 2048, useTime: 120, charm: 2048, intel: 2048, strong: 2048, starve: 300, clean: 300, mood: 20, education: {"chinese":40,"mathematics":40,"politics":40,"music":40,"art":40,"manner":40,"pe":40,"labouring":40,"wushu":40} },
]

// ============ 查找工具 ============

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
