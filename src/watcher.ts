import { EventEmitter } from "node:events";
import { type Uri, workspace } from "vscode";
import type { API, Repository } from "../types/vscode.git";
import { logger } from "./logger";

/**
 * Repositories Watcher
 *
 * The repositories watcher is responsible for keeping track of the status of
 * all Git repositories across all workspaces. It does so by periodically
 * polling the repositories and updating their status.
 */
export class RepositoriesWatcher extends EventEmitter {
	/**
	 * Timer for scheduling the status update checks
	 */
	private timer: Timer | undefined;

	/**
	 * Repository statuses
	 *
	 * This map keeps track of the status of all known repositories. The key is
	 * the root URI of the repository and the value is the status of the
	 * repository.
	 */
	private statuses: Map<string, RepositoryStatus> = new Map();

	/**
	 * Repositories statuses
	 */
	public get repositories(): Map<string, RepositoryStatus> {
		return this.statuses;
	}

	constructor(private readonly options: RepositoriesWatcherOptions) {
		super();
	}

	/**
	 * Starts the repositories watcher
	 */
	public async start(): Promise<void> {
		this.timer = setInterval(this.update.bind(this), this.options.interval);
		logger.info("Watcher started.");
		logger.info(`Checking for updates every ${this.options.interval / 1000} seconds.`);
		this.update();
	}

	/**
	 * Stops the repositories watcher
	 */
	public stop(): void {
		clearInterval(this.timer);
		this.timer = undefined;
		logger.info("Watcher stopped.");
	}

	/**
	 * Restarts the repositories watcher
	 */
	public restart(): void {
		this.stop();
		this.start();
	}

	/**
	 * Updates the status of all Git repositories
	 *
	 * This method is responsible for updating the status of all Git repositories
	 * across all workspaces. It automatically discovers new repositories and disposes
	 * of removed ones.
	 */
	private async update(): Promise<void> {
		const detectedRepositories = await this.getAllRepositories();

		// Update the status of all known repositories
		for (const repository of detectedRepositories) {
			const current = this.statuses.get(repository.rootUri.fsPath);
			this.statuses.set(repository.rootUri.fsPath, {
				rootUri: repository.rootUri,
				uncommittedChangesCount: repository.state.workingTreeChanges.length + repository.state.indexChanges.length,
				uncommittedChangesSince:
					repository.state.workingTreeChanges.length + repository.state.indexChanges.length === 0
						? undefined
						: current?.uncommittedChangesSince ?? new Date(),
				unpushedCommitsCount: repository.state.HEAD?.ahead,
				unpushedCommitsSince:
					repository.state.HEAD?.ahead === 0 ? undefined : current?.unpushedCommitsSince ?? new Date(),
				lastUpdatedAt: new Date(),
			});
		}

		// Remove repositories that are no longer present
		for (const [rootUri, _] of this.statuses) {
			if (!detectedRepositories.find((repo) => repo.rootUri.fsPath === rootUri)) {
				this.statuses.delete(rootUri);
			}
		}

		// Notify listeners about the updated statuses
		this.emit("updated", Array.from(this.statuses.values()));
	}

	/**
	 * Retrieves all known repositories
	 *
	 * This method will retrieve all known repositories across all workspaces
	 * using the Git API provided by the built-in Git extension.
	 */
	private async getAllRepositories(): Promise<Repository[]> {
		// Loop over all workspace folders and get the repository for each one.
		// If a workspace folder is not a repository, it will be mapped to
		// `null`.
		const maybeRepositories = (workspace.workspaceFolders ?? []).map((folder) => {
			return this.options.api.getRepository(folder.uri);
		});

		// Not all workspace folders are necessarily repositories, so we filter
		// out the ones that are not.
		const repositories = maybeRepositories.filter((maybeRepository) => maybeRepository !== null) as Repository[];

		return repositories;
	}
}

export type RepositoriesWatcherOptions = {
	/**
	 * Instance of the Git API provided by the built-in Git extension
	 */
	api: API;

	/**
	 * Interval in milliseconds between each update of the repositories status
	 */
	interval: number;
};

export type RepositoryStatus = {
	/**
	 * Root URI of the repository beeing tracked
	 */
	rootUri: Uri;

	/**
	 * Number of uncommitted changes in the repository
	 */
	uncommittedChangesCount: number;

	/**
	 * The date and time when the last uncommitted changes where detected.
	 *
	 * If there are no uncommitted changes, `undefined` is returned.
	 */
	uncommittedChangesSince: Date | undefined;

	/**
	 * Number of unpushed commits in the repository
	 *
	 * If the repository does not have a HEAD commit, or if we have no
	 * informations about the remote, `undefined` is returned.
	 */
	unpushedCommitsCount: number | undefined;

	/**
	 * The date and time when the last unpushed commits where detected.
	 *
	 * If there are no unpushed commits, `undefined` is returned.
	 */
	unpushedCommitsSince: Date | undefined;

	/**
	 * The date and time when the status was last updated
	 */
	lastUpdatedAt: Date;
};
