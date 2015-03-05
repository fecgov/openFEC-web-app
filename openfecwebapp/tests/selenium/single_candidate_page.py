from .base_test_class import BaseTest


class SingleCandidatePageTests(BaseTest):

    def setUp(self):
        self.url = self.base_url + '/candidates/H4MA09052'

    def testSingleCandidatePageLoads(self):
        self.driver.get(self.url)
        self.assertEqual(
            self.driver.find_element_by_tag_name('h1').text,
            'ALLIEGRO, MARK C')
