import locale
import datetime

import __init__ as app


def test_currency_filter_not_none():
    locale.setlocale(locale.LC_ALL, '')
    assert app.currency_filter(1.05) == '$1.05'


def test_currency_filter_none():
    assert app.currency_filter(None) is None


def test_date_filter_iso():
    date = datetime.datetime.now()
    assert app.date_filter_sm(date.isoformat()) == date.strftime('%m/%y')
    assert app.date_filter_md(date.isoformat()) == date.strftime('%b %Y')


def test_date_filter_empty():
    assert app.date_filter_sm('') == ''
    assert app.date_filter_sm(None) == ''
    assert app.date_filter_md(None) == ''


def test_last_n_characters():
    value = 123456789
    assert app.last_n_characters(value) == '789'
    assert app.last_n_characters(5) == '005'


def test_fmt_year_range_int():
    assert app.fmt_year_range(1985) == '1984 - 1985'


def test_fmt_year_range_not_int():
    assert app.fmt_year_range('1985') is None
    assert app.fmt_year_range(None) is None


def test_restrict_cycles():
    year = datetime.datetime.now().year
    cycle = year + year % 2
    cycles = [cycle - 2, cycle, cycle + 2]
    assert app.restrict_cycles(cycles) == [cycle - 2, cycle]


def test_fmt_chart_ticks_single_key():
    group = {
        'coverage_start_date': datetime.datetime(2015, 1, 1).isoformat(),
        'coverage_end_date': datetime.datetime(2015, 1, 1).isoformat(),
    }
    keys = 'coverage_start_date'
    assert app.fmt_chart_ticks(group, keys) == '01/01/2015'


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
