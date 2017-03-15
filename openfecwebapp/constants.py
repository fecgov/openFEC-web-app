from collections import OrderedDict

START_YEAR = 1979
END_YEAR = 2018
DEFAULT_TIME_PERIOD = 2016

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
    ('F1', "Statements Of Organization (Form 1)"),
    ('F1M', "Multicandidate status (Form 1M)"),
    ('F2', "Statements Of Candidacy (Form 2)"),
    ('F3', "Congressional candidate financial reports (Form 3)"),
    ('F3P', "Presidential financial reports (Form 3P)"),
    ('F3X', "PAC and party financial reports (Form 3X)"),
    ('F3L', "Bundled contributions reports (Form 3L)"),
    ('F4', "Convention financial reports (Form 4)"),
    ('F5', "Independent expenditure reports and notices (by a person or group) (Form 5)"),
    ('F24', "Independent expenditure reports and notices (by a registered committee) (Form 24)"),
    ('F6', "Contributions and loans notices (Form 6)"),
    ('F7', "Communication cost reports (Form 7)"),
    ('F8', "Debt settlement plans (Form 8)"),
    ('F9', "Electioneering communications notices (Form 9)"),
    ('F13', "Inaugural committee donation reports (Form 13)"),
    ('F99', "Miscellaneous submission (Form 99)"),
    ('F10', "Expenditure of personal funds notices (Form 10)"),
    ('F11', "Opposition personal funds notices (Form 11)"),
    ('F12', "Suspension of increased limits notices (Form 12)"),
    ('RFAI', "Request For Additional Information (RFAI)"),
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
    ('disbursements', ['Spender', 'Recipient', 'State', 'Description', 'Disbursement date', 'Amount']),
    ('electioneering-communications', ['Spender', 'Candidate mentioned','Number of candidates', 'Amount per candidate', 'Date', 'Disbursement amount' ]),
    ('filings', ['Filer name', 'Document', 'Version', 'Receipt date']),
    ('independent-expenditures', ['Spender', 'Support/Oppose', 'Candidate', 'Description', 'Payee', 'Expenditure date', 'Amount']),
    ('individual-contributions', ['Contributor name', 'Recipient', 'State', 'Employer', 'Receipt date', 'Amount']),
    ('loans', ['Committee Name', 'Loaner name', 'Incurred date', 'Payment to date', 'Original loan amount']),
    ('party-coordinated-expenditures', ['Spender', 'Candidate', 'Payee name', 'Expenditure date', 'Amount']),
    ('receipts', ['Contributor name', 'Recipient', 'Election', 'State', 'Receipt date', 'Amount']),
    ('reports-presidential', ['Committee', 'Report type', 'Version', 'Receipt date', 'Coverage end date', 'Total receipts', 'Total disbursements']),
    ('reports-house-senate', ['Committee', 'Report type', 'Version', 'Receipt date', 'Coverage end date', 'Total receipts', 'Total disbursements']),
    ('reports-pac-party', ['Committee', 'Report type', 'Version', 'Receipt date', 'Coverage end date', 'Total receipts', 'Total disbursements', 'Total independent expenditures']),
    ('reports-ie-only', ['Filer', 'Report type', 'Version', 'Receipt date', 'Coverage end date', 'Total contributions', 'Total independent expenditures'])


])

# RAISING_FORMATTER, SPENDING_FORMATTER, CASH_FORMATTER, IE_FORMATTER
# These are used to format the display of financial summary data on committee pages
# They map key values from a response to a tuple which contains a label and a level of hierarchy
# Levels: 1 = Top-level total; 2 = sub-total, 3 = sub-sub-total; 4 = sub-sub-sub-total
# The comments next to each refer to the type of report / committee that they show up on
# F3 = house and senate; F3P = presidential; F3X = pac and party

RAISING_FORMATTER = OrderedDict([
    ('receipts', ('Total receipts', '1')), #F3, F3P, #F3X
    ('contributions', ('Total contributions', '2')), #F3, F3P, F3X
    ('individual_contributions', ('Total individual contributions', '3')), #F3, F3P, F3X
    ('individual_itemized_contributions', ('Itemized individual contributions', '4')), #F3, F3P, F3X
    ('individual_unitemized_contributions', ('Unitemized individual contributions', '4')), #F3, F3P, F3X
    ('political_party_committee_contributions', ('Party committee contributions', '3')), #F3, F3P, F3X
    ('other_political_committee_contributions', ('Other committee contributions', '3')), #F3, F3P, F3X
    ('federal_funds', ('Presidential public funds', '3')), #F3, F3P
    ('candidate_contribution', ('Candidate contributions', '3')), #F3, F3P
    ('transfers_from_affiliated_party', ('Transfers from affiliated committees', '2')), #F3X
    ('transfers_from_affiliated_committee', ('Transfer from affiliated committees', '2')), #F3P
    ('transfers_from_other_authorized_committee', ('Transfer from authorized committees', '2')), #F3
    ('all_loans_received', ('Loans received', '2')), #F3X
    ('loan_repayments_received', ('Loan repayments received', '2')), #F3X
    ('loans', ('Total loans received', '2')), # F3
    ('loans_received', ('Total loans received', '2')), #F3P
    ('loans_received_from_candidate', ('Loans made by candidate', '3')), #F3P
    ('loans_made_by_candidate', ('Loans made by candidate', '3')), #F3
    ('other_loans_received', ('Other loans', '3')), #F3P
    ('all_other_loans', ('Other loans', '3')), #F3
    ('total_offsets_to_operating_expenditures', ('Total offsets', '2')), #F3P
    ('subtotal_offsets_to_operating_expenditures', ('Offsets to operating expenditures', '3')), #F3P
    ('offsets_to_operating_expenditures', ('Offsets to operating expenditures', '2')), #F3, F3X
    ('offsets_to_fundraising_expenditures', ('Fundraising offsets', '3')), #F3P
    ('offsets_to_legal_accounting', ('Legal and accounting offsets', '3')), #F3P
    ('other_receipts', ('Other receipts', '2')), #F3, F3P
    ('fed_candidate_contribution_refunds', ('Candidate refunds', '2')), #F3X
    ('other_fed_receipts', ('Other Receipts', '2')), #F3X
    ('transfers_from_nonfed_account', ('Non-federal transfers', '2')), #F3X
    ('transfers_from_nonfed_levin', ('Levin funds', '2')), #F3X
    ('fed_receipts', ('Total federal receipts', '2')), #F3X
])

SPENDING_FORMATTER = OrderedDict([
    ('disbursements', ('Total disbursements', '1')), #F3, F3P, F3X
    ('operating_expenditures', ('Operating expenditures', '2')), #F3, F3P, F3X
    ('shared_fed_operating_expenditures', ('Allocated operating expenditures - federal', '3')), #F3X
    ('shared_nonfed_operating_expenditures', ('Allocated operating expenditures - non-federal', '3')), #F3X
    ('other_fed_operating_expenditures', ('Other federal operating expenditures', '3')), #F3X
    ('transfers_to_other_authorized_committee', ('Transfers to authorized committees', '2')), #F3, F3P
    ('fundraising_disbursements', ('Fundraising', '2')), #F3P
    ('exempt_legal_accounting_disbursement', ('Exempt legal and accounting', '2')), #F3P
    ('transfers_to_affiliated_committee', ('Transfers to affiliated committees', '2')), #F3X
    ('fed_candidate_committee_contributions', ('Contributions to other committees', '2')), #F3X
    ('independent_expenditures', ('Independent expenditures', '2')), #F3X
    ('coordinated_expenditures_by_party_committee', ('Coordinated party expenditures', '2')), #F3X
    ('loans_made', ('Loans made', '2')), #F3X
    ('loan_repayments_made', ('Total loan repayments made', '2')), #F3P, #F3X
    ('repayments_loans_made_by_candidate', ('Candidate loan repayments', '3')), #F3P
    ('repayments_other_loans', ('Other loan repayments', '3')), #F3P
    ('contribution_refunds', ('Total contribution refunds', '2')), #F3, F3P, F3X
    ('refunded_individual_contributions', ('Individual refunds', '3')), #F3, F3P, F3X
    ('refunded_political_party_committee_contributions', ('Political party refunds', '3')), #F3, F3P, F3X
    ('refunded_other_political_committee_contributions', ('Other committee refunds', '3')), #F3, F3P, F3X
    ('loan_repayments', ('Total loan repayments', '2')), #F3
    ('loan_repayments_candidate_loans', ('Candidate loan repayments', '3')), #F3
    ('loan_repayments_other_loans', ('Other loan repayments', '3')), #F3
    ('other_disbursements', ('Other disbursements', '2')), #F3, F3P, F3X
    ('fed_election_activity', ('Total federal election activity', '2')), #F3X
    ('shared_fed_activity', ('Allocated federal election activity - federal share', '3')), #F3X
    ('allocated_federal_election_levin_share', ('Allocated federal election activity - Levin share', '3')), #F3X
    ('non_allocated_fed_election_activity', ('Federal election activity - federal only', '3')), #F3X
    ('fed_disbursements', ('Total federal disbursements', '2')), #F3X
])

CASH_FORMATTER = OrderedDict([
    ('last_cash_on_hand_end_period', ('Ending cash on hand', '2')), #F3, F3P, #F3X
    ('net_contributions', ('Net contributions', '2')), #F3, F3X
    ('contributions', ('Total contributions', '3')), #F3, #F3P, F3X
    ('contribution_refunds', ('(Total contribution refunds)', '3')), #F3, F3P, F3X
    ('net_operating_expenditures', ('Net operating expenditures', '2')), #F3, F3X
    ('operating_expenditures', ('Operating expenditures', '3')), #F3, F3P, F3X
    ('offsets_to_operating_expenditures', ('(Offsets to operating expenditures)', '3')), #F3, F3P, F3X
    ('subtotal_offsets_to_operating_expenditures', ('Offsets to operating expenditures', '3')), #F3P
    ('last_debts_owed_by_committee', ('Debts/loans owed by committee', '2')), #F3, F3P, F3X
])

IE_FORMATTER = OrderedDict([
    ('total_independent_contributions', ('Contributions received', '1')),
    ('total_independent_expenditures', ('Independent expenditures', '1'))
])

SENATE_CLASSES = {
    '1': ['AZ', 'CA', 'CT', 'DE', 'FL', 'HI', 'IN', 'ME', 'MD', 'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NJ', 'NM', 'NY', 'ND', 'OH', 'PA', 'RI', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY'],
    '2': ['AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'FL', 'GA', 'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'MD', 'MO', 'NV', 'NH', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'SC', 'SD', 'UT', 'VT', 'WA', 'WI'],
    '3': ['AL', 'AK', 'AR', 'CO', 'DE', 'GA', 'ID', 'IL', 'IA', 'KS', 'KY', 'LA', 'ME', 'MA', 'MI', 'MN', 'MS', 'MT', 'NE', 'NH', 'NJ', 'NM', 'NC', 'OK', 'OR', 'RI', 'SC', 'SD', 'TN', 'TX', 'VA', 'WV', 'WY']
}

NEXT_SENATE_ELECTIONS = {
    '1': 2018,
    '2': 2022,
    '3': 2020
}
