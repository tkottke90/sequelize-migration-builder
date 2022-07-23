# Release Process

The released module is stored in Github Packages.  To release you will need to start by logging into github packages using a _Github Personal Access Token_:

```bash
npm login --scope=@tkottke90 --registry=https://npm.pkg.github.com
```

Upon running this command you will be asked for:

1. Your Github username
2. Your password.  You will provide your Access Token here
3. Your email

Once you have logged in, you can run the release by calling the release command associated with your new version:

```bash
# Patch Version
npm run release:patch

# Minor Version
npm run release:minor

# Major Version
npm run release:major
```