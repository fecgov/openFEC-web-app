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
