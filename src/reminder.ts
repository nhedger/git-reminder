import { Disposable, commands, window, workspace } from "vscode";
import type { API } from "../types/vscode.git";
import { config } from "./config";
import { logger } from "./logger";
import { RepositoriesWatcher, type RepositoryStatus } from "./watcher";

/**
 * Reminder
 *
 * The reminder is responsible listening to the repositories watcher and
 * notifying the user when a repository is in a dirty state. It also watches
 * for changes in the user's configuration and restarts the watcher when
 * necessary.
 */
export class Reminder extends Disposable {
	private repositoriesWatcher: RepositoriesWatcher | undefined;

	constructor(private readonly api: API) {
		super(() => this.repositoriesWatcher?.stop());
		this.watchConfiguration();
	}

	/**
	 * Starts the reminder
	 */
	public start(): void {
		if (config<boolean>("enabled", true)) {
			this.setupRepositoriesWatcher();
			logger.info("Reminder started.");
		} else {
			logger.info("Reminder is disabled.");
		}
	}

	/**
	 * Stops the reminder
	 */
	public stop(): void {
		this.repositoriesWatcher?.stop();
		logger.info("Reminder stopped.");
	}

	/**
	 * Restarts the reminder
	 */
	public restart(): void {
		this.stop();
		this.start();
	}

	/**
	 * Sets up the repositories watcher
	 */
	private async setupRepositoriesWatcher(): Promise<void> {
		this.repositoriesWatcher = new RepositoriesWatcher({
			api: this.api,
			interval: config<number>("checkInterval", 120) * 1000,
		});

		this.repositoriesWatcher.on("updated", this.handleRepositoriesUpdate.bind(this));

		this.repositoriesWatcher.start();
	}

	/**
	 * Sets up the configuration watcher
	 */
	private async watchConfiguration(): Promise<void> {
		workspace.onDidChangeConfiguration((event) => {
			if (event.affectsConfiguration("gitReminder")) {
				logger.info("Configuration changed, restarting reminder.");
				this.restart();
			}
		});
	}

	/**
	 * Handles the repositories status updates
	 */
	private async handleRepositoriesUpdate(repositories: RepositoryStatus[]): Promise<void> {
		const diffNowInSeconds = (d1: Date) => Math.abs(d1.getTime() - new Date().getTime()) / 1000;

		const uncommitted = repositories.some((repo) => {
			if (!repo.uncommittedChangesSince) {
				return false;
			}

			return diffNowInSeconds(repo.uncommittedChangesSince) > config<number>("secondsUncommitted", 1800);
		});

		const unpushed = repositories.some((repo) => {
			if (!repo.unpushedCommitsSince) {
				return false;
			}

			return diffNowInSeconds(repo.unpushedCommitsSince) > config<number>("secondsUnpushed", 1800);
		});

		logger.info(`Uncommitted: ${uncommitted}, Unpushed: ${unpushed}`);

		if (uncommitted || unpushed) {
			this.stop();
			const action = await this.notify(uncommitted, unpushed);
			if (action === "Open Git View") {
				commands.executeCommand("workbench.view.scm");
			}
			this.start();
		}
	}

	private async notify(uncommitted: boolean, unpushed: boolean): Promise<"Open Git View" | "Snooze" | undefined> {
		let message: string;

		if (uncommitted && unpushed) {
			message = "You haven't committed your changes and pushed commits in a while.";
		} else if (uncommitted) {
			message = "You haven't committed your changes in a while.";
		} else if (unpushed) {
			message = "You haven't pushed commits in a while.";
		} else {
			return;
		}

		return await window.showWarningMessage(
			message,
			{
				modal: config<string>("notificationType", "notification") === "modal",
				detail: message,
			},
			"Open Git View",
			"Snooze",
		);
	}
}
