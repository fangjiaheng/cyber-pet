#!/usr/bin/env node
/**
 * dev-only：直接改写 electron-store 加密的 config.json，把宠物状态加满。
 * 必须在 Electron 应用未运行时执行，否则会被 in-memory state 覆盖。
 */
const fs = require('fs')
const path = require('path')
const crypto = require('crypto')
const os = require('os')

const ENCRYPTION_KEY = 'cyber-mate-pet-2026'
const ALGO = 'aes-256-cbc'
const STORE_PATH = path.join(os.homedir(), 'Library/Application Support/desktop-pet/config.json')

function decrypt(buf) {
  if (buf.slice(16, 17).toString() !== ':') {
    throw new Error('未识别的存档格式（缺少 IV 分隔符）')
  }
  const iv = buf.slice(0, 16)
  const password = crypto.pbkdf2Sync(ENCRYPTION_KEY, iv.toString(), 10000, 32, 'sha512')
  const decipher = crypto.createDecipheriv(ALGO, password, iv)
  return Buffer.concat([decipher.update(buf.slice(17)), decipher.final()]).toString('utf8')
}

function encrypt(json) {
  const iv = crypto.randomBytes(16)
  const password = crypto.pbkdf2Sync(ENCRYPTION_KEY, iv.toString(), 10000, 32, 'sha512')
  const cipher = crypto.createCipheriv(ALGO, password, iv)
  return Buffer.concat([iv, Buffer.from(':'), cipher.update(Buffer.from(json)), cipher.final()])
}

function getHungerMax(level) {
  return Math.min(6000, 3000 + 100 * Math.min(level, 30))
}
function getCleanlinessMax(level) {
  return Math.min(6000, 3000 + 100 * Math.min(level, 30))
}

const raw = fs.readFileSync(STORE_PATH)
const decrypted = decrypt(raw)
const data = JSON.parse(decrypted)

const pet = data.petState || {}
const level = pet.level || 1
const hungerMax = getHungerMax(level)
const cleanMax = getCleanlinessMax(level)

const before = {
  hunger: pet.hunger,
  cleanliness: pet.cleanliness,
  mood: pet.mood,
  energy: pet.energy,
  health: pet.health,
}

pet.hunger = hungerMax
pet.cleanliness = cleanMax
pet.mood = 1000
pet.energy = 100
pet.health = 5
// 清除疾病状态（否则 decay tick 会从 activeDisease 算回 health=1 → emotion=sad）
pet.diseaseState = {
  discomfortCounters: { overfed: 0, dirty: 0, hungry: 0 },
  activeDisease: null,
  lastProgressionTime: Date.now(),
}
pet.lastUpdateTime = Date.now()
data.petState = pet

fs.writeFileSync(STORE_PATH, encrypt(JSON.stringify(data)))

console.log('✅ 宠物状态已加满')
console.log(`level=${level} -> hungerMax=${hungerMax} cleanMax=${cleanMax}`)
console.log('before:', before)
console.log('after :', { hunger: pet.hunger, cleanliness: pet.cleanliness, mood: pet.mood, energy: pet.energy, health: pet.health })
