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
    ('reports-presidential', ['Committee', 'Report type', 'Receipt date', 'Coverage end date', 'Total receipts', 'Total disbursements']),
    ('reports-house-senate', ['Committee', 'Report type', 'Receipt date', 'Coverage end date', 'Total receipts', 'Total disbursements']),
    ('reports-pac-party', ['Committee', 'Report type', 'Receipt date', 'Coverage end date', 'Total receipts', 'Total disbursements', 'Total independent expenditures']),
    ('reports-ie-only', ['Filer', 'Report type', 'Receipt date', 'Coverage end date', 'Total contributions', 'Total independent expenditures'])


])

# RAISING_FORMATTER, SPENDING_FORMATTER, CASH_FORMATTER, IE_FORMATTER
# These are used to format the display of financial summary data on committee pages
# They map key values from a response to a tuple which contains a label and a level of hierarchy
# Levels: 1 = Top-level total; 2 = sub-total, 3 = sub-sub-total; 4 = sub-sub-sub-total
# The comments next to each refer to the type of report / committee that they show up on
# F3 = house and senate; F3P = presidential; F3X = pac and party

RAISING_FORMATTER = OrderedDict([
    ('receipts', {'label': 'Total receipts', 'level': '1', 'term': 'total receipts', 'link': 'receipts'}), #F3, F3P, #F3X
    ('contributions', {'label': 'Total contributions', 'level': '2'}), #F3, F3P, F3X
    ('individual_contributions', {'label': 'Total individual contributions', 'level': '3'}), #F3, F3P, F3X
    ('individual_itemized_contributions', {'label': 'Itemized individual contributions', 'level': '4'}), #F3, F3P, F3X
    ('individual_unitemized_contributions', {'label': 'Unitemized individual contributions', 'level': '4'}), #F3, F3P, F3X
    ('political_party_committee_contributions', {'label': 'Party committee contributions', 'level': '3'}), #F3, F3P, F3X
    ('other_political_committee_contributions', {'label': 'Other committee contributions', 'level': '3'}), #F3, F3P, F3X
    ('federal_funds', {'label': 'Presidential public funds', 'level': '3'}), #F3, F3P
    ('candidate_contribution', {'label': 'Candidate contributions', 'level': '3'}), #F3, F3P
    ('transfers_from_affiliated_party', {'label': 'Transfers from affiliated committees', 'level': '2'}), #F3X
    ('transfers_from_affiliated_committee', {'label': 'Transfer from affiliated committees', 'level': '2'}), #F3P
    ('transfers_from_other_authorized_committee', {'label': 'Transfer from authorized committees', 'level': '2'}), #F3
    ('all_loans_received', {'label': 'Loans received', 'level': '2'}), #F3X
    ('loan_repayments_received', {'label': 'Loan repayments received', 'level': '2'}), #F3X
    ('loans', {'label': 'Total loans received', 'level': '2'}), # F3
    ('loans_received', {'label': 'Total loans received', 'level': '2'}), #F3P
    ('loans_received_from_candidate', {'label': 'Loans made by candidate', 'level': '3'}), #F3P
    ('loans_made_by_candidate', {'label': 'Loans made by candidate', 'level': '3'}), #F3
    ('other_loans_received', {'label': 'Other loans', 'level': '3'}), #F3P
    ('all_other_loans', {'label': 'Other loans', 'level': '3'}), #F3
    ('total_offsets_to_operating_expenditures', {'label': 'Total offsets', 'level': '2'}), #F3P
    ('subtotal_offsets_to_operating_expenditures', {'label': 'Offsets to operating expenditures', 'level': '3'}), #F3P
    ('offsets_to_operating_expenditures', {'label': 'Offsets to operating expenditures', 'level': '2'}), #F3, F3X
    ('offsets_to_fundraising_expenditures', {'label': 'Fundraising offsets', 'level': '3'}), #F3P
    ('offsets_to_legal_accounting', {'label': 'Legal and accounting offsets', 'level': '3'}), #F3P
    ('other_receipts', {'label': 'Other receipts', 'level': '2'}), #F3, F3P
    ('fed_candidate_contribution_refunds', {'label': 'Candidate refunds', 'level': '2'}), #F3X
    ('other_fed_receipts', {'label': 'Other Receipts', 'level': '2'}), #F3X
    ('total_transfers', {'label': 'Levin funds', 'level': '2'}), #F3X
    ('transfers_from_nonfed_account', {'label': 'Non-federal transfers', 'level': '2'}), #F3X
    ('transfers_from_nonfed_levin', {'label': 'Levin funds', 'level': '2'}), #F3X
    ('fed_receipts', {'label': 'Total federal receipts', 'level': '2'}), #F3X
])

SPENDING_FORMATTER = OrderedDict([
    ('disbursements', {'label': 'Total disbursements', 'level': '1', 'term': 'total disbursements', 'link': 'disbursements'}), #F3, F3P, F3X
    ('operating_expenditures', {'label': 'Operating expenditures', 'term': 'operating expenditures', 'level': '2'}), #F3, F3P, F3X
    ('shared_fed_operating_expenditures', {'label': 'Allocated operating expenditures - federal', 'level': '3'}), #F3X
    ('shared_nonfed_operating_expenditures', {'label': 'Allocated operating expenditures - non-federal', 'level': '3'}), #F3X
    ('other_fed_operating_expenditures', {'label': 'Other federal operating expenditures', 'level': '3'}), #F3X
    ('transfers_to_other_authorized_committee', {'label': 'Transfers to authorized committees', 'level': '2'}), #F3, F3P
    ('fundraising_disbursements', {'label': 'Fundraising', 'level': '2'}), #F3P
    ('exempt_legal_accounting_disbursement', {'label': 'Exempt legal and accounting', 'level': '2'}), #F3P
    ('transfers_to_affiliated_committee', {'label': 'Transfers to affiliated committees', 'level': '2'}), #F3X
    ('fed_candidate_committee_contributions', {'label': 'Contributions to other committees', 'level': '2'}), #F3X
    ('independent_expenditures', {'label': 'Independent expenditures', 'level': '2', 'link': 'independent_expenditures'}), #F3X
    ('coordinated_expenditures_by_party_committee', {'label': 'Coordinated party expenditures', 'level': '2'}), #F3X
    ('loans_made', {'label': 'Loans made', 'level': '2'}), #F3X
    ('loan_repayments_made', {'label': 'Total loan repayments made', 'level': '2'}), #F3P, #F3X
    ('repayments_loans_made_by_candidate', {'label': 'Candidate loan repayments', 'level': '3'}), #F3P
    ('repayments_other_loans', {'label': 'Other loan repayments', 'level': '3'}), #F3P
    ('contribution_refunds', {'label': 'Total contribution refunds', 'level': '2'}), #F3, F3P, F3X
    ('refunded_individual_contributions', {'label': 'Individual refunds', 'level': '3'}), #F3, F3P, F3X
    ('refunded_political_party_committee_contributions', {'label': 'Political party refunds', 'level': '3'}), #F3, F3P, F3X
    ('refunded_other_political_committee_contributions', {'label': 'Other committee refunds', 'level': '3'}), #F3, F3P, F3X
    ('loan_repayments', {'label': 'Total loan repayments', 'level': '2'}), #F3
    ('loan_repayments_candidate_loans', {'label': 'Candidate loan repayments', 'level': '3'}), #F3
    ('loan_repayments_other_loans', {'label': 'Other loan repayments', 'level': '3'}), #F3
    ('other_disbursements', {'label': 'Other disbursements', 'level': '2'}), #F3, F3P, F3X
    ('fed_election_activity', {'label': 'Total federal election activity', 'level': '2'}), #F3X
    ('shared_fed_activity', {'label': 'Allocated federal election activity - federal share', 'level': '3'}), #F3X
    ('allocated_federal_election_levin_share', {'label': 'Allocated federal election activity - Levin share', 'level': '3'}), #F3X
    ('non_allocated_fed_election_activity', {'label': 'Federal election activity - federal only', 'level': '3'}), #F3X
    ('fed_disbursements', {'label': 'Total federal disbursements', 'level': '2'}), #F3X
])

CASH_FORMATTER = OrderedDict([
    ('cash_on_hand_beginning_period', {'label': 'Beginning cash on hand', 'level': '2'}), #F3, F3P, #F3X
    ('last_cash_on_hand_end_period', {'label': 'Ending cash on hand', 'term': 'ending cash on hand', 'level': '2'}), #F3, F3P, #F3X
    ('net_contributions', {'label': 'Net contributions', 'level': '2'}), #F3, F3X
    ('contributions', {'label': 'Total contributions', 'level': '3'}), #F3, #F3P, F3X
    ('contribution_refunds', {'label': '(Total contribution refunds)', 'level': '3'}), #F3, F3P, F3X
    ('net_operating_expenditures', {'label': 'Net operating expenditures', 'level': '2'}), #F3, F3X
    ('operating_expenditures', {'label': 'Operating expenditures', 'level': '3'}), #F3, F3P, F3X
    ('offsets_to_operating_expenditures', {'label': '(Offsets to operating expenditures)', 'level': '3'}), #F3, F3P, F3X
    ('subtotal_offsets_to_operating_expenditures', {'label': 'Offsets to operating expenditures', 'level': '3'}), #F3P
    ('last_debts_owed_to_committee', {'label': 'Debts/loans owed to committee', 'level': '2'}), #F3, F3P, F3X
    ('last_debts_owed_by_committee', {'label': 'Debts/loans owed by committee', 'level': '2'}), #F3, F3P, F3X
])

IE_FORMATTER = OrderedDict([
    ('total_independent_contributions', {'label': 'Contributions received', 'level': '1'}),
    ('total_independent_expenditures', {'label': 'Independent expenditures', 'level': '1'})
])
