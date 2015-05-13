import git
from invoke import run
from invoke import task


@task
def add_hooks():
    run('ln -s ../../bin/post-merge .git/hooks/post-merge')
    run('ln -s ../../bin/post-checkout .git/hooks/post-checkout')


@task
def remove_hooks():
    run('rm .git/hooks/post-merge')
    run('rm .git/hooks/post-checkout')


def _detect_prod(repo, branch):
    """Deploy to production if master is checked out and tagged."""
    if branch != 'master':
        return False
    try:
        # Equivalent to `git describe --tags --exact-match`
        repo.git().describe('--tags', '--exact-match')
        return True
    except git.exc.GitCommandError:
        return False


def _resolve_rule(repo, branch):
    """Get space associated with first matching rule."""
    for space, rule in DEPLOY_RULES:
        if rule(repo, branch):
            return space
    return None


def _detect_space(branch=None, yes=False):
    """Detect space from active git branch.

    :param str branch: Optional branch name override
    :param bool yes: Skip confirmation
    :returns: Space name if space is detected and confirmed, else `None`
    """
    repo = git.Repo('.')
    # Fail gracefully if `branch` is not provided and repo is in detached
    # `HEAD` mode
    try:
        branch = branch or repo.active_branch.name
    except TypeError:
        return None
    space = _resolve_rule(repo, branch)
    if space is None:
        print(
            'No space detected from repo {repo}; '
            'skipping deploy'.format(**locals())
        )
        return None
    print('Detected space {space} from repo {repo}'.format(**locals()))
    if not yes:
        run = input(
            'Deploy to space {space} (enter "yes" to deploy)? > '.format(**locals())
        )
        if run.lower() not in ['y', 'yes']:
            return None
    return space


DEPLOY_RULES = (
    ('prod', _detect_prod),
    ('stage', lambda _, branch: branch == 'master'),
    ('dev', lambda _, branch: branch == 'develop'),
)


@task
def deploy(space=None, branch=None, yes=False):
    """Deploy app to Cloud Foundry. Log in using credentials stored in
    `FEC_CF_USERNAME` and `FEC_CF_PASSWORD`; push to either `space` or the space
    detected from the name and tags of the current branch. Note: Must pass `space`
    or `branch` if repo is in detached HEAD mode, e.g. when running on Travis.
    """
    # Detect space
    space = space or _detect_space(branch, yes)
    if space is None:
        return

    # Select API
    api = 'cf api https://api.18f.gov'
    run(api, echo=True)

    # Log in
    args = (
        ('--u', '$FEC_CF_USERNAME'),
        ('--p', '$FEC_CF_PASSWORD'),
        ('--o', 'fec'),
        ('--s', space),
    )
    login = 'cf login {0}'.format(' '.join(' '.join(arg) for arg in args))
    run(login, echo=True)

    # Push
    push = 'cf push -f manifest_{0}.yml'.format(space)
    run(push, echo=True)
