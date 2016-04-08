'use strict';

var _ = require('underscore');

var columnHelpers = require('./column-helpers');
var tables = require('./tables');
var helpers = require('./helpers');
var decoders = require('./decoders');


var dateColumn = columnHelpers.formattedColumn(helpers.datetime, {orderSequence: ['desc', 'asc']});
var currencyColumn = columnHelpers.formattedColumn(helpers.currency, {orderSequence: ['desc', 'asc']});
var barCurrencyColumn = columnHelpers.barColumn(helpers.currency);

var supportOpposeColumn = {
  data: 'support_oppose_indicator',
  render: function(data, type, row, meta) {
    return decoders.supportOppose[data] || 'Unknown';
  }
};

var amendmentIndicatorColumn = {
  data: 'amendment_indicator',
  className: 'hide-panel min-desktop',
  render: function(data) {
    return decoders.amendments[data] || '';
  },
};

var modalTriggerColumn = {
  className: 'all u-no-padding',
  width: '20px',
  orderable: false,
  render: function(data, type, row, meta) {
    return tables.MODAL_TRIGGER_HTML;
  }
};

var candidateColumn = columnHelpers.formattedColumn(function(data, type, row) {
  if (row) {
    return columnHelpers.buildEntityLink(row.candidate_name, helpers.buildAppUrl(['candidate', row.candidate_id]), 'candidate');
  } else {
    return '';
  }
});

var committeeColumn = columnHelpers.formattedColumn(function(data, type, row) {
  if (row) {
    return columnHelpers.buildEntityLink(row.committee_name, helpers.buildAppUrl(['committee', row.committee_id]), 'committee');
  } else {
    return '';
  }
});

var renderCandidateColumn = function(data, type, row, meta) {
  if (data) {
    return columnHelpers.buildEntityLink(
      data,
      helpers.buildAppUrl(['candidate', row.candidate_id]),
      'candidate');
  } else {
    return '';
  }
};

var renderCommitteeColumn = function(data, type, row, meta) {
  if (data) {
    return columnHelpers.buildEntityLink(
      data,
      helpers.buildAppUrl(['committee', row.committee_id]),
      'committee');
  } else {
    return '';
  }
};

var candidates = [
  {data: 'name', className: 'all', width: '280px', render: renderCandidateColumn},
  {data: 'office_full', className: 'min-tablet hide-panel'},
  {
    data: 'election_years',
    className: 'min-tablet',
    render: function(data, type, row, meta) {
      return tables.yearRange(_.first(data), _.last(data));
    }
  },
  {data: 'party_full', className: 'min-tablet hide-panel'},
  {data: 'state', className: 'min-desktop hide-panel'},
  {data: 'district', className: 'min-desktop hide-panel'},
  modalTriggerColumn
];

var candidateOffice = {
  candidate:   {data: 'name', className: 'all', width: '280px', render: renderCandidateColumn},
  party: {data: 'party_full', className: 'min-tablet hide-panel'},
  state: {data: 'state', className: 'min-desktop hide-panel'},
  district: {data: 'district', className: 'min-desktop hide-panel'},
  receipts: currencyColumn({data: 'receipts', className: 'min-tablet'}),
  disbursements: currencyColumn({data: 'disbursements', className: 'min-tablet'}),
  trigger: modalTriggerColumn
};

var committees = [
  {
    data: 'name',
    className: 'all',
    width: '280px',
    render: function(data, type, row, meta) {
      if (data) {
        return columnHelpers.buildEntityLink(
          data,
          helpers.buildAppUrl(['committee', row.committee_id], tables.getCycle(row.cycles, meta)),
          'committee');
      } else {
        return '';
      }
    }
  },
  {data: 'treasurer_name', className: 'min-desktop hide-panel'},
  {data: 'state', className: 'min-desktop hide-panel', width: '60px'},
  {data: 'party_full', className: 'min-desktop hide-panel'},
  dateColumn({data: 'first_file_date', className: 'min-tablet hide-panel'}),
  {data: 'committee_type_full', className: 'min-tablet hide-panel'},
  {data: 'designation_full', className: 'min-tablet hide-panel'},
  {data: 'organization_type_full', className: 'min-desktop hide-panel'},
  modalTriggerColumn
];

var communicationCosts = [
  {
    data: 'committee_name',
    orderable: false,
    className: 'min-desktop',
    render: renderCommitteeColumn,
  },
  currencyColumn({data: 'transaction_amount', className: 'min-tablet'}),
  supportOpposeColumn,
  {
    data: 'candidate_name',
    orderable: false,
    className: 'min-desktop hide-panel',
    render: renderCandidateColumn
  },
  dateColumn({data: 'transaction_date', className: 'min-tablet hide-panel-tablet'}),
  modalTriggerColumn
];

var disbursements = [
  {
    data: 'recipient_name',
    orderable: false,
    className: 'all',
    width: '200px',
    render: function(data, type, row, meta) {
      var committee = row.recipient_committee;
      if (committee) {
        return columnHelpers.buildEntityLink(
          committee.name,
          helpers.buildAppUrl(['committee', committee.committee_id]),
          'committee'
        );
      } else {
        return data;
      }
    }
  },
  {data: 'recipient_state', width: '80px', orderable: false, className: 'min-desktop hide-panel'},
  currencyColumn({data: 'disbursement_amount', className: 'min-tablet hide-panel-tablet'}),
  dateColumn({data: 'disbursement_date', className: 'min-tablet hide-panel-tablet'}),
  {data: 'disbursement_description', className: 'min-desktop hide-panel', orderable: false},
  {
    data: 'committee',
    orderable: false,
    className: 'min-tablet hide-panel',
    render: function(data, type, row, meta) {
      if (data) {
        return columnHelpers.buildEntityLink(
          data.name,
          helpers.buildAppUrl(['committee', data.committee_id]),
          'committee'
        );
      } else {
        return '';
      }
    }
  },
  modalTriggerColumn
];

var electioneeringCommunications = [
  {
    data: 'committee_name',
    orderable: false,
    className: 'min-desktop',
    render: renderCommitteeColumn
  },
  currencyColumn({data: 'disbursement_amount', className: 'min-tablet'}),
  {
    data: 'number_of_candidates',
    className: 'min-tablet',
  },
  currencyColumn({data: 'calculated_candidate_share', className: 'min-tablet'}),
  {
    data: 'candidate_name',
    orderable: false,
    className: 'min-desktop hide-panel hide-panel-tablet',
    render: renderCandidateColumn
  },
  dateColumn({data: 'disbursement_date', className: 'min-tablet hide-panel'}),
  modalTriggerColumn
];

var filings = {
  pdf_url: columnHelpers.urlColumn('pdf_url', {data: 'document_description', className: 'all', orderable: false}),
  filer_name: {
    data: 'committee_id',
    className: 'all',
    orderable: false,
    render: function(data, type, row, meta) {
      var cycle = tables.getCycle([row.cycle], meta);
      if (row.candidate_name) {
        return columnHelpers.buildEntityLink(
          row.candidate_name,
          helpers.buildAppUrl(['candidate', row.candidate_id], cycle),
          'candidate'
        );
      } else if (row.committee_name) {
        return columnHelpers.buildEntityLink(
          row.committee_name,
          helpers.buildAppUrl(['committee', row.committee_id], cycle),
          'committee'
        );
      } else {
        return '';
      }
    },
  },
  amendment_indicator: amendmentIndicatorColumn,
  receipt_date: dateColumn({data: 'receipt_date', className: 'min-tablet'}),
  coverage_end_date: dateColumn({data: 'coverage_end_date', className: 'min-tablet hide-panel', orderable: false}),
  total_receipts: currencyColumn({data: 'total_receipts', className: 'min-tablet hide-panel'}),
  total_disbursements: currencyColumn({data: 'total_disbursements', className: 'min-tablet hide-panel'}),
  total_independent_expenditures: currencyColumn({data: 'total_independent_expenditures', className: 'min-tablet hide-panel'}),
  modal_trigger: modalTriggerColumn
};

var independentExpenditures = [
  {
    data: 'committee',
    orderable: false,
    className: 'all',
    render: function(data, type, row, meta) {
      if (data) {
        return columnHelpers.buildEntityLink(
          data.name,
          helpers.buildAppUrl(['committee', data.committee_id]),
          'committee'
        );
      } else {
        return '';
      }
    }
  },
  currencyColumn({data: 'expenditure_amount', className: 'min-tablet'}),
  {
    data: 'candidate_name',
    orderable: false,
    className: 'min-tablet hide-panel',
    render: function(data, type, row, meta) {
      if (row.candidate_id) {
        return columnHelpers.buildEntityLink(
          data,
          helpers.buildAppUrl(['candidate', row.candidate_id], tables.getCycle(row, meta)),
          'candidate'
        );
      } else {
        return row.candidate_name;
      }
    }
  },
  _.extend({}, supportOpposeColumn, {className: 'min-tablet'}),
  dateColumn({data: 'expenditure_date', className: 'min-desktop hide-panel-tablet'}),
  columnHelpers.urlColumn('pdf_url', {data: 'expenditure_description', className: 'min-desktop hide-panel', orderable: false}),
  modalTriggerColumn
];

var receipts = [
  {
    data: 'contributor',
    orderable: false,
    className: 'all',
    width: '200px',
    render: function(data, type, row, meta) {
      if (data && row.receipt_type !== helpers.globals.EARMARKED_CODE) {
        return columnHelpers.buildEntityLink(
          data.name,
          helpers.buildAppUrl(['committee', data.committee_id]),
          'committee'
        );
      } else {
        return row.contributor_name;
      }
    }
  },
  {data: 'contributor_state', orderable: false, className: 'min-desktop hide-panel'},
  {data: 'contributor_employer', orderable: false, className: 'min-desktop hide-panel'},
  currencyColumn({data: 'contribution_receipt_amount', className: 'min-tablet'}),
  dateColumn({data: 'contribution_receipt_date', className: 'min-tablet hide-panel-tablet'}),
  {
    data: 'committee',
    orderable: false,
    className: 'min-desktop hide-panel',
    render: function(data, type, row, meta) {
      if (data) {
        return columnHelpers.buildEntityLink(
          data.name,
          helpers.buildAppUrl(['committee', data.committee_id]),
          'committee'
        );
      } else {
        return '';
      }
    }
  },
  modalTriggerColumn
];


module.exports = {
  candidateColumn: candidateColumn,
  committeeColumn: committeeColumn,
  dateColumn: dateColumn,
  currencyColumn: currencyColumn,
  barCurrencyColumn: barCurrencyColumn,
  supportOpposeColumn: supportOpposeColumn,
  amendmentIndicatorColumn: amendmentIndicatorColumn,
  candidates: candidates,
  candidateOffice: candidateOffice,
  committees: committees,
  communicationCosts: communicationCosts,
  disbursements: disbursements,
  electioneeringCommunications: electioneeringCommunications,
  independentExpenditures: independentExpenditures,
  filings: filings,
  receipts: receipts
};
