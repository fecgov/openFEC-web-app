from .base_test_class import BaseTest


class CommitteesPageTests(BaseTest):

    def setUp(self):
        self.url = self.base_url + '/committees'

    def testCommitteesPageLoads(self):
        self.driver.get(self.url)
        self.assertEqual(
            self.driver.find_element_by_tag_name('h1').text,
            'Browse committee records')
