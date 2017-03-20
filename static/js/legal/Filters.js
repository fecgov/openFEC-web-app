const React = require('react');
const Dropdown = require('./filters/Dropdown');
const TextFilter = require('./filters/TextFilter');
const CheckboxFilter = require('./filters/CheckboxFilter');
const CheckboxList = require('./filters/CheckboxList');
const DateFilter = require('./filters/DateFilter');
const CitationFilter = require('./filters/CitationFilter');
const CitationRequireAllRadio = require('./filters/CitationRequireAllRadio');
const FilterPanel = require('./FilterPanel');

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
            <TextFilter key="ao_no" name="ao_no" label="AO number" value={props.query.ao_no}
                handleChange={props.setQuery} getResults={props.getResults} />,
            <TextFilter key="ao_requestor" name="ao_requestor" label="Requestor Name (or AO Name)" value={props.query.ao_requestor}
                  handleChange={props.setQuery} getResults={props.getResults} />,
              <Dropdown key="ao_requestor_type" name="ao_requestor_type" label="Requestor Type" value={props.query.ao_requestor_type}
                options={requestorOptions} handleChange={props.instantQuery} />
            <ul className="accordion--neutral" data-content-prefix="first">
              <FilterPanel id="first-content-0" header="Documents" startOpen={true}
                  content={[<TextFilter key="q" name="q" label="Keywords" value={props.query.q}
                  handleChange={props.setQuery} getResults={props.getResults} />,
                <CheckboxFilter key="ao_is_pending" name="ao_is_pending" label="Show only pending requests"
                    checked={props.query.ao_is_pending} handleChange={props.instantQuery} />,
                <CheckboxList key="ao_category" name="ao_category" label="Document Type" value={props.query.ao_category || ['F']}
                    handleChange={props.instantQuery} options={documentTypes}/>]} />
              <FilterPanel id="first-content-1" header="Citations"
                  content={[<CitationRequireAllRadio key="ao_citation_require_all" name="ao_citation_require_all" handleChange={props.instantQuery}
                    value={props.query.ao_citation_require_all} />,
                  <CitationFilter handleChange={props.setQuery} getResults={props.getResults}
                      key="ao_regulatory_citation" name="ao_regulatory_citation" label="Regulatory citation" instantQuery={props.instantQuery}
                      citationType="regulation" value={props.query.ao_regulatory_citation}/>,
                    <CitationFilter handleChange={props.setQuery} getResults={props.getResults}
                      key="ao_statutory_citation" name="ao_statutory_citation" label="Statutory citation" instantQuery={props.instantQuery}
                      citationType="statute" value={props.query.ao_statutory_citation}/>]} />
              <FilterPanel id="first-content-2" header="Documents"
                  content={[<DateFilter key="issue_date" label="Issued date" min_name="ao_min_date" max_name="ao_max_date"
                    min_value={props.query.ao_min_date} max_value={props.query.ao_max_date}
                    handleChange={props.instantQuery} />]} />
              </ul>
            </div>
}

module.exports = Filters;
