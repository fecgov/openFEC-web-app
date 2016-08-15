from faker import Faker

faker = Faker()


def factory(f):
    """Decorator to wrap your data function as a test factory."""
    def decorator(**data):
        d = f()
        assert type(d) is dict
        d.update(data)
        return d

    return decorator

@factory
def advisory_opinion():
    return {
        'no': '2014-%00d' % faker.random_int(max=100),
        'date': faker.date_time(),
        'name': faker.name(),
        'summary': faker.sentence(),
        'description': faker.sentence(4),
        'url': faker.url(),
        'category': faker.random_element((
            'AO Request, Supplemental Material, and Extensions of Time',
            'Final Opinion',
            'Draft Documents',
            'Votes',
        )),
    }
