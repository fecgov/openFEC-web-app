import pytest


def pytest_addoption(parser):
    parser.addoption('--selenium', action='store_true', help='Run Selenium tests')


def pytest_runtest_setup(item):
    if 'selenium' in item.keywords and not item.config.getoption('--selenium'):
        pytest.skip('Pass --selenium option to run')


@pytest.mark.tryfirst
def pytest_runtest_makereport(item, call, __multicall__):
    """Store pass/fail status on test class for use in teardown."""
    report = __multicall__.execute()
    if report.failed and item.cls:
        item.cls._fail = True
    return report
