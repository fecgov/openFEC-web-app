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


def test_date_filter_empty():
    assert app.date_filter_sm('') == ''
    assert app.date_filter_sm(None) == ''


def test_fmt_year_range_int():
    assert app.fmt_year_range(1985) == '1984 - 1985'


def test_fmt_year_range_not_int():
    assert app.fmt_year_range('1985') is None
    assert app.fmt_year_range(None) is None
