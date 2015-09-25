import math
import calendar
import datetime
import threading

import cachetools
import cachecontrol


def current_cycle():
    year = datetime.datetime.now().year
    return year + year % 2


class LRUCache(cachecontrol.cache.BaseCache):
    """A thread-safe least recently updated cache adapted to work with
    Cache-Control.
    """
    def __init__(self, maxsize):
        self.lock = threading.Lock()
        self.data = cachetools.LRUCache(maxsize)

    def get(self, key):
        return self.data.get(key, None)

    def set(self, key, value):
        with self.lock:
            self.data[key] = value

    def delete(self, key):
        with self.lock:
            self.data.clear()


class ReverseProxied(object):
    """Wrap the application in this middleware and configure the
    front-end server to add these headers, to let you quietly bind
    this to a URL other than / and to an HTTP scheme that is
    different than what is used locally.

    From http://flask.pocoo.org/snippets/35/.

    In nginx:
    location /myprefix {
        proxy_pass http://192.168.0.1:5001;
        proxy_set_header Host $host;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Scheme $scheme;
        proxy_set_header X-Script-Name /myprefix;
    }

    :param app: the WSGI application
    """
    def __init__(self, app):
        self.app = app

    def __call__(self, environ, start_response):
        script_name = environ.get('HTTP_X_SCRIPT_NAME', '')
        if script_name:
            environ['SCRIPT_NAME'] = script_name
            path_info = environ['PATH_INFO']
            if path_info.startswith(script_name):
                environ['PATH_INFO'] = path_info[len(script_name):]

        scheme = environ.get('HTTP_X_SCHEME', '')
        if scheme:
            environ['wsgi.url_scheme'] = scheme
        return self.app(environ, start_response)


def date_ranges():
    """Build date ranges for current day, month, quarter, and year.
    """
    today = datetime.date.today()
    quarter = math.floor((today.month - 1) / 3)
    return {
        'month': (
            today.replace(day=1),
            today.replace(day=calendar.monthrange(today.year, today.month)[1]),
        ),
        'quarter': (
            today.replace(day=1, month=quarter * 3 + 1),
            today.replace(
                day=calendar.monthrange(today.year, quarter * 3 + 3)[1],
                month=quarter * 3 + 3,
            ),
        ),
        'year': (
            today.replace(day=1, month=1),
            today.replace(
                day=calendar.monthrange(today.year, 12)[1],
                month=12,
            ),
        )
    }
