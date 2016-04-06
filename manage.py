#!/usr/bin/env python

from flask_script import Manager, Server

from openfecwebapp.app import app

manager = Manager(app)
manager.add_command(
    'runserver',
    Server(
        port=3000,
        use_debugger=True,
        use_reloader=True,
        extra_files=['./rev-manifest.json'],
    ),
)

if __name__ == '__main__':
    manager.run()
