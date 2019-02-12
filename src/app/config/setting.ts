export default {
  salary: 50000,
  countDefault: 10,
  pageDefault: 0,

  pluginPath:
    process.env.NODE_ENV !== "production"
      ? {
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
      : {
        oss: {
          enable: true,
          path: "dist/app/plugins/oss",
          limit: 100000
        }
      }
};
