const React = require('react');
const $ = require('jquery');

function SearchResults(props) {
  function highlights(advisory_opinion) {
    return {__html: '&hellip;' + advisory_opinion.highlights }
  }
  if(props.advisory_opinions && props.advisory_opinions.length > 0) {
    return <ul>{ props.advisory_opinions.map((advisory_opinion) => {
        return <div key={advisory_opinion.no}><h3 className="cal-list__title">
          <a title={ advisory_opinion.description }
            href="{ url_for('advisory_opinion_page', ao_no=advisory_opinion.no) }">
            <span className="font-bolt">AO { advisory_opinion.no }: </span></a>
            <span className="t-normal">{ advisory_opinion.name }</span>
        <p className="u-padding--top">
        <span className="t-bold">Summary: </span> <span className="t-normal">
          { advisory_opinion.summary }
        </span>
        </p>
        </h3>
        <div className="u-padding--left">
        <table>
          <tbody>
          <tr className="legal-search-result">
            <td>
              <div className="t-serif legal-search-result__hit u-padding--top"
              dangerouslySetInnerHTML={ highlights(advisory_opinion) }></div>
            </td>
          </tr>
          </tbody>
        </table>
        </div>
        </div> }) }</ul>
  } else {
    return <div className="message message--no-icon">
      <h2 className="message__title">No results</h2>
      <p>Sorry, we didn&rsquo;t find any documents matching { props.query }.</p>
      <div className="message--alert__bottom">
        <p>Think this was a mistake?</p>
        <ul className="list--buttons">
          {props.query && <li><a className="button button--standard" href="http://search04.fec.gov/vivisimo/cgi-bin/query-meta?v%3Asources=Administrative_Fine%2CAdvisory_Opinion%2CAlternative_Dispute_Resolution%2CAudit_Reports%2CMatters_Under_Review%2CMatters_Under_Review_Archived%2CRulemaster%2CCandidate_Summary%2CCommittee_Summary%2Cfec.gov&query={{ query }}&x=0&y=0&v%3aproject=fec_search_02_prj&v%3aframe=form&form=advanced-fec&">Try FEC.gov</a></li>}
          <li><a className="button button--standard" href={ "mailto:" + $('#contact-email').val() }>Email our team</a></li>
          <li><a className="button button--standard" href="https://github.com/18f/fec/issues">File an issue</a></li>
        </ul>
      </div>
    </div>
  }
}

module.exports = SearchResults;
