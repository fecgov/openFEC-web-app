# Release checklist

## Documentation
- [ ] Write simplified release notes for FEC with instructions for review
- [ ] Update documentation in any relevant repo
- [ ] Generate changelog for API [instructions](https://github.com/18F/openFEC/blob/develop/README.md)

### Communciations
- [ ] Are there communications around this release from 18F or FEC?

## Reviews
- [ ] 18F QA review on staging
- [ ] FEC QA review on staging
- [ ] File accessibility review request [here](https://github.com/18F/Accessibility_Reviews/issues/new)

## Deployment
- [ ] Update fec-style and publish to npm as necessary
- [ ] Run update scripts in standalone app if necessary
  - [ ] Allocate additional resources for the database to help with the processing before starting if need be.
- Make sure local copies of `master`, `develop`, and `release/public-beta-20160413` branches are up-to-date.
- Checkout the `release/public-beta-2016-0413` branch.
- Run `git flow release finish public-beta-20160413`
- Run `git push`
- Run `git push --tags`
- Confirm that the new `web` app is up and running successfully.
- Delete the `web-a` and `web-b` apps.
- Test the site.

## After release
- [ ] Review changes on production
- [ ] Alert #fec-partners of the successful release
