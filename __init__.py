from config import port
from flask import Flask, render_template, request
from search import get_search_results

app = Flask(__name__)

@app.route('/')
def home_page():
    return render_template('search.html');

@app.route('/search')
def search():
    search_query = request.args.get('search')
    if search_query:
        return get_search_results(search_query)
    else:
        return home_page()

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=port,  debug=True)

