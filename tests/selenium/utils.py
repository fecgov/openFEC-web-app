import time


def wait_for_ajax(driver, timeout=10, interval=0.1):
    elapsed = 0
    while True:
        active = driver.execute_script('return $.active === 0')
        if active or elapsed > timeout:
            break
        time.sleep(interval)
        elapsed += interval


def wait_for_event(driver, name, label, timeout=10, interval=0.1):
    elapsed = 0
    driver.execute_script('window.{0} = false'.format(label))
    driver.execute_script('''
        $(document).on("{0}", function() {{
            window.{1} = true;
        }});
    '''.format(name, label))
    while True:
        active = driver.execute_script('return window.{0} === true'.format(label))
        if active or elapsed > timeout:
            break
        time.sleep(interval)
        elapsed += interval
    driver.execute_script('$(document).off("{0}")'.format(name))


def try_until(work, errors=(Exception, ), timeout=10, interval=0.1):
    elapsed = 0
    while True:
        try:
            return work()
        except errors:
            time.sleep(interval)
            elapsed += interval
        if elapsed > timeout:
            return
