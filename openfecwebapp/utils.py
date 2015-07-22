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


def date_ranges():
    """Build date ranges for current day, month, quarter, and year.
    """
    today = datetime.date.today()
    quarter = math.floor((today.month - 1) / 3)
    return {
        'today': (today, today),
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
