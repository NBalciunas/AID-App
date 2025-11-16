const req = require.context("./", false, /\.json$/);

const maps = {};

req.keys().forEach((key) => {
    const name = key.replace("./", "").replace(".json", "");
    maps[name] = req(key);
});

export default maps;
