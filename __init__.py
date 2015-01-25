from config import port
from flask import Flask, render_template, request
from search import get_search_results, get_candidates

app = Flask(__name__)

@app.route('/')
def home_page():
    return render_template('search.html');

@app.route('/search')
def search():
    query = request.args.get('search')
    if query:
        return get_search_results(query)
    else:
        return home_page()

@app.route('/candidates')
def candidates():
    return get_candidates()

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=port,  debug=True)

