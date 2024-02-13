"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.splitCssFile = void 0;
const fs = __importStar(require("fs"));
const postcss_1 = __importDefault(require("postcss"));
function splitCssFile(inputFile, outputDirectory, numFiles) {
    const css = fs.readFileSync(inputFile, "utf8");
    const root = postcss_1.default.parse(css);
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
    let currentRoot = postcss_1.default.root();
    root.walk((node) => {
        if (node.type === "rule" || node.type === "atrule") {
            currentRuleCount++;
            currentRoot.append(node.clone());
            if (currentRuleCount >= rulesPerFile) {
                let name = writeCssFile(currentRoot, outputDirectory, currentFileIndex);
                chunkCssNames.push(name);
                currentFileIndex++;
                currentRuleCount = 0;
                currentRoot = postcss_1.default.root();
            }
        }
    });
    if (currentRoot.nodes.length > 0) {
        let name = writeCssFile(currentRoot, outputDirectory, currentFileIndex);
        chunkCssNames.push(name);
    }
    return chunkCssNames;
}
exports.splitCssFile = splitCssFile;
function writeCssFile(root, directory, index) {
    if (!fs.existsSync(directory)) {
        fs.mkdirSync(directory, { recursive: true });
    }
    const css = root.toResult().css;
    const chunkName = `chunk.${Math.random().toString(36).slice(2, 9)}.css`;
    const fileName = `${directory}/${chunkName}`;
    fs.writeFileSync(fileName, css, "utf8");
    return chunkName;
}
