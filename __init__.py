from openfecwebapp.local_config import port, debug, host
from flask import Flask, render_template, request
from openfecwebapp.views import render_search_results, render_table, render_page

app = Flask(__name__)

@app.route('/')
def home_page():
    return render_template('search.html');

@app.route('/search')
def search():
    query = request.args.get('search')
    if query:
        return render_search_results(query)
    else:
        return home_page()

@app.route('/candidates/<c_id>')
def candidate_page(c_id):
    return render_page('candidate', c_id)

@app.route('/committees/<c_id>')
def committee_page(c_id):
    return render_page('committee', c_id)

@app.route('/candidates')
def candidates():
    return render_table('candidates', request.args, request.url)

@app.route('/committees')
def committees():
    return render_table('committees', request.args, request.url)

@app.errorhandler(404)
def page_not_found(e):
    return render_template('404.html'), 404

@app.errorhandler(500)
def server_error(e):
    return render_template('500.html'), 500

if __name__ == '__main__':
    app.run(host=host, port=port, debug=debug)
