export default {
  salary: 50000,

  pluginPath: {
    // plugin name
    oss: {
      // determine a plugin work or not
      enable: true,
      // path of the plugin that relatived the workdir
      path: "src/app/plugins/oss",
      // other config
      limit: 100000
    }
  }
};
