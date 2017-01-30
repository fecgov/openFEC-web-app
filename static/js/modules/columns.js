'use strict';

var _ = require('underscore');

var columnHelpers = require('./column-helpers');
var tables = require('./tables');
var helpers = require('./helpers');
var decoders = require('./decoders');
var moment = require('moment');

var reportType = require('../../templates/reports/reportType.hbs');

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
  className: 'hide-panel hide-efiling column--med min-desktop',
  render: function(data) {
    return decoders.amendments[data] || '';
  },
};

var versionColumn = {
  data: 'most_recent',
  className: 'hide-panel hide-efiling column--med min-desktop',
  render: function(data) {
    if (data === true) {
      return '<i class="icon-circle--check-outline--inline--left"></i>Most recent version';
    }
    else if (data === false) {
      return '<i class="icon-circle--clock-reverse--inline--left"></i>Past version';
    }
    else {
      return '';
    }
  },
};

var modalTriggerColumn = {
  className: 'all column--trigger',
  orderable: false,
  render: function(data, type, row, meta) {
    return tables.MODAL_TRIGGER_HTML;
  }
};

var receiptDateColumn = {
  data: 'receipt_date',
  className: 'min-tablet hide-panel column--med',
  orderable: true,
  render: function(data, type, row, meta) {
    var parsed;
    if (meta.settings.oInit.path.indexOf('efile') >= 0) {
      parsed = moment(row.receipt_date, 'YYYY-MM-DDTHH:mm:ss');
      return parsed.isValid() ? parsed.format('MM/DD/YYYY, h:mma') : 'Invalid date';
    } else {
      parsed = moment(row.receipt_date, 'YYYY-MM-DDTHH:mm:ss');
      return parsed.isValid() ? parsed.format('MM/DD/YYYY') : 'Invalid date';
    }
  }
};

var pagesColumn = {
  data: 'beginning_image_number',
  orderable: false,
  className: 'min-tablet hide-panel column--small',
  render: function(data, type, row) {
    return row.ending_image_number - row.beginning_image_number + 1;
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
  {data: 'name', className: 'all column--large', render: renderCandidateColumn},
  {data: 'office_full', className: 'min-tablet hide-panel-tablet column--med'},
  {
    data: 'election_years',
    className: 'min-tablet hide-panel column--med',
    render: function(data, type, row, meta) {
      return tables.yearRange(_.first(data), _.last(data));
    }
  },
  {data: 'party_full', className: 'min-tablet column--med hide-panel'},
  {data: 'state', className: 'min-desktop hide-panel column--state'},
  {data: 'district', className: 'min-desktop hide-panel column--small'},
  modalTriggerColumn
];

var candidateOffice = {
  name:   {data: 'name', className: 'all column--xl', render: renderCandidateColumn},
  party: {data: 'party_full', className: 'min-desktop'},
  state: {data: 'state', className: 'min-tablet column--state hide-panel'},
  district: {data: 'district', className: 'min-desktop column--small hide-panel'},
  receipts: currencyColumn({data: 'receipts', className: 'min-tablet hide-panel column--number'}),
  disbursements: currencyColumn({data: 'disbursements', className: 'min-tablet hide-panel column--number'}),
  trigger: modalTriggerColumn
};

var committees = [
  {
    data: 'name',
    className: 'all column--xl',
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
  dateColumn({data: 'first_file_date', className: 'min-tablet hide-panel column--med' }),
  modalTriggerColumn
];

var communicationCosts = [
  {
    data: 'committee_name',
    orderable: false,
    className: 'all column--xl',
    render: renderCommitteeColumn,
  },
  _.extend({}, supportOpposeColumn, {className: 'min-tablet hide-panel-tablet column--med'}),
  {
    data: 'candidate_name',
    orderable: false,
    className: 'min-tablet hide-panel-tablet column--large',
    render: renderCandidateColumn
  },
  currencyColumn({data: 'transaction_amount', className: 'min-tablet hide-panel column--med column--number'}),
  dateColumn({data: 'transaction_date', className: 'min-tablet hide-panel column--med'}),
  modalTriggerColumn
];

var disbursements = [
  {
    data: 'committee',
    orderable: false,
    className: 'all column--large',
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
    data: 'recipient_name',
    orderable: false,
    className: 'all column--large',
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
  {data: 'recipient_state', orderable: false, className: 'min-desktop column--state hide-panel'},
  {data: 'disbursement_description', className: 'min-desktop hide-panel', orderable: false},
  dateColumn({data: 'disbursement_date', className: 'min-tablet hide-panel column--med'}),
  currencyColumn({data: 'disbursement_amount', className: 'min-tablet hide-panel column--number column--med'}),
  modalTriggerColumn
];

var electioneeringCommunications = [
  {
    data: 'committee_name',
    orderable: false,
    className: 'all column--xl',
    render: renderCommitteeColumn
  },
  {
    data: 'candidate_name',
    orderable: false,
    className: 'min-desktop hide-panel-tablet',
    render: renderCandidateColumn
  },
  {
    data: 'number_of_candidates',
    className: 'min-desktop hide-panel column--small column--number',
  },
  currencyColumn({data: 'calculated_candidate_share', className: 'min-desktop hide-panel column--number column--med'}),
  dateColumn({data: 'disbursement_date', className: 'min-tablet hide-panel column--med'}),
  currencyColumn({data: 'disbursement_amount', className: 'min-tablet hide-panel column--number column--med'}),
  modalTriggerColumn
];

var filings = {
  filer_name: {
    data: 'committee_id',
    className: 'all column--large',
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
  pdf_url: columnHelpers.urlColumn('pdf_url', {
    // This is just used by the committee pages because those tables
    // are too narrow to support the combo button
    data: 'document_description',
    className: 'all column--medium',
    orderable: false
  }),
  document_type: {
    data: 'document_description',
    className: 'all column--doc-download column--large',
    orderable: false,
    render: function(data, type, row) {
      var doc_description = row.document_description ? row.document_description : row.form_type;
      var show_version = true;
      var is_original = false;
      var amendment_num = 1;
      var pdf_url = row.pdf_url ? row.pdf_url : null;
      var csv_url = row.csv_url ? row.csv_url : null;
      var fec_url = row.fec_url ? row.fec_url : null;

      // because of messy data, do not show if not e-filing or null amendment indicator
      // if(row.means_filed !== 'e-file'|| row.amendment_indicator === null) {
      //   show_version = false;
      // }

      // if (row.amendment_indicator === 'N') {
      //   is_original = true;
      // }

      // if (row.amendment_chain) {
      //   amendment_num = row.amendment_chain.length - 1;
      // }
      //
      // don't show amendment version until data is QA'd
      show_version = false;

      return reportType({
        doc_description: doc_description,
        show_version: show_version,
        is_original: is_original,
        amendment_num: amendment_num,
        fec_url: fec_url,
        pdf_url: pdf_url,
        csv_url: csv_url
      });
    }
  },
  pages: pagesColumn,
  amendment_indicator: amendmentIndicatorColumn,
  receipt_date: receiptDateColumn,
  coverage_start_date: dateColumn({data: 'coverage_start_date', className: 'min-tablet hide-panel column--med', orderable: false}),
  coverage_end_date: dateColumn({data: 'coverage_end_date', className: 'min-tablet hide-panel column--med', orderable: false}),
  total_receipts: currencyColumn({data: 'total_receipts', className: 'min-desktop hide-panel column--number'}),
  total_disbursements: currencyColumn({data: 'total_disbursements', className: 'min-desktop hide-panel column--number'}),
  total_independent_expenditures: currencyColumn({data: 'total_independent_expenditures', className: 'min-desktop hide-panel column--number'}),
  modal_trigger: {
    className: 'all column--trigger hide-efiling',
    orderable: false,
    render: function(data, type, row) {
      if (row.form_type && row.form_type.match(/^F[35][XP]?$/)) {
        return tables.MODAL_TRIGGER_HTML;
      } else {
        return '';
      }
    }
  }
};

var independentExpenditures = [
  {
    data: 'committee',
    orderable: false,
    className: 'all column--large',
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
  _.extend({}, supportOpposeColumn, {className: 'min-tablet hide-panel-tablet column--med'}),
  {
    data: 'candidate_name',
    orderable: false,
    className: 'min-tablet hide-panel-tablet column--large',
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
  columnHelpers.urlColumn('pdf_url', {data: 'expenditure_description', className: 'min-desktop hide-panel', orderable: false}),
  {
    data: 'payee_name',
    orderable: false,
    className: 'min-desktop hide-panel column--medium'
  },
  dateColumn({data: 'expenditure_date', className: 'min-tablet hide-panel column--med'}),
  currencyColumn({data: 'expenditure_amount', className: 'min-tablet hide-panel column--number column--med'}),
  modalTriggerColumn
];

var individualContributions = [
  {
    data: 'contributor',
    orderable: false,
    className: 'all hide-panel-tablet column--large',
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
  {
    data: 'committee',
    orderable: false,
    className: 'all column--xl',
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
  {data: 'contributor_state', orderable: false, className: 'min-desktop hide-panel column--state '},
  {data: 'contributor_employer', orderable: false, className: 'min-desktop hide-panel'},
  dateColumn({data: 'contribution_receipt_date', className: 'min-tablet hide-panel column--med'}),
  currencyColumn({data: 'contribution_receipt_amount', className: 'min-tablet hide-panel column--number column--med'}),
  modalTriggerColumn
];

var receipts = [
  {
    data: 'contributor',
    orderable: false,
    className: 'all column--xl',
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
  {
    data: 'committee',
    orderable: false,
    className: 'all column--xl',
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
    data: 'fec_election_type_desc',
    orderable: false,
    className: 'min-desktop column--med',
  },
  {data: 'contributor_state', orderable: false, className: 'min-desktop hide-panel column--state'},
  dateColumn({data: 'contribution_receipt_date', className: 'min-tablet hide-panel column--med'}),
  currencyColumn({data: 'contribution_receipt_amount', className: 'min-tablet hide-panel column--med column--number'}),
  modalTriggerColumn
];

var reports = {
  committee:   {
    data: 'committee_name',
    orderable: false,
    className: 'all column--large',
    render: renderCommitteeColumn
  },
  document_type: {
    data: 'document_description',
    className: 'all column--doc-download column--large',
    orderable: false,
    render: function(data, type, row) {
      var doc_description = row.document_description ? row.document_description : row.form_type;
      var pdf_url = row.pdf_url ? row.pdf_url : null;
      var csv_url = row.csv_url ? row.csv_url : null;
      var fec_url = row.fec_url ? row.fec_url : null;

      return reportType({
        doc_description: doc_description,
        pdf_url: pdf_url,
        fec_url: fec_url,
        csv_url: csv_url
      });
    }
  },
  receipt_date: receiptDateColumn,
  coverage_start_date: dateColumn({
    data: 'coverage_start_date',
    className: 'min-tablet hide-panel column--med',
    orderable: true
  }),
  coverage_end_date: dateColumn({
    data: 'coverage_end_date',
    className: 'min-tablet hide-panel column--med',
    orderable: true
  }),
  receipts: currencyColumn({
    data: 'total_receipts_period',
    className: 'min-desktop hide-panel column--number'
  }),
  disbursements: currencyColumn({
    data: 'total_disbursements_period',
    className: 'min-desktop hide-panel column--number'
  }),
  independentExpenditures: currencyColumn({
    data: 'independent_expenditures_period',
    className: 'min-desktop hide-panel column--number'
  }),
  contributions: currencyColumn({
    data: 'independent_contributions_period',
    className: 'min-desktop hide-panel column--number'
  }),
  trigger: {
    className: 'all column--trigger',
    orderable: false,
    render: function() {
      return tables.MODAL_TRIGGER_HTML;
    }
  }
};

var debts = [
  {
    data: 'committee',
    orderable: false,
    className: 'all column--large',
  },
  {
    data: 'creditor_debtor_name',
    orderable: false,
    className: 'all column--large',
  },
  {
    data: 'nature_of_debt',
    orderable: false,
    className: 'all column--med',
  },
  // dateColumn({data: 'date', className: 'min-tablet hide-panel column--med'}),
  currencyColumn({data: 'amount_incurred_period', className: 'min-desktop hide-panel column--number'}),
  currencyColumn({data: 'payment_period', className: 'min-desktop hide-panel column--number'}),
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
  receipts: receipts,
  reports: reports,
  debts: debts
};
