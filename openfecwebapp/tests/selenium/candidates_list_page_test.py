from .base_test_class import BaseTest


class CandidatesPageTests(BaseTest):

    def setUp(self):
        self.url = self.base_url + '/candidates'

    def testCandidatesPageLoads(self):
        self.driver.get(self.url)
        self.assertEqual(
            self.driver.find_element_by_tag_name('h1').text,
            'Browse candidate records')
