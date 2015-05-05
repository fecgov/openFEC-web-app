from marshmallow import Schema, fields, pre_load
import re


class ReportSchema(Schema):
    cash = fields.Decimal(attribute='cash_on_hand_end_period', default=0)
    debt = fields.Decimal(attribute='debts_owed_by_committee', default=0)
    cycle = fields.Integer()
    report_year = fields.Integer()
    report_type_full = fields.String()
    report_desc = fields.Method("_report_desc")

    def _years_totals(self, obj):
        return "{} - {}".format(obj.cycle - 1, obj.cycle)

    def _report_desc(self, obj):
        return re.sub('{.+}', '', obj.report_type_full)

    class Meta:
        additional = ('cash_on_hand_beginning_period', 'cash_on_hand_end_period', 'debts_owed_to_committee', 'coverage_start_date', 'coverage_end_date')


class TotalsSchema(Schema):
    receipts = fields.Decimal(default=0)
    disbursements = fields.Decimal(default=0)
    total_debt = fields.Decimal(attribute='debts_owed_by_committee')
    cycle = fields.Integer()
    report_year = fields.Integer()
    years_totals = fields.Method("_years_totals")
    report_type_full = fields.String()
    report_desc = fields.Method("_report_desc")
    all_loans_received = fields.Decimal(required=False)
    transfers_to_committees = fields.Decimal(required=False)
    loan_repayments = fields.Decimal(required=False)
    individual_itemized_contributions = fields.Decimal(required=False)
    individual_unitemized_contributions = fields.Decimal(required=False)
    operating_expenditures = fields.Decimal(required=False)
    coverage_start_date = fields.DateTime(required=False)
    coverage_end_date = fields.DateTime(required=False)
    contribution_refunds = fields.Decimal(required=False)
    other_disbursements = fields.Decimal(required=False)

    def _years_totals(self, obj):
        return "{} - {}".format(obj.cycle - 1, obj.cycle)

    def _report_desc(self, obj):
        return re.sub('{.+}', '', obj.report_type_full)

    @pre_load
    def harmonize_field_names_across_cmte_types(self, data, many):
        data['transfers_to_committees'] = data.get('transfers_to_other_authorized_committee', data.get('transfers_to_affiliated_committee'))

        return data


class CommitteeFinancials(Schema):
    reports = fields.Nested(ReportSchema, many=True)
    totals = fields.Nested(TotalsSchema, many=True)

    @pre_load
    def map_totals_and_reports(self, data, many):
        input_data_old = data
        data = {
            'reports': input_data_old['reports'][0],
            'totals': input_data_old['totals'][0]
        }

        return data


@CommitteeFinancials.error_handler
def handle_committee_financial_errors(schema, errors, obj):
    raise ValueError('An error occurred:\n{} \n\n...while marshalling the data:\n{}\n\n...for schema: {}'.format(errors, obj, schema))


@ReportSchema.error_handler
def handle_report_schema_errors(schema, errors, obj):
    raise ValueError('An error occurred:\n{} \n\n...while marshalling the data:\n{}\n\n...for schema: {}'.format(errors, obj, schema))


@TotalsSchema.error_handler
def handle_totals_schema_errors(schema, errors, obj):
    raise ValueError('An error occurred:\n{} \n\n...while marshalling the data:\n{}\n\n...for schema: {}'.format(errors, obj, schema))
