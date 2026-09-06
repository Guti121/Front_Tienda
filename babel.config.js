module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    // 'react-native-reanimated/plugin' DEBE ser el último de la lista.
    plugins: ['react-native-reanimated/plugin'],
  };
};
