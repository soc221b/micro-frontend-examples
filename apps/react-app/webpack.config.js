const path = require("path");
const slugify = require("slugify");
const {
  convertDependenciesToShared,
} = require("./convert-dependencies-to-shared");
const deps = require("./package.json").dependencies;

/**
 * @type {import('webpack').Configuration}
 */
module.exports = {
  entry: "./src/lifecycle-hooks.js",

  plugins: [
    new (require("webpack").container.ModuleFederationPlugin)({
      // For more info, see /app/webpack.config.js
      name: "react_app",
      filename: "remoteEntry.js",

      // For more info, see /layout-app/src/applications.js
      exposes: {
        "./lifecycle-hooks": "./src/lifecycle-hooks.js",
      },

      shared: convertDependenciesToShared(deps),
    }),

    new (require("clean-webpack-plugin").CleanWebpackPlugin)(),
  ],

  output: {
    filename: "[name].[contenthash].js",
    path: path.resolve(__dirname, "dist"),
  },

  optimization:
    process.env.NODE_ENV === "production"
      ? {
          minimize: true,
          splitChunks: {
            chunks: "all",
            maxInitialRequests: Infinity,
            minSize: 0,
            cacheGroups: {
              vendor: {
                test: /[\\/]node_modules[\\/]\.pnpm[\\/]/,
                name(module) {
                  const packageName = module.context.match(
                    /[\\/]node_modules[\\/]\.pnpm[\\/](.*?)([\\/]|$)/
                  )[1];
                  return packageName && slugify(packageName);
                },
              },
            },
          },
        }
      : {},

  module: {
    rules: [
      {
        test: /\.js$/,
        loader: "babel-loader",
        exclude: /node_modules/,
        options: {
          presets: ["@babel/preset-react"],
        },
      },
    ],
  },

  devServer: {
    port: process.env.PORT,
  },
};
