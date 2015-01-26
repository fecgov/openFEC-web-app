from config import port
from flask import Flask, render_template, request
from views import render_search_results, render_table, render_page

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

@app.route('/candidates')
def candidates():
    return render_table('candidates', request.args)

@app.route('/committees')
def committees():
    return render_table('committees', request.args)

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=port, debug=True)
