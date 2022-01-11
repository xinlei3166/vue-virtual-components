# yunque
Simple scaffolding tools.

## @yunquejs/cli
A cli for creating front-end projects

## @yunquejs/release
npm package version management，include build、test、push github、npm publish

## @yunquejs/fabric
Project specification and coding aid

# @yunquejs/fabric
A collection of configuration files containing prettier, eslint, rollup.

## Install
```
# npm
npm install -D @yunquejs/fabric

# yarn
yarn add -D @yunquejs/fabric

# pnpm
pnpm add -D @yunquejs/fabric
```

## Usage

git `verify-commit`
```json
"gitHooks": {
  "pre-commit": "lint-staged",
  "commit-msg": "verify-commit"
}
```

in `.eslintrc.js`
```js
module.exports = {
  extends: [require.resolve('@yunquejs/fabric/dist/eslint')],
}
```

in `.prettierrc.js`
```js
const prettier = require('@yunquejs/fabric/dist/prettier');

module.exports = {
  ...prettier,
}
```
