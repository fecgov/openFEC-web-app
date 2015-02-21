from selenium import webdriver
import unittest

class BaseTest(unittest.TestCase):

    @classmethod
    def setUpClass(cls):
        cls.driver = webdriver.PhantomJS()
        cls.base_url = 'http://localhost:3000'

    @classmethod
    def tearDownClass(cls):
        cls.driver.quit()
