const $ = require('jquery');
const React = require('react');
const ReactDOM = require('react-dom');
const URI = require('urijs');
const Filters = require('./Filters');
const SearchResults = require('./SearchResults');
const Pagination = require('./Pagination');

class LegalSearch extends React.Component {
  constructor(props) {
    super(props);
    this.state = { q: $('#query').val(), from_hit: 0, advisory_opinions: []}

    this.getResults = this.getResults.bind(this);
    this.setQuery = this.setQuery.bind(this);
    this.instantQuery = this.instantQuery.bind(this);
    this.getResults();
  }

  setQuery(e) {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    this.setState({ [e.target.name]: value, lastFilter: e.target.name});
  }

  instantQuery(e) {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    this.setState({ [e.target.name]: value, lastFilter: e.target.name}, () => {
      this.getResults();
    });
  }

  getResults(e) {
    if(e) {
      e.preventDefault();
    }
    let queryPath = URI(window.API_LOCATION)
                .path([window.API_VERSION, 'legal', 'search'].join('/'))
                .addQuery('api_key', window.API_KEY)
                .addQuery('type', 'advisory_opinions');

    Object.keys(this.state).forEach((queryParam) => {
      if(['advisory_opinions', 'resultCount', 'lastResultCount', 'lastFilter'].indexOf(queryParam) === -1
          && this.state[queryParam]) {
        queryPath = queryPath.addQuery(queryParam, this.state[queryParam]);
      }
    })
    const lastResultCount = this.state.resultCount;
    $.getJSON(queryPath.toString(), (results) => {
                  this.setState({ advisory_opinions: results.advisory_opinions,
                  resultCount: results.total_advisory_opinions,
                  lastResultCount });
                });
  }

  render() {
    return <section className="main__content--full data-container__wrapper">
      <div id="filters" className="filters is-open">
        <button className="filters__header js-filter-toggle" type="button">
          <span className="filters__title">Edit filters</span>
        </button>
        <div className="filters__content">
          <div className="filters__inner">
              <Filters query={this.state} setQuery={this.setQuery}
                getResults={this.getResults} instantQuery={this.instantQuery} />
          </div>
        </div>
      </div>
      <div id="results-{{ result_type }}" className="content__section data-container__body">
        <div className="results-info results-info--simple">
          <div className="results-info__left">
            <h2 className="results-info__title">Searching Advisory Opinions</h2>
          </div>
        </div>
        <SearchResults advisory_opinions={this.state.advisory_opinions} q={this.state.q} />
        <Pagination from_hit={this.state.from_hit} advisory_opinions={this.state.advisory_opinions}
          resultCount={this.state.resultCount} handleChange={this.instantQuery} />
      </div>
    </section>
}
}

ReactDOM.render(
  <LegalSearch />,
  document.getElementById('root'));
