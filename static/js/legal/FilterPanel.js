const React = require('react');

class FilterPanel extends React.Component {
constructor(props) {
  super(props);
  this.state = {expanded: props.startOpen};
  this.getDisplay = this.getDisplay.bind(this);
  this.toggle = this.toggle.bind(this);
}

getDisplay() {
  return this.state.expanded ? 'block' : 'none';
}

toggle() {
  this.setState({'expanded': !this.state.expanded});
}

render() {
    return <li>
      <button className="accordion__button" aria-controls={this.props.id} aria-expanded={this.state.expanded}
      onClick={this.toggle}>
        {this.props.header}
      </button>
      <div className="accordion__content" id={this.props.id} aria-hidden={!this.state.expanded} style={{display: this.getDisplay()}}>
        {this.props.content}
      </div>
    </li>
}
}

module.exports = FilterPanel;
