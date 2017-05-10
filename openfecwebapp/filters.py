import json
import locale
import datetime

import jinja2
from dateutil.parser import parse as parse_date

from openfecwebapp import constants
from openfecwebapp.app import app


@jinja2.contextfunction
def get_context(c):
    return c


@app.template_filter('currency')
def currency_filter(num, grouping=True):
    if isinstance(num, (int, float)):
        return locale.currency(num, grouping=grouping)
    return None


def ensure_date(value):
    if isinstance(value, (datetime.date, datetime.datetime)):
        return value
    return parse_date(value)


@app.template_filter('date')
def date_filter(value, fmt='%m/%d/%Y'):
    if value is None:
        return None
    return ensure_date(value).strftime(fmt)


@app.template_filter('ao_document_date')
def ao_document_date(value):
    date = date_filter(value)
    return 'Not dated' if date == '01/01/1900' else date


@app.template_filter('json')
def json_filter(value):
    return json.dumps(value)


@app.template_filter('filesize')
def filesize_filter(value):
    units = ['B', 'KB', 'MB', 'GB']
    unit = 0
    while value > 1024 and unit < len(units):
        value = value / 1024
        unit += 1

    return '%d %s' % (value, units[unit])


@app.template_filter()
def fmt_year_range(year):
    if type(year) == int:
        return "{}–{}".format(year - 1, year)
    return None


@app.template_filter()
def fmt_state_full(value):
    return constants.states[value.upper()]


@app.template_filter()
def fmt_cycle_min_max(cycles):
    if len(cycles) > 1:
        return '{}–{}'.format(min(cycles), max(cycles))
    return cycles[0]


@app.template_filter()
def get_max(list):
    return max(list)


@app.template_filter()
def get_min(list):
    return min(list)
