# Stable Releases

## Get latest from remote

```
1. git checkout master
2. git fetch --all

**CAUTION WITH git reset --hard MAKE SURE ALL LOCAL CHANGES ARE STASHED OR COMMITTED**

3. git reset --hard origin/master
```

## Delete existing release tag from local and remote

```bash
4. git tag --delete release
5. git push --delete origin refs/tags/release
```

## Tag HEAD of master and push to remote

```bash
6. git tag release
7. git push origin refs/tags/release
```

# Unstable Releases

An unstable release is triggered on every commit to master, where the `/.github/workflows/push-master.yaml` is run.

The releases have the following version syntax
`<current package version + patch version>-unstable.<current git commit reference>`

**Note** The `/.github/workflows/push-master.yaml` will skip if the commit message includes `[skip ci]`

**Note** To skip the automatic release of a new unstable version append `[skip ci]` to the end of the commit message
that is merged into master.
