from .base_test_class import BaseTest


class SingleCandidatePageTests(BaseTest):

    def setUp(self):
        self.url = self.base_url + '/candidate/H4MA09052'

    def testSingleCandidatePageLoads(self):
        self.driver.get(self.url)
        self.assertEqual(
            self.driver.find_element_by_tag_name('h1').text,
            'ALLIEGRO, MARK C')

    def testCommitteeLink(self):
        self.driver.get(self.url)
        self.assertEqual(
            self.elementExistsByXPath(
                '//a[contains(@href, "committees/")]'),
            True)
        if self.elementExistsByXPath(
                '//a[contains(@href, "committees/")]'):
            link = self.driver.find_element_by_xpath(
                '//a[contains(@href, "committees/")]')
            self.assertEqual(
                link.text,
                'COMMITTEE TO ELECT MARK ALLIEGRO')
