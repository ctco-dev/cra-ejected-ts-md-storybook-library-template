const path = require('path');
const include = path.resolve(__dirname, '../');

module.exports = {
  devtool: 'inline-source-map',
  module: {
    rules: [
      {
        test: /\.ts(x?)$/,
        loaders: ['babel-loader', 'awesome-typescript-loader'],
        include
      },
      {
        test: /\.css$/,
        use: [
          require.resolve('style-loader'),
          {
            loader: require.resolve('css-loader'),
          },
        ],
      },
    ]
  },
  resolve: {
    extensions: ['.js', '.ts', '.tsx', '.json']
  }
};
