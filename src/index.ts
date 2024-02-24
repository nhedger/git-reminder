import { useGitApi } from "./git";
import { logger } from "./logger";
import { Reminder } from "./reminder";

/**
 * Entry point for the extension.
 */
export const activate = async () => {
	const api = await useGitApi();

	// This extension cannot work without the Git API
	if (!api) {
		logger.error("Git API not available, extension will not work.");
		return;
	}

	// Wait for the Git API to be initialized before starting the reminder
	api.onDidChangeState((state) => {
		if (state === "initialized") {
			new Reminder(api).start();
		}
	});
};

export const deactivate = () => {};
