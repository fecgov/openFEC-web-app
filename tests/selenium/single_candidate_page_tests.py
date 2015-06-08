from .base_test_class import BaseTest


class SingleCandidatePageTests(BaseTest):

    def setUp(self):
        self.url = self.base_url + '/candidate/P80003338'

    def testSingleCandidatePageLoads(self):
        self.driver.get(self.url)
        self.assertEqual(
            self.driver.find_element_by_tag_name('h1').text,
            'OBAMA, BARACK')

    def testCommitteeLink(self):
        self.driver.get(self.url)
        self.assertTrue(self.elementExistsByXPath('//a[contains(@href, "committee/")]'))
        link = self.driver.find_element_by_xpath('//a[contains(@href, "committees/")]')
        self.assertEqual(link.text, 'OBAMA FOR AMERICA')

    def testElectionCycleChooser(self):
        self.driver.get(self.url)
        self.assertEqual(self.driver.find_element_by_css_selector('select[name=election_cycle] .chosen-container .chosen-single span').text, '2011 - 2012')
        # election cycle chooser drop down arrow
        self.driver.find_element_by_xpath('//*[@id="main"]/div/header/div/div[1]/div[2]/div/a/div').click()
        self.assertEqual(
            self.driver.find_element_by_xpath('//*[@id="main"]/div/header/div/div[1]/div[2]/div/div/ul/li[2]'.text, '2007 - 2008'))
