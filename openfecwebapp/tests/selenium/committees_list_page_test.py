from .base_test_class import SearchPageTestCase


class CommitteesPageTests(SearchPageTestCase):

    def setUp(self):
        self.url = self.base_url + '/committees'

    def testCommitteesPageLoads(self):
        self.driver.get(self.url)
        self.assertEqual(
            self.driver.find_element_by_tag_name('h1').text,
            'Browse committee records')

    def testCommitteesFilterSideBar(self):
        self.driver.get(self.url)
        filters = self.driver.find_element_by_id('filters')
        self.assertIn('side-panel--open', filters.get_attribute('class'))

    def testCommitteeNameFilter(self):
        self.driver.get(self.url)
        name_div = self.getFilterDivByName('name')
        name_div.find_element_by_tag_name('input').send_keys('pork')
        self.driver.find_element_by_id('category-filters').submit()
        self.assertEqual(
            len(self.driver.find_element_by_tag_name('tbody')
                .find_elements_by_tag_name('tr')),
            8)
        self.assertIn(
            'PORK',
            self.driver.find_element_by_class_name('single-link').text)

    def testCommitteePartyFilter(self):
        self.checkFilter(
            'party', 'republican party', 5, 3, 'Republican Party')

    def testCommitteeStateFilter(self):
        self.checkFilter('state', 'oregon', 4, 2, 'OR')

    def testCommitteeTypeFilter(self):
        self.checkFilter('committee_type', 'pr', 9, 5, 'Presidential')

    def testCommitteeDesignationFilter(self):
        self.checkFilter(
            'designation', 'a', 1, 6, 'Authorized by a candidate')

    def testCommitteeOrgTypeFilter(self):
        self.checkFilter('organization_type', 'corp', 3, 4, 'Corporation')
