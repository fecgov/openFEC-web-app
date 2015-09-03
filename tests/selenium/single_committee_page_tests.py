from .base_test_class import BaseTest

from tests.selenium import utils


class SingleCommitteePageTests(BaseTest):

    def testSingleCommitteePageLoads(self):
        self.driver.get(self.base_url + '/committees')
        utils.wait_for_event(self.driver, 'draw.dt', 'draw')
        self.driver.find_element_by_css_selector('a[data-category="committee"]').click()
