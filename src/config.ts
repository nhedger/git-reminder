import { workspace } from "vscode";

export function config<T>(key: string): T | undefined;
export function config<T>(key: string, defaultValue: T): T;
export function config<T>(key: string, defaultValue?: T): T | undefined {
	if (defaultValue === undefined) {
		return workspace.getConfiguration("gitReminder").get<T>(key);
	}
	return workspace.getConfiguration("gitReminder").get<T>(key, defaultValue);
}
