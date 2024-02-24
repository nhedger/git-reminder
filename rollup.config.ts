import { nodeResolve } from "@rollup/plugin-node-resolve";
import { defineConfig } from "rollup";
import esbuild from "rollup-plugin-esbuild";

export default defineConfig({
	input: "src/index.ts",
	output: {
		dir: "out",
		format: "cjs",
	},
	plugins: [
		nodeResolve(),
		esbuild({
			target: "node16",
			sourceMap: true,
		}),
	],
	external: ["vscode", "node:events"],
});
