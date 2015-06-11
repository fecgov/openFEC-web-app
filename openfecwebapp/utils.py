import datetime


def current_cycle():
    year = datetime.datetime.now().year
    return year + year % 2
