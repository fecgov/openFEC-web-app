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
    assert app.last_n_characters(value) == 789


def test_fmt_year_range_int():
    assert app.fmt_year_range(1985) == '1984 - 1985'


def test_fmt_year_range_not_int():
    assert app.fmt_year_range('1985') is None
    assert app.fmt_year_range(None) is None


def test_fmt_cycles_range_one_cycle():
    assert app.fmt_cycles_range([2012]) == '2012'


def test_fmt_cycles_range_multiple_cycles():
    assert app.fmt_cycles_range([1998, 1996, 2002]) == '1996 - 2002'


def test_fmt_cycles_none():
    assert app.fmt_cycles_range(None) is None
