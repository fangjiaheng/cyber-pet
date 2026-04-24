#!/usr/bin/env node
const fs = require('fs')
const path = require('path')
const crypto = require('crypto')
const os = require('os')

const ENCRYPTION_KEY = 'cyber-mate-pet-2026'
const STORE_PATH = path.join(os.homedir(), 'Library/Application Support/desktop-pet/config.json')

const buf = fs.readFileSync(STORE_PATH)
const iv = buf.slice(0, 16)
const password = crypto.pbkdf2Sync(ENCRYPTION_KEY, iv.toString(), 10000, 32, 'sha512')
const decipher = crypto.createDecipheriv('aes-256-cbc', password, iv)
const decrypted = Buffer.concat([decipher.update(buf.slice(17)), decipher.final()]).toString('utf8')
const data = JSON.parse(decrypted)

console.log('petState:', JSON.stringify(data.petState, null, 2))
