import { type Extension, extensions } from "vscode";
import type { API as BuiltInGitApi, GitExtension } from "../types/vscode.git";

/**
 * Checks if the built-in Git extension is available.
 */
export const gitApiAvailable = async (): Promise<boolean> => {
	return (await useGitApi()) !== undefined;
};

/**
 * Retrieves the built-in Git extension's API.
 *
 * If the extension is not available, `undefined` is returned.
 */
export const useGitApi = async (): Promise<BuiltInGitApi | undefined> => {
	const extension = extensions.getExtension("vscode.git") as Extension<GitExtension>;
	if (extension !== undefined) {
		const gitExtension = extension.isActive ? extension.exports : await extension.activate();
		return gitExtension.getAPI(1);
	}
};
