from .base_test_class import BaseTest


class SingleCandidatePageTests(BaseTest):

    def setUp(self):
        self.url = self.base_url + '/committees/C00315176'

    def testSingleCandidatePageLoads(self):
        self.driver.get(self.url)
        self.assertEqual(
            self.driver.find_element_by_tag_name('h1').text,
            'FEINSTEIN FOR SENATE')
