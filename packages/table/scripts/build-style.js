import path from 'path'
import fs from 'fs'
import picocolors from 'picocolors'
import gulp from 'gulp'
import cleanCSS from 'gulp-clean-css'
import less from 'gulp-less'
import rename from 'gulp-rename'
import header from 'gulp-header'
import autoprefixer from 'gulp-autoprefixer'

import pkg from '../package.json' assert { type: 'json' }
// const moduleName = pkg.name
const moduleName = 'index'
const version = pkg.version

const banner =
  '/**\n' +
  ` * ${moduleName} v${version}\n` +
  ` * (c) 2024-${new Date().getFullYear()} 君惜 (xinlei3166)\n` +
  ' * Released under the MIT License.\n' +
  ' */\n'

// gen build less task
function gen(src, name, dest) {
  return function buildLess() {
    const fullsrc = path.resolve(src)
    const fulldest = path.resolve(dest, name)
    console.log(
      `${picocolors.bgGreen('Success')} ${picocolors.cyan(fullsrc)} -> ${picocolors.cyan(
        fulldest
      )}`
    )
    return (
      gulp
        .src(src)
        .pipe(less())
        .pipe(
          autoprefixer({
            overrideBrowserslist: ['last 2 versions', 'ie > 8']
          })
        )
        .pipe(cleanCSS())
        .pipe(header(banner))
        .pipe(rename(name))
        // .pipe(gulp.dest(dest, {sourcemaps: '.'}))
        .pipe(gulp.dest(dest))
    )
  }
}

const src = path.resolve('../src/styles')
const dist = path.resolve('../dist/styles')

const index = gen(`${src}/index.less`, `${moduleName}.css`, dist)

export default gulp.series(index)
