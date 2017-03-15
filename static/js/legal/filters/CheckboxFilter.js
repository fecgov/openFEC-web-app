const React = require('react');

function CheckboxFilter(props) {
    return <div className="filter">
      <input type="checkbox" id={props.name} name={props.name}
        onChange={props.handleChange} checked={props.checked} />
      <label htmlFor={props.name}>{props.label}</label>
    </div>
}

module.exports = CheckboxFilter;
