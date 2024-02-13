"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SplitCssPlugin = void 0;
const path_1 = __importDefault(require("path"));
const glob_1 = __importDefault(require("glob"));
const fs_1 = __importDefault(require("fs"));
const jsdom_1 = require("jsdom");
const split_1 = require("./split");
const PLUGIN_NAME = "SplitCssPlugin";
class SplitCssPlugin {
    constructor(options) {
        var _a;
        this.options = {
            cssFileNum: (_a = options.cssFileNum) !== null && _a !== void 0 ? _a : 5,
        };
        this.allCssFileNames = [];
    }
    apply(compiler) {
        compiler.hooks.compilation.tap(PLUGIN_NAME, (compilation) => {
            compilation.hooks.afterProcessAssets.tap({
                name: PLUGIN_NAME,
            }, (assets) => {
                Object.keys(assets).forEach((asset) => {
                    if (path_1.default.extname(asset) === ".css") {
                        const cssContent = assets[asset].source();
                        this.allCssFileNames.push(asset);
                    }
                });
            });
        });
        compiler.hooks.afterEmit.tap(PLUGIN_NAME, (compilation) => {
            const outputPath = compiler.options.output.path;
            const AllHtmlFiles = glob_1.default.sync(path_1.default.join(outputPath, "**/*.html"));
            let cssMap = new Map();
            this.allCssFileNames.forEach((cssName) => {
                let AllChunksName = (0, split_1.splitCssFile)(path_1.default.join(outputPath, cssName), path_1.default.join(outputPath, "/static/css"), this.options.cssFileNum);
                cssMap.set(cssName, AllChunksName);
            });
            // todo: rm source css
            // this.allCssFileNames.forEach((cssName) => {
            //   fs.unlinkSync(path.join(outputPath,cssName))
            // })
            AllHtmlFiles.forEach((file) => {
                const html = fs_1.default.readFileSync(file, "utf-8");
                const dom = new jsdom_1.JSDOM(html);
                const document = dom.window.document;
                // remove old css link
                const links = document.querySelectorAll('link[rel="stylesheet"]');
                links.forEach((link) => {
                    const href = link.getAttribute("href");
                    if (cssMap.has(path_1.default.basename(href))) {
                        link.parentNode.removeChild(link);
                    }
                });
                // add new css link
                cssMap.forEach((newCssFiles, oldCssFile) => {
                    newCssFiles.forEach((newCssFile) => {
                        const link = document.createElement("link");
                        link.rel = "stylesheet";
                        link.href = path_1.default.join("static", "css", path_1.default.basename(newCssFile));
                        document.head.appendChild(link);
                    });
                });
                fs_1.default.writeFileSync(file, dom.serialize());
            });
        });
    }
}
exports.SplitCssPlugin = SplitCssPlugin;
