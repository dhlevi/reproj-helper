const path = require('path');

module.exports = {
  entry: './index.js',
  devtool: 'inline-source-map',
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
    ],
  },
  resolve: {
    extensions: [ '.tsx', '.ts', '.js' ],
    fallback: { 
      "https": require.resolve("https-browserify"),
      "url": require.resolve("url/"),
      "http": require.resolve("stream-http"),
      "buffer": require.resolve("buffer/")
    }
  },
  output: {
    filename: 'reproj-helper.js',
    path: path.resolve(__dirname, 'dist/lib'),
  },
};
