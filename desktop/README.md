# Hologram Desktop App

Hologram powers pseudonymous social interaction and self-expression over video.

This Desktop App is a virtual camera that allows NFT owners to jump on any Desktop-based video application as their NFT avatars.

## Installation

Install dependencies:

```bash
yarn install
```

## Starting Development

Start the app in the `dev` environment:

1. In workspace root, start development for web workspace

```bash
cd ..
yarn dev-web
```

2. In desktop directory, start development mode

```bash
cd desktop
yarn start
```

## Packaging for Production

To package apps for testing locally:

```bash
yarn run package
```

## Publishing to Production

### Prerequisites

1. Get access to [Holocam](https://github.com/hologramxyz/holocam) repos

2. [Create github access token](https://docs.github.com/en/enterprise-server@3.4/authentication/keeping-your-account-and-data-secure/creating-a-personal-access-token)

### Publish to Github (enables auto-updating)

Publish production build to holocam github releases, which enables auto-update

```bash
export GH_TOKEN=<github_access_token>
yarn run publish
```

### Mac packaging / notarizing

1. Get access to Hologram's [Apple Developer account](https://developer.apple.com/) and [app-specific password](https://support.apple.com/en-us/HT204397)

2. Set up [code signing flow](https://www.electron.build/code-signing.html)

```bash
export CSC_KEY_PASSWORD=<csc-key-pass>
export APPLE_ID=gm@hologram.xyz
export APPLE_ID_PASS=<app-specific-password>
export USE_HARD_LINKS=false
export CI=true
```

3. Download [Packages](https://www.macupdate.com/app/mac/34613/packages) and ask Tong about onboarding to our current Packages build files

4. Sign built packages, one for x64 and one for m1 build

```bash
productsign --sign "Developer ID Installer: Rolling Inc. (9WN4P724M2)" --keychain ~/Library/Keychains/login.keychain <input-unsigned-pkg-path> <output-pkg-path>
```

5. Notarize packages, one for x64 and one for m1 build

```bash
xcrun altool --notarize-app --primary-bundle-id "xyz.hologram.holocam" --username "gm@hologram.xyz" --password <app-specific-password> --file <signed-pkg-path>
```

6. While notarizing, optionally check status of notarization

```bash
xcrun altool --notarization-info <notarization-id> -u "gm@hologram.xyz" -p <app-specific-pass>
```

### Windows packaging

In package.json:

1. Change build.publish.repo to "holocam-win"

In release/app/package.json:

1. Change name to "holocam-win"
2. Change author.url to "https://github.com/hologramxyz/holocam-win"

Get Github access token for holocam-win repo, then set environment vars:

```bash
export USE_HARD_LINKS=false
export CI=true
export GH_TOKEN=<github_access_token>
```

Run publish script:

```bash
yarn run publish
```
