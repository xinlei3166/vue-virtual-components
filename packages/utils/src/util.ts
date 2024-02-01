import { fileURLToPath } from 'url'
import path from 'path'
import fs from 'fs'

export const getDirname = (importMetaUrl: string) =>
  path.dirname(fileURLToPath(importMetaUrl))

interface FindFilesOptions {
  src: string
  exclude: Array<string>
  filetype: 'file' | 'dir'
}

export function findFiles({
  src,
  exclude = [],
  filetype = 'file'
}: FindFilesOptions) {
  let files = fs.readdirSync(src)
  files = files.filter(f => !exclude.includes(f))
  if (filetype === 'dir') {
    return files.filter(f => {
      const s = fs.statSync(path.resolve(src, f))
      return s.isDirectory()
    })
  }
  return files.filter(f => f.endsWith('.ts') && !f.endsWith('.d.ts'))
}
