from marshmallow import Schema, fields
from flask import url_for


class CommitteeSchema(Schema):
    """ Defines a schema for committee.
    """
    url = fields.Function(lambda x: url_for('committee_page', c_id=x['committee_id']))
    is_primary = fields.Function(lambda x: x['designation'] == 'P')
    is_authorized = fields.Function(lambda x: x['designation'] == 'A')
    street_2 = fields.Str(allow_none=True)
    organization_type = fields.Str(allow_none=True)
    organization_type_full = fields.Str(allow_none=True)
    party = fields.Str(allow_none=True)
    party_full = fields.Str(allow_none=True)

    class Meta:
        additional = (
            'committee_id', 'name', 'committee_type', 'committee_type_full', 
            'treasurer_name', 'designation', 'designation_full',
            'treasurer_name', 'street_1', 'city', 'state', 'zip'
        )


@CommitteeSchema.error_handler
def handle_committee_errors(schema, errors, obj):
    raise ValueError('An error occurred:\n{} \n\n...while marshalling the data:\n{}\n\n...for schema: {}'.format(errors, obj, schema))
