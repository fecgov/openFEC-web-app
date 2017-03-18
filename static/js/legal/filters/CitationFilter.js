const React = require('react');
const URI = require('urijs');
const $ = require('jquery');

class CitationFilter extends React.Component {
    constructor(props) {
      super(props);
      this.state = { citations: [], dropdownVisible: false }
      this.interceptChange = this.interceptChange.bind(this);
      this.setSelection = this.setSelection.bind(this);
      this.dropdownDisplay = this.dropdownDisplay.bind(this);
      this.hideDropdown = this.hideDropdown.bind(this);
      this.interceptGetResults = this.interceptGetResults.bind(this);
    }

    interceptChange(e) {
        if(e.target.value) {
          const path = URI(window.API_LOCATION)
                      .path([window.API_VERSION, 'legal', 'citation', e.target.value].join('/'))
                      .addQuery('api_key', window.API_KEY);
          $.getJSON(path.toString(), (result) => {
            this.setState({citations: result.citations, dropdownVisible: true});
          });
        } else {
          this.setState({citations: [], dropdownVisible: false});
        }

        this.props.handleChange(e);
    }

    interceptGetResults() {
      this.setState({citations: [], dropdownVisible: false});
      this.props.getResults()
    }

    setSelection(citation) {
      const syntheticEvent = { target: {name: this.props.name, value: citation } };
      this.props.handleChange(syntheticEvent);
      this.setState({dropdownVisible: false});
    }

    dropdownDisplay() {
      return this.state.dropdownVisible ? 'block' : 'none';
    }

    hideDropdown(e) {
      this.setState({dropdownVisible: false});
    }

    render() {
      return <div className="filter" onBlur={this.hideDropdown}>
          <label className="label" htmlFor={this.props.name + "-filter"}>{this.props.label}</label>
          <div className="combo combo--search--mini"  style={{position: 'relative', display: 'block'}}>
            <input id={this.props.name + "-filter"} type="text" name={this.props.name} className="combo__input"
                value={this.props.value || ''} onChange={this.interceptChange}/>
            <button className="combo__button button--search button--standard"
             onClick={this.interceptGetResults}>
              <span className="u-visually-hidden">Search</span>
            </button>
          <div className="tt-menu" aria-live="polite"
           style={{position: 'absolute', top: '100%', left: '0px', zIndex: 100, display: this.dropdownDisplay()}}>
          <div className="tt-dataset tt-dataset-candidate">
          <span className="tt-suggestion__header">Select a citation:</span>
          {this.state.citations.map((citation) => {
              return <div key={citation.text} onMouseDown={() => this.setSelection(citation.text)}
                className="selectCitation"><span className="tt-suggestion tt-selectable">
              <span className="tt-suggestion__name">{citation.text}</span>
              </span></div>
            })}
          </div></div></div></div>
}}

module.exports = CitationFilter;
