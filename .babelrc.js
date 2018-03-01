const cjs = ['@babel/plugin-transform-modules-commonjs']

module.exports = {
  plugins: process.env.NODE_ENV === 'cjs' ? cjs : [],
  presets: ['@babel/preset-flow']
}
