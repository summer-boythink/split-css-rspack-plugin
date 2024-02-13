import type { Compiler, RspackPluginInstance } from "@rspack/core";
import path from "path";
import _ from "lodash";
import HtmlWebpackPlugin from "html-webpack-plugin";
const cssSplit = require("@pustelto/css-split");
const PLUGIN_NAME = "SplitCssPlugin";
import glob from "glob";
import fs from "fs";
import { PurgeCSS } from "purgecss";

interface Option {
  cssnum?: number;
}

export class SplitCssPlugin implements RspackPluginInstance {
  options: Option;
  constructor(options: Option) {
    this.options = options;
  }

  apply(compiler: Compiler) {
    compiler.hooks.compilation.tap(PLUGIN_NAME, (compilation) => {
      compilation.hooks.processAssets.tapAsync(
        {
          name: PLUGIN_NAME,
        },
        (assets, callback) => {
          Object.keys(assets).forEach((asset) => {
            if (path.extname(asset) === ".css") {
              const cssContent = assets[asset].source();
              console.log(asset);
              // console.log(content);

              const referencingFiles = Object.keys(assets).filter(
                (otherAsset) => {
                  // console.log(otherAsset);

                  const otherContent = assets[otherAsset].source();
                  return otherContent.includes(asset);
                },
              );

              console.log(`Files referencing ${asset}:`, referencingFiles);

              // 根据用户输入的数量均匀地拆分这个CSS文件
                const splitContents: string[] = this.splitContent(
                  cssContent,
                  this.options
                );
                console.log(`Split contents of ${asset}:`, splitContents);

              //   // 更新引用了这个CSS文件的文件，让它们引用拆分后的CSS文件
              //   referencingFiles.forEach((referencingFile) => {
              //     let newContent = assets[referencingFile].source();
              //     splitContents.forEach((splitContent, index) => {
              //       const newAssetName = `${asset}-part${index}.css`;
              //       assets[newAssetName] = {
              //         source: () => splitContent,
              //         size: () => splitContent.length,
              //       };
              //       newContent = newContent.replace(asset, newAssetName);
              //     });
              //     assets[referencingFile] = {
              //       source: () => newContent,
              //       size: () => newContent.length,
              //     };
              //   });
            }
          });
          callback();
        },
      );
    });

    compiler.hooks.afterDone.tap(PLUGIN_NAME,(compilation) => {
          const outputPath = compiler.options.output.path;
          const AllHtmlFiles = glob.sync(path.join(outputPath!, "**/*.html"));
          console.log(AllHtmlFiles);
          AllHtmlFiles.forEach((file) => {
            // 读取文件内容
            const content = fs.readFileSync(file, "utf8");

            
          });
    })
  }

  splitContent(content: string, option: Option): string[] {
    //todo
    return []
  }
}
