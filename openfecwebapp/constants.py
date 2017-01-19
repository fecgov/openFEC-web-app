from collections import OrderedDict

START_YEAR = 1979

states = OrderedDict([
    ('AK', 'Alaska'),
    ('AL', 'Alabama'),
    ('AR', 'Arkansas'),
    ('AS', 'American Samoa'),
    ('AZ', 'Arizona'),
    ('CA', 'California'),
    ('CO', 'Colorado'),
    ('CT', 'Connecticut'),
    ('DC', 'District of Columbia'),
    ('DE', 'Delaware'),
    ('FL', 'Florida'),
    ('GA', 'Georgia'),
    ('GU', 'Guam'),
    ('HI', 'Hawaii'),
    ('IA', 'Iowa'),
    ('ID', 'Idaho'),
    ('IL', 'Illinois'),
    ('IN', 'Indiana'),
    ('KS', 'Kansas'),
    ('KY', 'Kentucky'),
    ('LA', 'Louisiana'),
    ('MA', 'Massachusetts'),
    ('MD', 'Maryland'),
    ('ME', 'Maine'),
    ('MI', 'Michigan'),
    ('MN', 'Minnesota'),
    ('MO', 'Missouri'),
    ('MP', 'Northern Mariana Islands'),
    ('MS', 'Mississippi'),
    ('MT', 'Montana'),
    ('NC', 'North Carolina'),
    ('ND', 'North Dakota'),
    ('NE', 'Nebraska'),
    ('NH', 'New Hampshire'),
    ('NJ', 'New Jersey'),
    ('NM', 'New Mexico'),
    ('NV', 'Nevada'),
    ('NY', 'New York'),
    ('OH', 'Ohio'),
    ('OK', 'Oklahoma'),
    ('OR', 'Oregon'),
    ('PA', 'Pennsylvania'),
    ('PR', 'Puerto Rico'),
    ('RI', 'Rhode Island'),
    ('SC', 'South Carolina'),
    ('SD', 'South Dakota'),
    ('TN', 'Tennessee'),
    ('TX', 'Texas'),
    ('UT', 'Utah'),
    ('VA', 'Virginia'),
    ('VI', 'Virgin Islands'),
    ('VT', 'Vermont'),
    ('WA', 'Washington'),
    ('WI', 'Wisconsin'),
    ('WV', 'West Virginia'),
    ('WY', 'Wyoming'),
])

parties = OrderedDict([
    ('DEM', 'Democratic Party'),
    ('REP', 'Republican Party'),
])
parties_extended = OrderedDict([
    ('AIC', 'American Independent Conservative'),
    ('AIP', 'American Independent Party'),
    ('AMP', 'American Party'),
    ('APF', "American People's Freedom Party"),
    ('CIT', "Citizens' Party"),
    ('CMP', 'Commonwealth Party of the US'),
    ('COM', 'Communist Party'),
    ('CRV', 'Conservative Party'),
    ('CST', 'Constitutional'),
    ('DC', 'Democratic/Conservative'),
    ('DFL', 'Democratic-Farm-Labor'),
    ('FLP', 'Freedom Labor Party'),
    ('GRE', 'Green Party'),
    ('GWP', 'George Wallace Party'),
    ('HRP', 'Human Rights Party'),
    ('IAP', 'Independent American Party'),
    ('ICD', 'Independent Conserv. Democratic'),
    ('IGD', 'Industrial Government Party'),
    ('IND', 'Independent'),
    ('LAB', 'US Labor Party'),
    ('LBL', 'Liberal Party'),
    ('LBR', 'Labor Party'),
    ('LBU', 'Liberty Union Party'),
    ('LFT', 'Less Federal Taxes'),
    ('LIB', 'Libertarian'),
    ('LRU', 'La Raza Unida'),
    ('NAP', 'Prohibition Party'),
    ('NDP', 'National Democratic Party'),
    ('NLP', 'Natural Law Party'),
    ('PAF', 'Peace and Freedom'),
    ('PFD', 'Peace Freedom Party'),
    ('POP', 'People Over Politics'),
    ('PPD', 'Protest, Progress, Dignity'),
    ('PPY', "People's Party"),
    ('REF', 'Reform Party'),
    ('RTL', 'Right to Life'),
    ('SLP', 'Socialist Labor Party'),
    ('SUS', 'Socialist Party USA'),
    ('SWP', 'Socialist Workers Party'),
    ('THD', 'Theo-Dem'),
    ('TWR', 'Taxpayers Without Representation'),
    ('TX', 'Taxpayers'),
    ('USP', "US People's Party"),
])

monthly_reports = OrderedDict([
    ('M2', 'February monthly'),
    ('M3', 'March monthly'),
    ('M4', 'April monthly'),
    ('M5', 'May monthly'),
    ('M6', 'June monthly'),
    ('M7', 'July monthly'),
    ('M8', 'August monthly'),
    ('M9', 'September monthly'),
    ('M10', 'October monthly'),
    ('M11', 'November monthly'),
    ('M12', 'December monthly'),
])

quarterly_reports = OrderedDict([
    ('Q1', 'April quarterly'),
    ('Q2', 'July quarterly'),
    ('Q3', 'October quarterly'),
])

semiannual_reports = OrderedDict([
    ('MY', 'Mid-year report'),
])

election_sensitive_reports = OrderedDict([
    ('12P', 'Pre-primary'),
    ('12C', 'Pre-convention'),
    ('12G', 'Pre-general'),
    ('12R', 'Pre-runoff'),
    ('12S', 'Pre-special'),
    ('30G', 'Post-general'),
    ('30R', 'Post-runoff'),
    ('30S', 'Post-special'),
    ('30P', 'Post-primary'),
    ('60D', 'Post-convention'),
    ('10D', 'Pre-election (10D)'),
    ('30D', 'Post-election (30D)')
])

bundling_reports = OrderedDict([
    ('M7S', 'July monthly/semiannual'),
    ('MSA', 'Monthly semiannual mid year'),
    ('MSY', 'Monthly semiannual year end'),
    ('MYS', 'Monthly year end/semiannual'),
    ('Q2S', 'July quarterly/semiannual'),
    ('QSA', 'Quarterly semiannual (MY)'),
    ('QYE', 'Quarterly semiannual (YE)'),
    ('QYS', 'Quarterly year end/semiannual'),
    ('QMS', 'Quarterly mid year/semiannual'),
])

other_reports = OrderedDict([
    ('TER', 'Termination'),
    ('24', '24-Hour Notification'),
    ('48', '48-Hour Notification'),
    ('90D', 'Post inaugural'),
    ('90S', 'Post inaugural supplement'),
    ('CA', 'Comprehensive amendment'),
    ('ADJ', 'Comprehensive adjusted amendment'),
])

form_types = OrderedDict([
    ('F1', "Statements Of Organization"),
    ('F1M', "Multicandidate status"),
    ('F2', "Statements Of Candidacy"),
    ('F3', "Congressional candidate financial reports"),
    ('F3P', "Presidential financial reports"),
    ('F3X', "PAC and party financial reports"),
    ('F3L', "Bundled contributions reports"),
    ('F4', "Convention financial reports"),
    ('F5', "Independent expenditure reports and notices (by a person or group)"),
    ('F24', "Independent expenditure reports and notices (by a registered committee)"),
    ('F6', "Contributions and loans notices"),
    ('F7', "Communication cost reports"),
    ('F8', "Debt settlement plans"),
    ('F9', "Electioneering communications notices"),
    ('F13', "Inaugural committee donation reports"),
    ('F99', "Miscellaneous submission"),
    ('F10', "Expenditure of personal funds notices"),
    ('F11', "Opposition personal funds notices"),
    ('F12', "Suspension of increased limits notices"),
    ('RFAI', "Request For Additional Information"),
])

amendment_indicators = OrderedDict([
    ('N', 'New'),
    ('A', 'Amendment'),
])
amendment_indicators_extended = OrderedDict([
    ('T', 'Terminated'),
    ('C', 'Consolidated'),
    ('M', 'Multicandidate'),
    ('S', 'Secondary'),
])

candidate_status = OrderedDict([
    ('C', 'Statutory candidate'),
])
candidate_status_extended = OrderedDict([
    ('F', 'Future candidate'),
    ('N', 'Not yet a candidate'),
    ('P', 'Statutory candidate in prior cycle'),
])

disbursement_categories = OrderedDict([
    ('transfers', 'Transfers'),
    ('contributions', 'Contributions'),
    ('loan-repayments', 'Loan repayments'),
    ('refunds', 'Refunds'),
    ('administrative', 'Administrative'),
    ('travel', 'Travel'),
    ('fundraising', 'Fundraising'),
    ('advertising', 'Advertising'),
    ('polling', 'Polling'),
    ('materials', 'Materials'),
    ('events', 'Events'),
    ('contributions', 'Contributions'),
    ('other', 'Other'),
])

pac_party_types = OrderedDict([
    ('C', 'Communication cost'),
    ('D', 'Delegate committee'),
    ('E', 'Electioneering communication'),
    ('Z', 'National party nonfederal account'),
    ('N', 'PAC - nonqualified'),
    ('Q', 'PAC - qualified'),
    ('V', 'PAC with non-contribution account - nonqualified'),
    ('W', 'PAC with non-contribution account - qualified'),
    ('P', 'Party - nonqualified'),
    ('Y', 'Party - qualified'),
    ('U', 'Single candidate independent expenditure'),
    ('O', 'Super PAC (independent expenditure only')
])

house_senate_types = OrderedDict([
    ('H', 'House'),
    ('S', 'Senate')
])

table_columns = OrderedDict([
    ('candidates', ['Name', 'Office', 'Election years', 'Party', 'State', 'District']),
    ('candidates-office-president', ['Name', 'Party', 'Receipts', 'Disbursements']),
    ('candidates-office-senate', ['Name', 'Party', 'State', 'Receipts', 'Disbursements']),
    ('candidates-office-house', ['Name', 'Party', 'State', 'District', 'Receipts', 'Disbursements']),
    ('committees', ['Name', 'Treasurer', 'Type', 'Designation', 'First file date']),
    ('communication-costs', ['Committee', 'Support/Oppose', 'Candidate', 'Amount', 'Date']),
    ('disbursements', ['Spender', 'Recipient', 'State', 'Purpose', 'Disbursement date', 'Amount']),
    ('electioneering-communications', ['Spender', 'Candidate mentioned','Number of candidates', 'Amount per candidate', 'Date', 'Disbursement amount' ]),
    ('filings', ['Filer name', 'Document', 'Amendment Indicator', 'Receipt date']),
    ('independent-expenditures', ['Spender', 'Support/Oppose', 'Candidate', 'Description', 'Payee', 'Expenditure date', 'Amount']),
    ('individual-contributions', ['Contributor name', 'Recipient', 'State', 'Employer', 'Receipt date', 'Amount']),
    ('receipts', ['Contributor name', 'Recipient', 'Election', 'State', 'Receipt date', 'Amount']),
    ('reports-presidential', ['Committee', 'Report type', 'Receipt date', 'Coverage end date', 'Total receipts', 'Total disbursements']),
    ('reports-house-senate', ['Committee', 'Report type', 'Receipt date', 'Coverage end date', 'Total receipts', 'Total disbursements']),
    ('reports-pac-party', ['Committee', 'Report type', 'Receipt date', 'Coverage end date', 'Total receipts', 'Total disbursements', 'Total independent expenditures']),
    ('reports-ie-only', ['Filer', 'Report type', 'Receipt date', 'Coverage end date', 'Total contributions', 'Total independent expenditures'])
])
