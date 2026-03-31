/**
 * SWF 动画分类数据
 * 供 App.tsx 动画下拉菜单和 SwfGallery 共用
 *
 * 三种形态：蛋(Egg) → 小孩(Kid) → 成年(Adult)
 */

// ============================================================
// 路径常量
// ============================================================
const BASE_EGG = '/assets/1.2.4source/Action/GG/Egg/'
const BASE_KID = '/assets/1.2.4source/Action/GG/Kid/'
const BASE_ADULT = '/assets/1.2.4source/Action/GG/Adult/'

// ============================================================
// 新版素材库 - 按三种形态分类
// ============================================================
export const swfCategories = [
  // ==================== 🥚 蛋形态 ====================
  {
    key: 'egg-basic',
    name: '🥚 蛋-基础',
    icon: '🥚',
    files: [
      { id: 'egg-stand',   name: '站立',     path: BASE_EGG + 'Stand.swf' },
      { id: 'egg-appear',  name: '出现',     path: BASE_EGG + 'Appear.swf' },
      { id: 'egg-hide',    name: '隐藏',     path: BASE_EGG + 'Hide.swf' },
      { id: 'egg-first',   name: '初始',     path: BASE_EGG + 'First.swf' },
      { id: 'egg-speak1',  name: '说话1',    path: BASE_EGG + 'Speak1.swf' },
      { id: 'egg-speak2',  name: '说话2',    path: BASE_EGG + 'Speak2.swf' },
      { id: 'egg-speak3',  name: '说话3',    path: BASE_EGG + 'Speak3.swf' },
      { id: 'egg-levup',   name: '升级',     path: BASE_EGG + 'LevUp.swf' },
    ],
  },
  {
    key: 'egg-daily',
    name: '🥚 蛋-日常',
    icon: '🍼',
    files: [
      { id: 'egg-eat1',    name: '吃东西1',  path: BASE_EGG + 'Eat1.swf' },
      { id: 'egg-eat2',    name: '吃东西2',  path: BASE_EGG + 'Eat2.swf' },
      { id: 'egg-clean',   name: '清洁',     path: BASE_EGG + 'Clean.swf' },
      { id: 'egg-cure',    name: '治疗',     path: BASE_EGG + 'Cure.swf' },
      { id: 'egg-sick',    name: '生病',     path: BASE_EGG + 'Sick.swf' },
      { id: 'egg-dying',   name: '濒死',     path: BASE_EGG + 'Dying.swf' },
      { id: 'egg-die',     name: '死亡',     path: BASE_EGG + 'Die.swf' },
      { id: 'egg-bury',    name: '埋葬',     path: BASE_EGG + 'Bury.swf' },
      { id: 'egg-revival', name: '复活',     path: BASE_EGG + 'Revival.swf' },
    ],
  },
  {
    key: 'egg-move',
    name: '🥚 蛋-移动',
    icon: '🚶',
    files: [
      { id: 'egg-enter1',  name: '进场1',    path: BASE_EGG + 'Enter1.swf' },
      { id: 'egg-enter2',  name: '进场2',    path: BASE_EGG + 'Enter2.swf' },
      { id: 'egg-exit1',   name: '退场1',    path: BASE_EGG + 'Exit1.swf' },
      { id: 'egg-exit2',   name: '退场2',    path: BASE_EGG + 'Exit2.swf' },
      { id: 'egg-exit3',   name: '退场3',    path: BASE_EGG + 'Exit3.swf' },
      { id: 'egg-hidel1',  name: '左隐藏1',  path: BASE_EGG + 'Hide_left1.swf' },
      { id: 'egg-hidel2',  name: '左隐藏2',  path: BASE_EGG + 'Hide_left2.swf' },
      { id: 'egg-hider1',  name: '右隐藏1',  path: BASE_EGG + 'Hide_right1.swf' },
      { id: 'egg-hider2',  name: '右隐藏2',  path: BASE_EGG + 'Hide_right2.swf' },
    ],
  },
  {
    key: 'egg-play',
    name: '🥚 蛋-玩耍',
    icon: '🎈',
    files: [
      { id: 'egg-p1',  name: '玩耍1',  path: BASE_EGG + 'play/P1.swf' },
      { id: 'egg-p2',  name: '玩耍2',  path: BASE_EGG + 'play/P2.swf' },
      { id: 'egg-p3',  name: '玩耍3',  path: BASE_EGG + 'play/P3.swf' },
      { id: 'egg-p4',  name: '玩耍4',  path: BASE_EGG + 'play/P4.swf' },
      { id: 'egg-p5',  name: '玩耍5',  path: BASE_EGG + 'play/P5.swf' },
      { id: 'egg-p6',  name: '玩耍6',  path: BASE_EGG + 'play/P6.swf' },
      { id: 'egg-p7',  name: '玩耍7',  path: BASE_EGG + 'play/P7.swf' },
      { id: 'egg-p8',  name: '玩耍8',  path: BASE_EGG + 'play/P8.swf' },
      { id: 'egg-p9',  name: '玩耍9',  path: BASE_EGG + 'play/P9.swf' },
      { id: 'egg-p10', name: '玩耍10', path: BASE_EGG + 'play/P10.swf' },
    ],
  },

  // ==================== 🐣 小孩形态 ====================
  {
    key: 'kid-basic',
    name: '🐣 小孩-基础',
    icon: '🐣',
    files: [
      { id: 'kid-stand',   name: '站立',     path: BASE_KID + 'Stand.swf' },
      { id: 'kid-stand1',  name: '站立2',    path: BASE_KID + 'Stand1.swf' },
      { id: 'kid-appear',  name: '出现',     path: BASE_KID + 'Appear.swf' },
      { id: 'kid-hide',    name: '隐藏',     path: BASE_KID + 'Hide.swf' },
      { id: 'kid-first',   name: '初始',     path: BASE_KID + 'First.swf' },
      { id: 'kid-speak',   name: '说话',     path: BASE_KID + 'Speak.swf' },
      { id: 'kid-levup',   name: '升级',     path: BASE_KID + 'LevUp.swf' },
    ],
  },
  {
    key: 'kid-daily',
    name: '🐣 小孩-日常',
    icon: '🍼',
    files: [
      { id: 'kid-eat1',    name: '吃东西',   path: BASE_KID + 'Eat1.swf' },
      { id: 'kid-clean',   name: '清洁',     path: BASE_KID + 'Clean.swf' },
      { id: 'kid-cure',    name: '治疗',     path: BASE_KID + 'Cure.swf' },
      { id: 'kid-dirty',   name: '脏了',     path: BASE_KID + 'Dirty.swf' },
      { id: 'kid-sick',    name: '生病',     path: BASE_KID + 'Sick.swf' },
      { id: 'kid-dying',   name: '濒死',     path: BASE_KID + 'Dying.swf' },
      { id: 'kid-die',     name: '死亡',     path: BASE_KID + 'Die.swf' },
      { id: 'kid-bury',    name: '埋葬',     path: BASE_KID + 'Bury.swf' },
      { id: 'kid-revival', name: '复活',     path: BASE_KID + 'Revival.swf' },
    ],
  },
  {
    key: 'kid-move',
    name: '🐣 小孩-移动',
    icon: '🚶',
    files: [
      { id: 'kid-enter1',  name: '进场1',    path: BASE_KID + 'Enter1.swf' },
      { id: 'kid-enter2',  name: '进场2',    path: BASE_KID + 'Enter2.swf' },
      { id: 'kid-enter3',  name: '进场3',    path: BASE_KID + 'Enter3.swf' },
      { id: 'kid-exit1',   name: '退场1',    path: BASE_KID + 'Exit1.swf' },
      { id: 'kid-exit2',   name: '退场2',    path: BASE_KID + 'Exit2.swf' },
      { id: 'kid-exit3',   name: '退场3',    path: BASE_KID + 'Exit3.swf' },
      { id: 'kid-hidel1',  name: '左隐藏1',  path: BASE_KID + 'Hide_left1.swf' },
      { id: 'kid-hidel2',  name: '左隐藏2',  path: BASE_KID + 'Hide_left2.swf' },
      { id: 'kid-hider1',  name: '右隐藏1',  path: BASE_KID + 'Hide_right1.swf' },
      { id: 'kid-hider2',  name: '右隐藏2',  path: BASE_KID + 'Hide_right2.swf' },
    ],
  },
  {
    key: 'kid-play',
    name: '🐣 小孩-玩耍',
    icon: '🎮',
    files: [
      { id: 'kid-p1',  name: '玩耍1',   path: BASE_KID + 'play/P1.swf' },
      { id: 'kid-p2',  name: '玩耍2',   path: BASE_KID + 'play/P2.swf' },
      { id: 'kid-p3',  name: '玩耍3',   path: BASE_KID + 'play/P3.swf' },
      { id: 'kid-p4',  name: '玩耍4',   path: BASE_KID + 'play/P4.swf' },
      { id: 'kid-p5',  name: '玩耍5',   path: BASE_KID + 'play/P5.swf' },
      { id: 'kid-p6',  name: '玩耍6',   path: BASE_KID + 'play/P6.swf' },
      { id: 'kid-p7',  name: '玩耍7',   path: BASE_KID + 'play/P7.swf' },
      { id: 'kid-p8',  name: '玩耍8',   path: BASE_KID + 'play/P8.swf' },
      { id: 'kid-p9',  name: '玩耍9',   path: BASE_KID + 'play/P9.swf' },
      { id: 'kid-p10', name: '玩耍10',  path: BASE_KID + 'play/P10.swf' },
      { id: 'kid-p11', name: '玩耍11',  path: BASE_KID + 'play/P11.swf' },
      { id: 'kid-p12', name: '玩耍12',  path: BASE_KID + 'play/P12.swf' },
    ],
  },

  // ==================== 🐧 成年形态 ====================
  {
    key: 'adult-basic',
    name: '🐧 成年-基础',
    icon: '🐧',
    files: [
      { id: 'adult-stand',   name: '站立',     path: BASE_ADULT + 'peaceful/Stand.swf' },
      { id: 'adult-stand1',  name: '站立2',    path: BASE_ADULT + 'peaceful/Stand1.swf' },
      { id: 'adult-appear',  name: '出现',     path: BASE_ADULT + 'peaceful/Appear.swf' },
      { id: 'adult-hide',    name: '隐藏',     path: BASE_ADULT + 'peaceful/Hide.swf' },
      { id: 'adult-speak',   name: '说话',     path: BASE_ADULT + 'peaceful/Speak.swf' },
      { id: 'adult-first',   name: '初始',     path: BASE_ADULT + 'First.swf' },
      { id: 'adult-levup',   name: '升级',     path: BASE_ADULT + 'LevUp.swf' },
    ],
  },
  {
    key: 'adult-daily',
    name: '🐧 成年-日常',
    icon: '🍽️',
    files: [
      { id: 'adult-eat1',    name: '吃东西1',  path: BASE_ADULT + 'Eat1.swf' },
      { id: 'adult-eat2',    name: '吃东西2',  path: BASE_ADULT + 'Eat2.swf' },
      { id: 'adult-clean1',  name: '清洁1',    path: BASE_ADULT + 'Clean1.swf' },
      { id: 'adult-clean2',  name: '清洁2',    path: BASE_ADULT + 'Clean2.swf' },
      { id: 'adult-cure1',   name: '治疗1',    path: BASE_ADULT + 'Cure1.swf' },
      { id: 'adult-cure2',   name: '治疗2',    path: BASE_ADULT + 'Cure2.swf' },
    ],
  },
  {
    key: 'adult-health',
    name: '🐧 成年-健康',
    icon: '🏥',
    files: [
      { id: 'adult-sick1',   name: '生病1',    path: BASE_ADULT + 'Sick1.swf' },
      { id: 'adult-sick2',   name: '生病2',    path: BASE_ADULT + 'Sick2.swf' },
      { id: 'adult-dying',   name: '濒死',     path: BASE_ADULT + 'Dying.swf' },
      { id: 'adult-die',     name: '死亡',     path: BASE_ADULT + 'Die.swf' },
      { id: 'adult-bury',    name: '埋葬',     path: BASE_ADULT + 'Bury.swf' },
      { id: 'adult-revival', name: '复活',     path: BASE_ADULT + 'Revival.swf' },
    ],
  },
  {
    key: 'adult-move',
    name: '🐧 成年-移动',
    icon: '🚪',
    files: [
      { id: 'adult-enter1',  name: '进场1',    path: BASE_ADULT + 'Enter1.swf' },
      { id: 'adult-enter2',  name: '进场2',    path: BASE_ADULT + 'Enter2.swf' },
      { id: 'adult-enter3',  name: '进场3',    path: BASE_ADULT + 'Enter3.swf' },
      { id: 'adult-exit1',   name: '退场1',    path: BASE_ADULT + 'Exit1.swf' },
      { id: 'adult-exit2',   name: '退场2',    path: BASE_ADULT + 'Exit2.swf' },
      { id: 'adult-exit3',   name: '退场3',    path: BASE_ADULT + 'Exit3.swf' },
      { id: 'adult-exit4',   name: '退场4',    path: BASE_ADULT + 'Exit4.swf' },
      { id: 'adult-etoj',    name: '蛋变小孩', path: BASE_ADULT + 'Etoj.swf' },
      { id: 'adult-jtoc',    name: '小孩变成年',path: BASE_ADULT + 'Jtoc.swf' },
      { id: 'adult-hideleft',name: '左隐藏',   path: BASE_ADULT + 'Hide_left.swf' },
      { id: 'adult-hideright',name: '右隐藏',  path: BASE_ADULT + 'Hide_right.swf' },
    ],
  },
  {
    key: 'adult-happy',
    name: '🐧 成年-开心',
    icon: '😊',
    files: [
      { id: 'ah-stand',  name: '开心站立', path: BASE_ADULT + 'happy/Stand.swf' },
      { id: 'ah-appear', name: '开心出现', path: BASE_ADULT + 'happy/Appear.swf' },
      { id: 'ah-speak',  name: '开心说话', path: BASE_ADULT + 'happy/Speak.swf' },
      { id: 'ah-h1',     name: '开心动作1',path: BASE_ADULT + 'happy/interact/H1.swf' },
      { id: 'ah-h2',     name: '开心动作2',path: BASE_ADULT + 'happy/interact/H2.swf' },
      { id: 'ah-h3',     name: '开心动作3',path: BASE_ADULT + 'happy/interact/H3.swf' },
      { id: 'ah-m1',     name: '开心表情1',path: BASE_ADULT + 'happy/interact/M1.swf' },
      { id: 'ah-m2',     name: '开心表情2',path: BASE_ADULT + 'happy/interact/M2.swf' },
      { id: 'ah-m3',     name: '开心表情3',path: BASE_ADULT + 'happy/interact/M3.swf' },
    ],
  },
  {
    key: 'adult-peaceful',
    name: '🐧 成年-平静',
    icon: '😌',
    files: [
      { id: 'ap-stand',  name: '平静站立', path: BASE_ADULT + 'peaceful/Stand.swf' },
      { id: 'ap-appear', name: '平静出现', path: BASE_ADULT + 'peaceful/Appear.swf' },
      { id: 'ap-speak',  name: '平静说话', path: BASE_ADULT + 'peaceful/Speak.swf' },
      { id: 'ap-h1',     name: '平静动作1',path: BASE_ADULT + 'peaceful/interact/H1.swf' },
      { id: 'ap-h2',     name: '平静动作2',path: BASE_ADULT + 'peaceful/interact/H2.swf' },
      { id: 'ap-h3',     name: '平静动作3',path: BASE_ADULT + 'peaceful/interact/H3.swf' },
      { id: 'ap-h4',     name: '平静动作4',path: BASE_ADULT + 'peaceful/interact/H4.swf' },
      { id: 'ap-h5',     name: '平静动作5',path: BASE_ADULT + 'peaceful/interact/H5.swf' },
      { id: 'ap-m1',     name: '平静表情1',path: BASE_ADULT + 'peaceful/interact/M1.swf' },
      { id: 'ap-m2',     name: '平静表情2',path: BASE_ADULT + 'peaceful/interact/M2.swf' },
    ],
  },
  {
    key: 'adult-sad',
    name: '🐧 成年-难过',
    icon: '😢',
    files: [
      { id: 'as-stand',  name: '难过站立', path: BASE_ADULT + 'sad/Stand.swf' },
      { id: 'as-appear', name: '难过出现', path: BASE_ADULT + 'sad/Appear.swf' },
      { id: 'as-speak',  name: '难过说话', path: BASE_ADULT + 'sad/Speak.swf' },
      { id: 'as-h1',     name: '难过动作1',path: BASE_ADULT + 'sad/interact/H1.swf' },
      { id: 'as-h2',     name: '难过动作2',path: BASE_ADULT + 'sad/interact/H2.swf' },
      { id: 'as-h3',     name: '难过动作3',path: BASE_ADULT + 'sad/interact/H3.swf' },
      { id: 'as-m1',     name: '难过表情1',path: BASE_ADULT + 'sad/interact/M1.swf' },
      { id: 'as-m2',     name: '难过表情2',path: BASE_ADULT + 'sad/interact/M2.swf' },
    ],
  },
  {
    key: 'adult-upset',
    name: '🐧 成年-生气',
    icon: '😠',
    files: [
      { id: 'au-stand',  name: '生气站立', path: BASE_ADULT + 'upset/Stand.swf' },
      { id: 'au-standc', name: '生气站立C',path: BASE_ADULT + 'upset/StandC.swf' },
      { id: 'au-appear', name: '生气出现', path: BASE_ADULT + 'upset/Appear.swf' },
      { id: 'au-speak',  name: '生气说话', path: BASE_ADULT + 'upset/Speak.swf' },
      { id: 'au-h1',     name: '生气动作1',path: BASE_ADULT + 'upset/interact/H1.swf' },
      { id: 'au-h2',     name: '生气动作2',path: BASE_ADULT + 'upset/interact/H2.swf' },
      { id: 'au-m1',     name: '生气表情1',path: BASE_ADULT + 'upset/interact/M1.swf' },
      { id: 'au-m2',     name: '生气表情2',path: BASE_ADULT + 'upset/interact/M2.swf' },
    ],
  },
  {
    key: 'adult-prostrate',
    name: '🐧 成年-趴下',
    icon: '😴',
    files: [
      { id: 'apr-stand', name: '趴下站立', path: BASE_ADULT + 'prostrate/Stand.swf' },
      { id: 'apr-appear',name: '趴下出现', path: BASE_ADULT + 'prostrate/Appear.swf' },
      { id: 'apr-speak', name: '趴下说话', path: BASE_ADULT + 'prostrate/Speak.swf' },
      { id: 'apr-h1',    name: '趴下动作1',path: BASE_ADULT + 'prostrate/interact/H1.swf' },
      { id: 'apr-h2',    name: '趴下动作2',path: BASE_ADULT + 'prostrate/interact/H2.swf' },
      { id: 'apr-m1',    name: '趴下表情1',path: BASE_ADULT + 'prostrate/interact/M1.swf' },
    ],
  },
  {
    key: 'adult-play',
    name: '🐧 成年-玩耍',
    icon: '🎉',
    files: [
      { id: 'apl-p1',  name: '玩耍1',   path: BASE_ADULT + 'peaceful/play/P1.swf' },
      { id: 'apl-p2',  name: '玩耍2',   path: BASE_ADULT + 'peaceful/play/P2.swf' },
      { id: 'apl-p3',  name: '玩耍3',   path: BASE_ADULT + 'peaceful/play/P3.swf' },
      { id: 'apl-p4',  name: '玩耍4',   path: BASE_ADULT + 'peaceful/play/P4.swf' },
      { id: 'apl-p5',  name: '玩耍5',   path: BASE_ADULT + 'peaceful/play/P5.swf' },
      { id: 'apl-p6',  name: '玩耍6',   path: BASE_ADULT + 'peaceful/play/P6.swf' },
      { id: 'apl-p7',  name: '玩耍7',   path: BASE_ADULT + 'peaceful/play/P7.swf' },
      { id: 'apl-p8',  name: '玩耍8',   path: BASE_ADULT + 'peaceful/play/P8.swf' },
      { id: 'apl-p9',  name: '玩耍9',   path: BASE_ADULT + 'peaceful/play/P9.swf' },
      { id: 'apl-p10', name: '玩耍10',  path: BASE_ADULT + 'peaceful/play/P10.swf' },
      { id: 'apl-p11', name: '玩耍11',  path: BASE_ADULT + 'peaceful/play/P11.swf' },
      { id: 'apl-p12', name: '玩耍12',  path: BASE_ADULT + 'peaceful/play/P12.swf' },
    ],
  },
]

// ============================================================
// 旧版素材库 (swf_original/102) - 保留供参考
// ============================================================
/*
const BASE_OLD = '/assets/swf_original/102/'

export const swfCategoriesOld = [
  {
    key: 'idle',
    name: '常规',
    icon: '🐧',
    files: [
      { id: '0',  name: '通常',     path: BASE_OLD + '1020000141.swf' },
      { id: '3',  name: '眨眼',     path: BASE_OLD + '1020010141.swf' },
      // ... 更多旧版素材
    ],
  },
]
*/
