from .base_test_class import BaseTest


class SearchResultsTest(BaseTest):

    def setUp(self):
        self.url = self.base_url + '/?search=murphy'

    def getColumn(self, index, data):
        return [row.find_elements_by_tag_name('td')[index].text
                for row in data.find_elements_by_tag_name('tr')]

    def testSearchResultSorting(self):
        self.driver.get(self.url)
        tables = self.driver.find_elements_by_class_name('table--sortable')
        for table in tables:
            headers = (table.find_element_by_tag_name('thead')
                       .find_elements_by_tag_name('th'))
            data = table.find_element_by_tag_name('tbody')
            for i in range(len(headers)):
                headers[i].click()
                self.assertEqual(
                    sorted(self.getColumn(i, data), reverse=True),
                    self.getColumn(i, data))

