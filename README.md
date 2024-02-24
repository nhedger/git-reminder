<img src="./resources/icons/git-reminder.png" width="64">

# Git Reminder

[![][vscode-marketplace-shield]][vscode-marketplace-url]
[![][open-vsx-shield]][open-vsx-url]

**Git Reminder** is a Visual Studio Code extension that reminds you to commit and push your changes at regular intervals. It's a simple way to avoid losing your work and keep your repository up to date.

- ⏰ Customizable interval
- 🔔 Simple, or modal notifications
- ⭐ Supports multiple workspaces and repositories

## Installation

**Git Reminder** is distributed on the Visual Studio Marketplace and the Open VSX Registry. You can install it from the extensions view in Visual Studio Code, or VSCodium.

- [Visual Studio Marketplace][vscode-marketplace-url]
- [Open VSX Registry][open-vsx-url]

## How it works

**Git Reminder** runs in the background and monitors the git repositories of your workspace.

Every two minutes, it checks if there any uncommitted changes or unpushed commits that have been
sitting around for more than 30 minutes. If it finds any, it will notify you.

You can customize the interval, timespan, and notification type in the extension settings.

## Motivation

I created **Git Reminder** after losing a whole day's work because I accidentaly ran the `git reset --hard` command that was in my history. That could have easily been avoided had I committed and pushed my changes. I wanted a simple way to remind myself to commit and push my changes at regular intervals.

## License

**Git Reminder** is open-sourced software licensed under the [MIT License](LICENSE.md).

[vscode-marketplace-shield]: https://img.shields.io/visual-studio-marketplace/i/nhedger.git-reminder?color=374151&label=Visual%20Studio%20Marketplace&labelColor=000&logo=visual-studio-code&logoColor=0098FF
[vscode-marketplace-url]: https://marketplace.visualstudio.com/items?itemName=nhedger.git-reminder
[open-vsx-shield]: https://img.shields.io/open-vsx/dt/nhedger/git-reminder?color=374151&label=Open%20VSX%20Registry&labelColor=000&logo=data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0idXRmLTgiPz4KPHN2ZyB2aWV3Qm94PSI0LjYgNSA5Ni4yIDEyMi43IiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPgogIDxwYXRoIGQ9Ik0zMCA0NC4yTDUyLjYgNUg3LjN6TTQuNiA4OC41aDQ1LjNMMjcuMiA0OS40em01MSAwbDIyLjYgMzkuMiAyMi42LTM5LjJ6IiBmaWxsPSIjYzE2MGVmIi8+CiAgPHBhdGggZD0iTTUyLjYgNUwzMCA0NC4yaDQ1LjJ6TTI3LjIgNDkuNGwyMi43IDM5LjEgMjIuNi0zOS4xem01MSAwTDU1LjYgODguNWg0NS4yeiIgZmlsbD0iI2E2MGVlNSIvPgo8L3N2Zz4=
[open-vsx-url]: https://open-vsx.org/extension/nhedger/git-reminder

