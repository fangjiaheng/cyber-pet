#!/usr/bin/env node
/**
 * 把宠物窗口位置重置到屏幕左上 (100,100)，应用必须未运行。
 * settings 里没有持久化的 position 字段，主要靠重启后默认值；
 * 这里同时清掉 petState.position 以防内存里覆盖（其实 petState 没存 position，仅作冗余）。
 */
const fs = require('fs')
const path = require('path')
const crypto = require('crypto')
const os = require('os')

const ENCRYPTION_KEY = 'cyber-mate-pet-2026'
const STORE_PATH = path.join(os.homedir(), 'Library/Application Support/desktop-pet/config.json')

function decrypt(buf) {
  const iv = buf.slice(0, 16)
  const password = crypto.pbkdf2Sync(ENCRYPTION_KEY, iv.toString(), 10000, 32, 'sha512')
  const decipher = crypto.createDecipheriv('aes-256-cbc', password, iv)
  return Buffer.concat([decipher.update(buf.slice(17)), decipher.final()]).toString('utf8')
}
function encrypt(json) {
  const iv = crypto.randomBytes(16)
  const password = crypto.pbkdf2Sync(ENCRYPTION_KEY, iv.toString(), 10000, 32, 'sha512')
  const cipher = crypto.createCipheriv('aes-256-cbc', password, iv)
  return Buffer.concat([iv, Buffer.from(':'), cipher.update(Buffer.from(json)), cipher.final()])
}

const buf = fs.readFileSync(STORE_PATH)
const data = JSON.parse(decrypt(buf))

if (data.petState) {
  delete data.petState.position
}
if (data.windowState) {
  delete data.windowState
}

fs.writeFileSync(STORE_PATH, encrypt(JSON.stringify(data)))
console.log('✅ 已清除持久化的位置信息（启动后会回到默认位置）')
