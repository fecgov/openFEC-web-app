'use strict';

var _ = require('underscore');

var columnHelpers = require('./column-helpers');
var tables = require('./tables');
var helpers = require('./helpers');
var decoders = require('./decoders');


var dateColumn = columnHelpers.formattedColumn(helpers.datetime, {orderSequence: ['desc', 'asc']});
var currencyColumn = columnHelpers.formattedColumn(helpers.currency, {orderSequence: ['desc', 'asc']});
var barCurrencyColumn = columnHelpers.barColumn(helpers.currency);

var SIZES = {
  MEDIUM: '15%',
  LARGE: '20%',
  XL: '30%',
  STATE: '80px',
  TRIGGER: '30px',
  CURRENCY: '15%',
  DATE: '150px'
};

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
  width: SIZES.TRIGGER,
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
  {data: 'name', className: 'all', width: SIZES.LARGE, render: renderCandidateColumn},
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
  name:   {data: 'name', className: 'all', width: SIZES.XL, render: renderCandidateColumn},
  party: {data: 'party_full', className: 'min-desktop hide-panel no-wrap'},
  state: {data: 'state', className: 'min-desktop hide-panel'},
  district: {data: 'district', className: 'min-desktop hide-panel'},
  receipts: currencyColumn({data: 'receipts', width: SIZES.CURRENCY, className: 'min-tablet currency-column'}),
  disbursements: currencyColumn({data: 'disbursements', width: SIZES.CURRENCY, className: 'min-tablet currency-column'}),
  trigger: modalTriggerColumn
};

var committees = [
  {
    data: 'name',
    className: 'all',
    width: SIZES.XL,
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
  {data: 'committee_type_full', className: 'min-tablet hide-panel'},
  {data: 'designation_full', className: 'min-tablet hide-panel'},
  dateColumn({data: 'first_file_date', className: 'min-tablet hide-panel currency-column', width: SIZES.DATE }),
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
    width: SIZES.LARGE,
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
  {data: 'recipient_state', width: SIZES.STATE, orderable: false, className: 'min-desktop hide-panel'},
  {data: 'disbursement_description', className: 'min-desktop hide-panel', orderable: false},
  {
    data: 'committee',
    orderable: false,
    className: 'min-tablet hide-panel',
    width: SIZES.LARGE,
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
  dateColumn({data: 'disbursement_date', className: 'min-tablet hide-panel-tablet currency-column', width: SIZES.DATE}),
  currencyColumn({data: 'disbursement_amount', className: 'min-tablet hide-panel-tablet currency-column'}),
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
  pdf_url: columnHelpers.urlColumn('pdf_url', {
    data: 'document_description',
    className: 'all',
    width: SIZES.MEDIUM,
    orderable: false
  }),
  filer_name: {
    data: 'committee_id',
    className: 'all',
    orderable: false,
    width: SIZES.LARGE,
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
  receipt_date: dateColumn({data: 'receipt_date', className: 'min-tablet currency-column', width: SIZES.DATE}),
  coverage_end_date: dateColumn({data: 'coverage_end_date', className: 'min-tablet hide-panel currency-column', orderable: false}),
  total_receipts: currencyColumn({data: 'total_receipts', className: 'min-tablet hide-panel currency-column', width: SIZES.CURRENCY}),
  total_disbursements: currencyColumn({data: 'total_disbursements', className: 'min-tablet hide-panel currency-column', width: SIZES.CURRENCY}),
  total_independent_expenditures: currencyColumn({data: 'total_independent_expenditures', className: 'min-tablet hide-panel currency-column', width: SIZES.CURRENCY}),
  modal_trigger: {
    className: 'all u-no-padding',
    width: SIZES.TRIGGER,
    orderable: false,
    render: function(data, type, row) {
      if (row.form_type && row.form_type.match(/^F3[XP]?$/)) {
        return tables.MODAL_TRIGGER_HTML;
      }
    }
  }
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
  currencyColumn({data: 'expenditure_amount', className: 'min-tablet'}),
  modalTriggerColumn
];

var individualContributions = [
  {
    data: 'contributor',
    orderable: false,
    className: 'all',
    width: SIZES.LARGE,
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
  {data: 'contributor_state', orderable: false, width: SIZES.STATE, className: 'min-desktop hide-panel'},
  {data: 'contributor_employer', orderable: false, className: 'min-desktop hide-panel'},
  {
    data: 'committee',
    orderable: false,
    width: SIZES.XL,
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
  dateColumn({data: 'contribution_receipt_date', className: 'min-tablet hide-panel-tablet', width: SIZES.DATE}),
  currencyColumn({data: 'contribution_receipt_amount', className: 'min-tablet currency-column'}),
  modalTriggerColumn
];

var receipts = [
  {
    data: 'contributor',
    orderable: false,
    className: 'all',
    width: SIZES.XL,
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
  {data: 'contributor_state', orderable: false, width: SIZES.STATE, className: 'min-desktop hide-panel'},
  {
    data: 'committee',
    orderable: false,
    width: SIZES.XL,
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
  dateColumn({data: 'contribution_receipt_date', className: 'min-tablet hide-panel-tablet', width: SIZES.DATE}),
  currencyColumn({data: 'contribution_receipt_amount', className: 'min-tablet currency-column'}),
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
  individualContributions: individualContributions,
  filings: filings,
  receipts: receipts
};
