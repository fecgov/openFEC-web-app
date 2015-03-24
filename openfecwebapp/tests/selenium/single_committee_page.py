from .base_test_class import BaseTest


class SingleCommitteePageTests(BaseTest):

    def setUp(self):
        self.url = self.base_url + '/committees/C00550715'

    def testSingleCommitteePageLoads(self):
        self.driver.get(self.url)
        self.assertEqual(
            self.driver.find_element_by_tag_name('h1').text,
            'COMMITTEE TO ELECT MARK ALLIEGRO')

    def testCandidateLink(self):
        self.driver.get(self.url)
        self.assertEqual(
            self.elementExistsByXPath(
                '//a[contains(@href, "candidate/")]'),
            True)
        if self.elementExistsByXPath(
                '//a[contains(@href, "candidate/")]'):
            link = self.driver.find_element_by_xpath(
                '//a[contains(@href, "candidate/")]')
            self.assertEqual(
                link.text,
                'ALLIEGRO, MARK C')
