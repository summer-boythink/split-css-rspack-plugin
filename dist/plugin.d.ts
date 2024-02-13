import type { Compiler, RspackPluginInstance } from "@rspack/core";
interface Option {
    cssFileNum: number;
    filename?: string;
}
export declare class SplitCssPlugin implements RspackPluginInstance {
    options: Option;
    allCssFileNames: string[];
    constructor(options: Option);
    apply(compiler: Compiler): void;
}
export {};
