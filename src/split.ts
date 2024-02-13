import * as fs from "fs";
import postcss from "postcss";

export function splitCssFile(
  inputFile: string,
  outputDirectory: string,
  numFiles: number,
): string[] {
  const css = fs.readFileSync(inputFile, "utf8");
  const root = postcss.parse(css);
  let chunkCssNames = [];
  let totalRules = 0;
  root.walk((node) => {
    if (node.type === "rule" || node.type === "atrule") {
      totalRules++;
    }
  });

  const rulesPerFile = Math.ceil(totalRules / numFiles);
  let currentFileIndex = 0;
  let currentRuleCount = 0;
  let currentRoot = postcss.root();

  root.walk((node) => {
    if (node.type === "rule" || node.type === "atrule") {
      currentRuleCount++;
      currentRoot.append(node.clone());

      if (currentRuleCount >= rulesPerFile) {
        let name = writeCssFile(currentRoot, outputDirectory, currentFileIndex);
        chunkCssNames.push(name);
        currentFileIndex++;
        currentRuleCount = 0;
        currentRoot = postcss.root();
      }
    }
  });

  if (currentRoot.nodes.length > 0) {
    let name = writeCssFile(currentRoot, outputDirectory, currentFileIndex);
    chunkCssNames.push(name);
  }
  return chunkCssNames;
}

function writeCssFile(
  root: postcss.Root,
  directory: string,
  index: number,
): string {
  if (!fs.existsSync(directory)) {
    fs.mkdirSync(directory, { recursive: true });
  }

  const css = root.toResult().css;
  const chunkName = `chunk.${Math.random().toString(36).slice(2, 9)}.css`;
  const fileName = `${directory}/${chunkName}`;
  fs.writeFileSync(fileName, css, "utf8");
  return chunkName;
}
