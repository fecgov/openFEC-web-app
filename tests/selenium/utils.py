import time


def wait_for_ajax(driver, timeout=10, interval=0.1):
    elapsed = 0
    while True:
        active = driver.execute_script('return $.active === 0')
        if active or elapsed > timeout:
            break
        time.sleep(interval)
        elapsed += interval


def try_until(work, errors=(Exception, ), timeout=10, interval=0.1):
    elapsed = 0
    while True:
        try:
            work()
            return
        except errors:
            time.sleep(interval)
            elapsed += interval
        if elapsed > timeout:
            return
