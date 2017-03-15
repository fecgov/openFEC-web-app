const React = require('react');
const Dropdown = require('./filters/Dropdown');
const TextFilter = require('./filters/TextFilter');
const CheckboxFilter = require('./filters/CheckboxFilter');
const CheckboxList = require('./filters/CheckboxList');
const DateFilter = require('./filters/DateFilter');

function Filters(props) {
  const requestorOptions = [ {'value': 0, 'text': 'Any'},
    {'value': 1, 'text': 'Federal candidate/candidate committee/officeholder'},
    {'value': 2, 'text': 'Publicly funded candidates/committees'},
    {'value': 3, 'text': 'Party committee, national'},
    {'value': 4, 'text': 'Party committee, state or local'},
    {'value': 5, 'text': 'Nonconnected political committee'},
    {'value': 6, 'text': 'Separate segregated fund'},
    {'value': 7, 'text': 'Labor Organization'},
    {'value': 8, 'text': 'Trade Association'},
    {'value': 9, 'text': 'Membership Organization, Cooperative, Corporation W/O Capital Stock'},
    {'value': 10, 'text': 'Corporation (including LLCs electing corporate status)'},
    {'value': 11, 'text': 'Partnership (including LLCs electing partnership status)'},
    {'value': 12, 'text': 'Governmental entity'},
    {'value': 13, 'text': 'Research/Public Interest/Educational Institution'},
    {'value': 14, 'text': 'Law Firm'},
    {'value': 15, 'text': 'Individual'},
    {'value': 16, 'text': 'Other'}]

  const documentTypes = [{'value' : 'F', 'text': 'Final Opinion'},
   {'value' : 'V', 'text': 'Votes'},
   {'value' : 'D', 'text': 'Draft Documents'},
   {'value' : 'R', 'text': 'AO Request, Supplemental Material, and Extensions of Time'},
   {'value' : 'W', 'text': 'Withdrawal of Request'},
   {'value' : 'C', 'text': 'Comments and Ex parte Communications'},
   {'value' : 'S', 'text': 'Commissioner Statements'}]

  return <div>
            <TextFilter name="q" label="Keywords" value={props.query.q}
                handleChange={props.setQuery} getResults={props.getResults} />
            <TextFilter name="ao_name" label="AO name" value={props.query.ao_name}
                handleChange={props.setQuery} getResults={props.getResults} />
            <TextFilter name="ao_no" label="AO number" value={props.query.ao_no}
                handleChange={props.setQuery} getResults={props.getResults} />
            <DateFilter label="Issued date" min_name="ao_min_date" max_name="ao_max_date"
                min_value={props.query.ao_min_date} max_value={props.query.ao_max_date}
                handleChange={props.instantQuery} />
            <CheckboxList name="ao_category" label="Document Type" value={props.query.ao_category || ['F']}
                handleChange={props.instantQuery} options={documentTypes}/>
            <CheckboxFilter name="ao_is_pending" label="Show only pending requests"
                checked={props.query.ao_is_pending} handleChange={props.instantQuery} />
            <Dropdown name="ao_requestor_type" label="Requestor Type" value={props.query.ao_requestor_type}
              options={requestorOptions} handleChange={props.instantQuery} />
            <TextFilter name="ao_requestor" label="Requestor Name" value={props.query.ao_requestor}
                handleChange={props.setQuery} getResults={props.getResults} />
        </div>
}

module.exports = Filters;
