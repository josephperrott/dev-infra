# Run prettier over the repo
yarn pretty-quick;

# Build lock-closed github action bundle.
yarn --cwd github-actions/lock-closed build;

# Build is-googler github action bundle.
yarn --cwd github-actions/is-googler build;