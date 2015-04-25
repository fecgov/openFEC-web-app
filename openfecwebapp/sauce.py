import json

import furl
import requests


class SauceError(Exception):
    pass


class SauceClient(object):

    def __init__(self, username, access_key):
        self.username = username
        self.access_key = access_key

    @property
    def _base_url(self):
        url = furl.furl('https://saucelabs.com/rest/v1')
        url.path.add(self.username)
        return url

    @property
    def _headers(self):
        return {
            'Content-Type': 'application/json',
        }

    def _build_url(self, *segments, **query):
        url = self._base_url
        url.path.add(segments)
        url.args.update(query)
        return url.url

    def _make_request(self, method, url, data, expects=(200, ), **kwargs):
        resp = requests.request(
            method,
            url,
            auth=(self.username, self.access_key),
            headers=self._headers,
            data=json.dumps(data),
            **kwargs
        )
        if resp.status_code not in expects:
            raise SauceError
        return resp.json()

    def update_job(self, job_id, **kwargs):
        return self._make_request(
            'PUT',
            self._build_url('jobs', job_id),
            kwargs,
        )
