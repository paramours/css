#!/usr/bin/env node
import { readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { argv, cwd, stderr, stdout } from 'node:process'
import { fileURLToPath } from 'node:url'
import styles from './index.mjs'

function getArg(key) {
  const value = argv.find(a => a.startsWith(`--${key}=`))
  if (!value) return null
  return value.replace(`--${key}=`, '')
}

const here = fileURLToPath(new URL('.', import.meta.url))

const configArg = getArg('config')
const outputArg = getArg('output')
const configPath = configArg
  ? join(cwd(), configArg)
  : join(here, './styleguide.mjs')

let config = {}
try {
  const { default: configObject } = await import(configPath)
  config = configObject
}
catch (err) {
  stderr.write(`Error reading config file: ${configPath}\n`)
  process.exit(1)
}

if (outputArg) {
  const outputPath = join(cwd(), outputArg)
  try {
    writeFileSync(outputPath, styles(config))
  }
  catch (err) {
    stderr.write(`Error writing to output file: ${outputPath}\n`)
    process.exit(1)
  }
} else {
  stdout.write(styles(config))
}
