from .base_test_class import BaseTest
from selenium.webdriver.common.keys import Keys
import time


class CandidatesPageTests(BaseTest):

    def setUp(self):
        self.url = self.base_url + '/candidates'

    def getFilterDivByName(self, name):
        if not self.elementExistsByClassName('side--open'):
            self.driver.find_element_by_class_name('side-toggle').click()
        return self.driver.find_element_by_xpath('//*[@for="' + name + '"]/..')

    def testCandidatesPageLoads(self):
        self.driver.get(self.url)
        self.assertEqual(
            self.driver.find_element_by_tag_name('h1').text,
            'Browse candidate records')

    def testCandidatesFiltering(self):
        self.driver.get(self.url)
        self.driver.find_element_by_class_name('side-toggle').click()
        main = self.getMain()
        self.assertEqual(main.get_attribute('class'), 'side--open')
        time.sleep(.04)
        name_div = self.getFilterDivByName('name')
        name_div.find_element_by_tag_name('input').send_keys('Alliegro')
        name_div.find_element_by_tag_name('input').send_keys(Keys.ENTER)
        self.assertEqual(
            len(self.driver.find_element_by_tag_name('tbody')
                .find_elements_by_tag_name('tr')),
            1)





#In [60]: driver.find_element_by_class_name('side-toggle').click()

#In [61]: driver.find_element_by_xpath('//*[@id="category-filters"]/div[3]/div/a').click()

#In [62]: driver.find_element_by_class_name('chosen-with-drop').find_element_by_tag_name('input').send_keys('demo')
