import locale
import datetime

import __init__ as app


def test_currency_filter_not_none():
    locale.setlocale(locale.LC_ALL, '')
    assert app.currency_filter(1.05) == '$1.05'


def test_currency_filter_none():
    assert app.currency_filter(None) is None


def test_fmt_year_range_int():
    assert app.fmt_year_range(1985) == '1984–1985'


def test_fmt_year_range_not_int():
    assert app.fmt_year_range('1985') is None
    assert app.fmt_year_range(None) is None


def test_fmt_chart_ticks_single_key():
    group = {
        'coverage_start_date': datetime.datetime(2015, 1, 1).isoformat(),
        'coverage_end_date': datetime.datetime(2015, 1, 1).isoformat(),
    }
    keys = 'coverage_start_date'
    assert app.fmt_chart_ticks(group, keys) == '01/01/15'


def test_fmt_chart_ticks_two_keys():
    group = {
        'coverage_start_date': datetime.datetime(2015, 1, 1).isoformat(),
        'coverage_end_date': datetime.datetime(2015, 2, 1).isoformat(),
    }
    keys = ('coverage_start_date', 'coverage_end_date')
    assert app.fmt_chart_ticks(group, keys) == '01/01/15 – 02/01/15'


def test_fmt_chart_ticks_two_keys_repeated_value():
    group = {
        'coverage_start_date': datetime.datetime(2015, 1, 1).isoformat(),
        'coverage_end_date': datetime.datetime(2015, 1, 15).isoformat(),
    }
    keys = ('coverage_start_date', 'coverage_end_date')
    assert app.fmt_chart_ticks(group, keys) == '01/01/15 – 01/15/15'


def test_fmt_state_full():
    value = 'ny'
    assert app.fmt_state_full(value) == 'New York'


def test_election_url():
    with app.app.test_request_context():
        candidate = {'office_full': 'President', 'state': 'US', 'district': None}
        assert app.get_election_url(candidate, 2012) == '/elections/president/2012/'
        candidate = {'office_full': 'Senate', 'state': 'NJ', 'district': None}
        assert app.get_election_url(candidate, 2012) == '/elections/senate/NJ/2012/'
        candidate = {'office_full': 'Senate', 'state': 'NJ', 'district': '00'}
        assert app.get_election_url(candidate, 2012) == '/elections/senate/NJ/2012/'
        candidate = {'office_full': 'House', 'state': 'NJ', 'district': '02'}
        assert app.get_election_url(candidate, 2012) == '/elections/house/NJ/02/2012/'
