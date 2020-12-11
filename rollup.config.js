import { name, version, author } from './package.json'
import { terser } from 'rollup-plugin-terser'
import { babel } from '@rollup/plugin-babel'

// TODO: add LICENSE
const banner = `
/*!
 * ${name}
 * @version ${version}
 * @author ${author}
 */
`

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
      name,
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
        name,
        plugins: [terserPlugin],
        banner
      }
    ])
  }
  const config = {
    input: 'src/index.js',
    output: outputs
  }
  if (!minimize) {
    config.watch = {
      include: 'src/**'
    }
  }
  else {
    config.plugins = [babelPlugin]
  }
  return config
}
