import { window } from "vscode";

export const logger = window.createOutputChannel("Git Reminder", {
	log: true,
});
