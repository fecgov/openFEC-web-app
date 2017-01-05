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

def _unique(values):
    ret = []
    for value in values:
        if value not in ret:
            ret.append(value)
    return ret

def _fmt_chart_tick(value):
    try:
        return parse_date(value).strftime('%m/%d/%Y')
    except (AttributeError, ValueError):
        return '?'

@app.template_filter('fmt_chart_ticks')
def fmt_chart_ticks(group, keys):
    if not group or not keys:
        return ''
    if isinstance(keys, (list, tuple)):
        values = [_fmt_chart_tick(group[key]) for key in keys]
        values = _unique(values)
        return ' – '.join(values)
    return _fmt_chart_tick(group[keys])

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
