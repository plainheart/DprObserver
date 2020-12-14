import { readFileSync } from 'fs'
import { terser } from 'rollup-plugin-terser'
import { babel } from '@rollup/plugin-babel'
import { name, description, version, author } from './package.json'
import json from '@rollup/plugin-json'
import camelCase from 'lodash.camelcase'

function wrapComment(str) {
  if (!str.includes('\n')) {
    return `/*! ${str.replace(/\*\//g, '* /')} */`
  }
  return `/*!\n * ${str
    .replace(/\*\//g, '* /')
    .split('\n')
    .join('\n * ')}\n */`
}

const license = readFileSync('LICENSE', 'utf8')
const banner = wrapComment(`${name}\n${description}\n\n@version ${version}\n@author ${author}\n\n${license}`)
const objName = `${name[0].toUpperCase()}${camelCase(name).slice(1)}`

export default args => {
  const minimize = !!args.configMin
  const terserPlugin = terser({
    compress: {
      pure_funcs: minimize && ['console.log']
    }
  })
  const babelPlugin = babel({
    include: 'src/**',
    extensions: ['.js'],
    babelHelpers: 'bundled'
  })
  let outputs = [
    {
      file: `dist/${name}.cjs.js`,
      format: 'cjs',
      exports: 'default',
      sourcemap: minimize
    },
    {
      file: `dist/${name}.esm.js`,
      format: 'es',
      sourcemap: minimize
    },
    {
      file: `dist/${name}.js`,
      format: 'umd',
      name: objName,
      sourcemap: minimize
    }
  ]
  if (minimize) {
    outputs = outputs.concat([
      {
        file: `dist/${name}.cjs.min.js`,
        format: 'cjs',
        exports: 'default',
        plugins: [terserPlugin],
        banner
      },
      {
        file: `dist/${name}.esm.min.js`,
        format: 'es',
        plugins: [terserPlugin],
        banner
      },
      {
        file: `dist/${name}.min.js`,
        format: 'umd',
        name: objName,
        plugins: [terserPlugin],
        banner
      }
    ])
  }
  const config = {
    input: 'src/index.js',
    output: outputs,
    plugins: [json()]
  }
  if (!minimize) {
    config.watch = {
      include: 'src/**'
    }
  }
  else {
    config.plugins.push(babelPlugin)
  }
  return config
}
