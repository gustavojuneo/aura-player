# Testing AURA Player on an LG webOS TV

This guide describes how to package, install, launch, update, and remove the
AURA Player application on a physical LG webOS TV for development testing.

## Requirements

- An LG webOS TV connected to the network.
- A notebook connected to the same local network as the TV.
- An LG Developer account.
- Node.js 20 or newer.
- pnpm 9.7.1 or newer.
- Project dependencies installed with `pnpm install`.

The CLI is installed locally as a development dependency. Run its commands
through pnpm so the workspace-pinned version is used:

```bash
pnpm exec ares-package --version
pnpm exec ares-install --version
pnpm exec ares-setup-device --version
```

The official LG CLI documentation is available at:

<https://webostv.developer.lge.com/develop/tools/cli-dev-guide>

## Enable Developer Mode on the TV

1. Open the LG Content Store on the TV.
2. Search for **Developer Mode** and install the official application.
3. Open Developer Mode and sign in with the LG Developer account.
4. Enable **Dev Mode Status**. The TV will restart.
5. Open Developer Mode again after the restart.
6. Note the TV IP address shown by the application.
7. Open **Key Server** in the Developer Mode application when configuring the
   notebook connection.

Developer Mode is intended for testing and has a limited session. It may be
disabled after the session expires or after repeated restarts without a network
connection.

Official LG instructions:

<https://webostv.developer.lge.com/develop/getting-started/developer-mode-app>

## Build the project

From the repository root:

```bash
pnpm install
pnpm webos:package
```

The command builds the TV application and packages it with `ares-package`.
The webOS build uses the published backend at
`https://aura-api-ia1i.onrender.com`, configured by the TV application itself.
The packaged application enables the webOS cross-domain capability so it can
reach the API and user-configured content providers from its local application
origin.
Provider thumbnails and streams retain their original HTTP or HTTPS protocol;
the webOS build plays provider streams directly instead of routing them through
the API media proxy.
The generated package is written to:

```text
apps/web-tv/release/
```

The generated file normally has a name similar to:

```text
com.aura.player_1.0.0_all.ipk
```

## Register the TV with the CLI

Run the interactive device setup:

```bash
pnpm exec ares-setup-device
```

Add a device with these values:

| Field | Value |
| --- | --- |
| Device name | `tv` |
| Device IP address | The IP shown by Developer Mode |
| Device port | `9922` |
| SSH user | `prisoner` |
| Authentication | SSH key |

The CLI may request a passphrase or private key. Use the key setup flow from
the Developer Mode application's **Key Server** section. The exact key setup
can also be performed through the webOS VS Code extension.

List configured devices:

```bash
pnpm exec ares-setup-device --list
```

The device should appear with the name `tv` and an SSH connection.

## Install the application

Replace the package filename below with the actual file in
`apps/web-tv/release/`:

```bash
pnpm exec ares-install --device tv apps/web-tv/release/com.aura.player_1.0.0_all.ipk
```

Verify that the application is installed:

```bash
pnpm exec ares-install --device tv --list
```

The application ID is:

```text
com.aura.player
```

## Launch the application

Launch from the notebook:

```bash
pnpm exec ares-launch --device tv com.aura.player
```

The application can also be opened from the TV launcher after installation.

## Update an existing installation

Build a new package and install it again:

```bash
pnpm webos:package
pnpm exec ares-install --device tv apps/web-tv/release/com.aura.player_1.0.0_all.ipk
pnpm exec ares-launch --device tv com.aura.player
```

For a production release, update the version in
`apps/web-tv/public/appinfo.json` before packaging.

## Remove the application

```bash
pnpm exec ares-install --device tv --remove com.aura.player
```

## Troubleshooting

### `ares-package: command not found`

The webOS CLI is not installed or is not in the notebook `PATH`. Install the
CLI and restart the terminal before running `pnpm webos:package` again.

### The TV is not found

Confirm that the TV and notebook are on the same network, Developer Mode is
enabled, the TV IP is correct, and port `9922` is reachable. Reopen Developer
Mode and refresh the key server if necessary.

### Installation fails after Developer Mode expires

Open Developer Mode on the TV, sign in again, enable **Dev Mode Status**, and
repeat the device key setup on the notebook.

### The application opens with a blank screen

Check the package build output and inspect the application with the webOS
debugging tools. Also verify that the TV model meets the webOS 5 compatibility
baseline and that the API URL configured for the web application is reachable
from the TV.

### Adding a source reports a network error

Rebuild and reinstall the package after confirming that `allowCrossDomain` is
enabled in `apps/web-tv/public/appinfo.json`. Packaged webOS applications run from
a local application origin and need this capability to reach the Render API
and external content providers.

### Streaming does not start

Verify that the provider URL is reachable from the TV and that the provider or
CDN accepts requests from the application. Test the same source on the TV's
network, not only from the notebook.

## Application data behavior during testing

- The selected source, source configuration, and credentials are persisted so
  they can be reused after reopening the application.
- The catalog is kept in application memory and is not stored as a catalog
  database on the TV.
- The catalog is reloaded from the selected source when the application starts
  again after being terminated.
- Switching sources releases the previous catalog from memory.
