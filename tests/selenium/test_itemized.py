from dateutil.parser import parse as parse_date
from selenium.common.exceptions import StaleElementReferenceException

from tests.selenium import utils
from tests.selenium.base_test_class import SearchPageTestCase


def parse_amount(value):
    cleaned = value.lstrip('$').replace(',', '')
    return float(cleaned)


def check_sort(driver, index, parser, reverse=False):
    table = driver.find_element_by_css_selector('table#results')
    get_values = lambda: [
        parser(row.find_elements_by_tag_name('td')[index].text)
        for row in table.find_elements_by_css_selector('tr[role="row"]')[1:]
    ]
    values = utils.try_until(get_values, errors=(StaleElementReferenceException, ))
    assert values == sorted(values, reverse=reverse)


def toggle_sort(driver, index):
    table = driver.find_element_by_css_selector('table#results')
    column = table.find_elements_by_tag_name('th')[index]
    utils.try_until(lambda: column.click())
    utils.wait_for_event(driver, 'draw.dt', 'draw', timeout=0.5)


class TestReceipts(SearchPageTestCase):

    def setUp(self):
        self.url = self.base_url + '/receipts'

    def test_sort(self):
        self.driver.get(self.url)

        # Sort on date
        check_sort(self.driver, 5, parse_date, reverse=True)
        toggle_sort(self.driver, 5)
        check_sort(self.driver, 5, parse_date, reverse=False)

        # Sort on amount
        toggle_sort(self.driver, 4)
        check_sort(self.driver, 4, parse_amount, reverse=True)
        toggle_sort(self.driver, 4)
        check_sort(self.driver, 4, parse_amount, reverse=False)


class TestDisbursements(SearchPageTestCase):

    def setUp(self):
        self.url = self.base_url + '/disbursements'

    def test_sort(self):
        self.driver.get(self.url)

        # Sort on date
        check_sort(self.driver, 3, parse_date, reverse=True)
        toggle_sort(self.driver, 3)
        check_sort(self.driver, 3, parse_date, reverse=False)

        # Sort on amount
        toggle_sort(self.driver, 2)
        check_sort(self.driver, 2, parse_amount, reverse=True)
        toggle_sort(self.driver, 2)
        check_sort(self.driver, 2, parse_amount, reverse=False)
