import locale
import datetime

from openfecwebapp import filters
from openfecwebapp.app import app, get_election_url


def test_currency_filter_not_none():
    locale.setlocale(locale.LC_ALL, '')
    assert filters.currency_filter(1.05) == '$1.05'


def test_currency_filter_none():
    assert filters.currency_filter(None) is None


def test_fmt_year_range_int():
    assert filters.fmt_year_range(1985) == '1984–1985'


def test_fmt_year_range_not_int():
    assert filters.fmt_year_range('1985') is None
    assert filters.fmt_year_range(None) is None


def test_fmt_chart_ticks_single_key():
    group = {
        'coverage_start_date': datetime.datetime(2015, 1, 1).isoformat(),
        'coverage_end_date': datetime.datetime(2015, 1, 1).isoformat(),
    }
    keys = 'coverage_start_date'
    assert filters.fmt_chart_ticks(group, keys) == '01/01/2015'


def test_fmt_chart_ticks_two_keys():
    group = {
        'coverage_start_date': datetime.datetime(2015, 1, 1).isoformat(),
        'coverage_end_date': datetime.datetime(2015, 2, 1).isoformat(),
    }
    keys = ('coverage_start_date', 'coverage_end_date')
    assert filters.fmt_chart_ticks(group, keys) == '01/01/2015 – 02/01/2015'


def test_fmt_chart_ticks_two_keys_repeated_value():
    group = {
        'coverage_start_date': datetime.datetime(2015, 1, 1).isoformat(),
        'coverage_end_date': datetime.datetime(2015, 1, 15).isoformat(),
    }
    keys = ('coverage_start_date', 'coverage_end_date')
    assert filters.fmt_chart_ticks(group, keys) == '01/01/2015 – 01/15/2015'


def test_fmt_state_full():
    value = 'ny'
    assert filters.fmt_state_full(value) == 'New York'


def test_election_url():
    with app.test_request_context():
        candidate = {'office_full': 'President', 'state': 'US', 'district': None}
        assert get_election_url(candidate, 2012) == '/elections/president/2012/'
        candidate = {'office_full': 'Senate', 'state': 'NJ', 'district': None}
        assert get_election_url(candidate, 2012) == '/elections/senate/NJ/2012/'
        candidate = {'office_full': 'Senate', 'state': 'NJ', 'district': '00'}
        assert get_election_url(candidate, 2012) == '/elections/senate/NJ/2012/'
        candidate = {'office_full': 'House', 'state': 'NJ', 'district': '02'}
        assert get_election_url(candidate, 2012) == '/elections/house/NJ/02/2012/'
