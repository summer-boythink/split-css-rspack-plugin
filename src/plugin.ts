import type { Compiler, RspackPluginInstance } from "@rspack/core";
import path from "path";
import _ from "lodash";
import glob from "glob";
import fs from "fs";
import url from "url";
import { PurgeCSS } from "purgecss";
import { JSDOM } from "jsdom";
import { splitCssFile } from "./split";

const PLUGIN_NAME = "SplitCssPlugin";

interface Option {
  cssFileNum: number;
  //todo '[name]-[part].[ext]'
  filename?: string;
}

export class SplitCssPlugin implements RspackPluginInstance {
  options: Option;
  allCssFileNames: string[];
  constructor(options: Option) {
    this.options = {
      cssFileNum: options.cssFileNum ?? 5,
    };
    this.allCssFileNames = [];
  }

  apply(compiler: Compiler) {
    compiler.hooks.compilation.tap(PLUGIN_NAME, (compilation) => {
      compilation.hooks.afterProcessAssets.tap(
        {
          name: PLUGIN_NAME,
        },
        (assets) => {
          Object.keys(assets).forEach((asset) => {
            if (path.extname(asset) === ".css") {
              const cssContent = assets[asset].source();
              this.allCssFileNames.push(asset);
            }
          });
        },
      );
    });

    compiler.hooks.afterEmit.tap(PLUGIN_NAME, (compilation) => {
      const outputPath = compiler.options.output.path!;
      const AllHtmlFiles = glob.sync(path.join(outputPath, "**/*.html"));
      let cssMap = new Map();
      this.allCssFileNames.forEach((cssName) => {
        let AllChunksName = splitCssFile(
          path.join(outputPath, cssName),
          path.join(outputPath, "/static/css"),
          this.options.cssFileNum,
        );
        cssMap.set(cssName, AllChunksName);
      });

      // todo: rm source css
      // this.allCssFileNames.forEach((cssName) => {
      //   fs.unlinkSync(path.join(outputPath,cssName))
      // })
      AllHtmlFiles.forEach((file) => {
        const html = fs.readFileSync(file, "utf-8");

        const dom = new JSDOM(html);
        const document = dom.window.document;

        // remove old css link
        const links = document.querySelectorAll('link[rel="stylesheet"]');
        links.forEach((link) => {
          const href = link.getAttribute("href");
          if (cssMap.has(path.basename(href!))) {
            link.parentNode!.removeChild(link);
          }
        });

        // add new css link
        cssMap.forEach((newCssFiles, oldCssFile) => {
          newCssFiles.forEach((newCssFile: string) => {
            const link = document.createElement("link");
            link.rel = "stylesheet";
            link.href = path.join("static", "css", path.basename(newCssFile));
            document.head.appendChild(link);
          });
        });

        fs.writeFileSync(file, dom.serialize());
      });
    });
  }
}
