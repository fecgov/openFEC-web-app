from flask import Flask

app = Flask('openfecwebapp', static_path='/static', static_folder='../dist')
