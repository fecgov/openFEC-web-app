from openfecwebapp.data_prep.shared import committee_type_map
from marshmallow import Schema, fields, pprint, pre_load


def handle_errors(schema, errors, obj):
    raise ValueError('An error occurred:\n{} \n\n...while marshalling the data:\n{}\n\n...for schema: {}'.format(errors, obj, schema))


class CandidateSchema(Schema):
    """ Defines a schema for candidate.
    Only fields which need special treatment (renaming, etc.)
    need be defined separately. All others may go in Meta.fields.
    """
    incumbent_challenge = fields.Str(allow_none=True)
    incumbent_challenge_full = fields.Str(allow_none=True)
    district = fields.Str(allow_none=True)

    class Meta:
        fields = ('candidate_id', 'name', 'state', 'party', 'party_full',
                      'incumbent_challenge', 'incumbent_challenge_full', 'office', 'office_full', 'district')

@CandidateSchema.error_handler
def handle_candidate_errors(schema, errors, obj):
    raise handle_errors(schema, errors, obj)
