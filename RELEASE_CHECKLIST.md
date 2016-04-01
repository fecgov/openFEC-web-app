# Release checklist

## Documentation
- [] Write simplified release notes for FEC with instructions for review
- [] Update documentation in any relevant repo

### Communciations
- [] Are there communications around this release from 18F or FEC?

## Reviews
- [] 18F QA review on staging
- [] FEC QA review on staging
- [] File accessibility review request [here](https://github.com/18F/Accessibility_Reviews/issues/new)

## Deployment
- [] Update fec-style and publish to npm as necessary
- [] Run update scripts in standalone app if necessary
  - [] Allocate additional resources for the database to help with the processing before starting if need be.
- [] Deploy API
- [] Deploy web app
- [] Deploy CMS

## After release
- [] Review changes on production
- [] Alert #fec-partners of the successful release
