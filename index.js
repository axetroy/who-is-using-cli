const path = require("path");
const fs = require("fs-extra");
const { table } = require("table");
const chalk = require("chalk");

const node_modules = path.join(process.cwd(), "node_modules");

const data = [
  [
    chalk.green("Package"),
    chalk.green("Version"),
    chalk.green("Is Development"),
    chalk.green("Path")
  ]
];

process.on("exit", function(code) {
  if (code !== 0) {
    return;
  }
  if (data.length <= 1) {
    console.log("not found");
    return;
  }
  const options = {
    border: {
      topBody: `─`,
      topJoin: `┬`,
      topLeft: `┌`,
      topRight: `┐`,

      bottomBody: `─`,
      bottomJoin: `┴`,
      bottomLeft: `└`,
      bottomRight: `┘`,

      bodyLeft: `│`,
      bodyRight: `│`,
      bodyJoin: `│`,

      joinBody: `─`,
      joinLeft: `├`,
      joinRight: `┤`,
      joinJoin: `┼`
    }
  };
  const output = table(data, options);
  console.log(output);
});

function find(packageName) {
  walk(packageName, node_modules);
}

async function walk(packageName, dir) {
  const files = (await fs.readdir(dir)).map(filename =>
    path.join(dir, filename)
  );

  for (const filepath of files) {
    fs.stat(filepath).then(stat => {
      if (stat.isDirectory()) {
        walk(packageName, filepath);
      } else {
        if (path.basename(filepath) === "package.json") {
          fs.readJson(filepath).then(package => {
            const dependencies = package.dependencies || {};
            const devDependencies = package.devDependencies || {};

            const allDependencies = { ...dependencies, ...devDependencies };

            if (packageName in allDependencies) {
              const version = allDependencies[packageName];
              data.push([
                package.name,
                version,
                packageName in devDependencies,
                path.relative(node_modules, path.dirname(filepath))
              ]);
            }
          });
        }
      }
    });
  }
}

module.exports = find;
