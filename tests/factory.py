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

def ao_no():
    return '2014-%00d' % faker.random_int(max=100)


@factory
def advisory_opinion():
    return {
        'no': ao_no(),
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
        'citations': [{'no': '1993-01', 'name': 'RNC'}, {'no': '1998-01', 'name': 'DNC'}],
        'cited_by': [{'no': '2000-03', 'name': 'Church'}, {'no': '2010', 'name': 'New City'}]
    }

@factory
def statute():
    return {
        "no": "%s" % faker.random_int(max=100),
        "section": "%s" % faker.random_int(max=100000),
        "name": faker.sentence(),
        "highlights": [
            faker.sentence(),
            faker.sentence(),
            faker.sentence(),
        ],
    }

@factory
def statutes_search_results():
    return {
        "total_statutes": 10,
        "statutes": [
            statute(),
            statute(),
            statute(),
        ]
    }

@factory
def regulations_search_results():
    return {
        "total_regulations": 17,
        "regulations": [
            {
                "doc_id": "2_6",
                "highlights": [
                    " (a) The Commission Secretary shall maintain a complete transcript or <em>electronic</em> recording adequate",
                    " observation. An <em>electronic</em> recording of a meeting shall be coded, or other records shall be kept in a manner",
                    " <em>electronic</em> recording or transcript and which if any, items of information withheld under 11 CFR 2.5",
                    " transcripts or <em>electronic</em> recordings not made available immediately pursuant to 11 CFR 2.6(b)(1), and portions",
                    " <em>electronic</em> recording of each meeting, or portion of a meeting, closed to the public, shall be"
                ],
                "name": "Transcripts and recordings.",
                "no": "2.6",
                "url": "/regulations/2-6/2016-annual-2#2-6"
            },
            {
                "doc_id": "104_18",
                "highlights": [
                    " Commission, as provided in 11 CFR Parts 105 and 107, must file reports in an <em>electronic</em> format that meets",
                    " paragraph (a) of this section, may choose to file its reports in an <em>electronic</em> format that meets",
                    " an <em>electronic</em> format all reports covering financial activity for that calendar year, unless the",
                    " conform to the technical specifications described in the Federal Election Commission's <em>Electronic</em>",
                    " Commission shall be organized in the order specified by the <em>Electronic</em> Filing Specifications",
                    "<em>Electronic</em> filing of reports (52 U.S.C. 30102(d) and 30104(a)(11))."
                ],
                "name": "Electronic filing of reports (52 U.S.C. 30102(d) and 30104(a)(11)).",
                "no": "104.18",
                "url": "/regulations/104-18/2016-annual-104#104-18"
            },
            {
                "doc_id": "2_3",
                "highlights": [
                    " meetings may use small <em>electronic</em> sound recorders to record the meeting, but the use of other",
                    " <em>electronic</em> recording equipment and cameras requires advance notice to and coordination with the Commission's Press Officer."
                ],
                "name": "General rules.",
                "no": "2.3",
                "url": "/regulations/2-3/2016-annual-2#2-3"
            }
        ],
    }


@factory
def advisory_opinions_search_results():
    return {
        "total_advisory_opinions": 542,
        "advisory_opinions": {
            "1999-03": [
                {
                    "category": "AO Request, Supplemental Material, and Extensions of Time",
                    "date": "1999-02-09T00:00:00",
                    "description": "Request by Microsoft Corporate Political Action Committee",
                    "doc_id": 65492,
                    "highlights": [
                        ". Noble, Esq. \n\nFebruary 9,1999 \n\nPage 2 \n\nauthorize payroll deductions either by <em>electronic</em> signature",
                        ", please advise me on the following issue: Does the use of an \n\n<em>electronic</em> signature by an employee",
                        " <em>electronic</em> signatures should constitute a valid form of \n\nwritten authorization for payroll deductions",
                        ", we offer the following three considerations. \n\nFEC Recognizes <em>Electronic</em> Signatures on <em>Electronic</em>",
                        " the \n\nCommission in <em>electronic</em> format provided certain requirements are met. 11 CFR \u00a7 104.18(a"
                    ],
                    "id": 744,
                    "name": "Microsoft PAC",
                    "no": "1999-03",
                    "summary": "Use of digital signatures by restricted class to authorize payroll deductions.",
                    "tags": "0000",
                    "url": "https://cg-b5ec3026-92d5-49e7-8bfb-e3098741dc34.s3.amazonaws.com/legal/aos/65492.pdf"
                }
            ],
            "2000-22": [
                {
                    "category": "AO Request, Supplemental Material, and Extensions of Time",
                    "date": "2000-08-30T00:00:00",
                    "description": "Supplemental Material from Air Tansport Association of American, American Land Title Association, Council of Insurance Agents and Brokers, Independent Insurance Agents of America, Society of Independent Gasoline Marketers of America",
                    "doc_id": 64792,
                    "highlights": [
                        " Request For \n\nAn Advisory Opinion On Use Of <em>Electronic</em> Signatures \n\nDear Mr. Levin, \n\nOn behalf of our",
                        " requested to clarify the manner in which the Associations \n\nwould like to use <em>electronic</em> signatures in",
                        " to \n\nsafeguard any <em>electronic</em> signature processes that they institute. There are two separate",
                        " \n\n<em>electronic</em> \n\nmechanisms that the Associations would like to use to obtain the requisite authorizations",
                        " <em>electronic</em> \n\nsignatures from their member corporate representatives through <em>electronic</em> mail. Each of the"
                    ],
                    "id": 665,
                    "name": "Air Transportation Association",
                    "no": "2000-22",
                    "summary": "Electronic signature for trade associations' \"permission to solicit\" authorizations.",
                    "tags": "0000",
                    "url": "https://cg-b5ec3026-92d5-49e7-8bfb-e3098741dc34.s3.amazonaws.com/legal/aos/64792.pdf"
                },
                {
                    "category": "AO Request, Supplemental Material, and Extensions of Time",
                    "date": "2000-07-31T00:00:00",
                    "description": "Request by Air Tansport Association of American, American Land Title Association, Council of Insurance Agents and Brokers, Independent Insurance Agents of America, Society of Independent Gasoline Marketers of America",
                    "doc_id": 64791,
                    "highlights": [
                        " recently enacted \"<em>Electronic</em> Signatures in Global \n\nand National Commerce Act\" (\"E-Signatures Act\" or",
                        " \"Act\"), \n\n1 \n\nthe Associations ask the FEC to \n\nverify that the use of an <em>electronic</em> signature by a",
                        " additional options of receiving executed corporate authorizations via <em>electronic</em> mail \n\nor through",
                        " corporate \n\nauthorizations through such <em>electronic</em> commerce mechanisms. The Act generally prohibits \"a",
                        " solely \n\nbecause it is in <em>electronic</em> form[.]\" \n\n2 \n\nThis rule is expressly applicable to \"any"
                    ],
                    "id": 665,
                    "name": "Air Transportation Association",
                    "no": "2000-22",
                    "summary": "Electronic signature for trade associations' \"permission to solicit\" authorizations.",
                    "tags": "0000",
                    "url": "https://cg-b5ec3026-92d5-49e7-8bfb-e3098741dc34.s3.amazonaws.com/legal/aos/64791.pdf"
                }
            ]
        }
    }

@factory
def legal_universal_search_results():
    """Test data from the universal search API."""
    advisory_opinions = advisory_opinions_search_results()
    regulations = regulations_search_results()
    total_count = advisory_opinions['total_advisory_opinions'] + regulations['total_regulations']
    results = {"total_all": total_count}
    results.update(advisory_opinions)
    results.update(regulations)
    return results
