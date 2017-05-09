#!flask/bin/python3.6

# emfwd.py
# Email Forwarder Simple Daemon

from flask import Flask, jsonify, make_response, current_app, \
    request, session, g, redirect, url_for, abort, \
    render_template, flash, send_from_directory
import httplib2
import os
import jinja2
import sys
import traceback
from collections import namedtuple

from apiclient import discovery
from oauth2client import client, tools
from oauth2client.file import Storage

app = Flask(__name__)

SCOPES = 'https://www.googleapis.com/auth/drive.metadata.readonly'
CLIENT_SECRET_FILE = 'client_secret2.json'
APPLICATION_NAME = 'emfwd'
home_dir = os.path.expanduser('~')
EmailMap = namedtuple('EmailMap', ['from_email', 'to_email'])

def get_credentials():
    """Gets valid user credentials from storage.
    """
    credential_dir = os.path.join(home_dir, '.googleapis')
    if not os.path.exists(credential_dir):
        os.makedirs(credential_dir)
    credential_path = os.path.join(credential_dir, 'emfwd-cred.json')
    client_secrets = os.path.join(home_dir, CLIENT_SECRET_FILE)
    try:
        store = Storage(credential_path)
        credentials = store.get()
        if not credentials or credentials.invalid:
            flow = client.flow_from_clientsecrets(client_secrets, scope=SCOPES)
            flow.user_agent = APPLICATION_NAME
            credentials = tools.run_flow(flow, store, flags)
            print('Storing credentials to ' + credential_path)
        return credentials
    except:
        exc = sys.exc_info()
        print("Unexpected error:", exc)
        traceback.print_tb(exc[2])
        return "Unexpected error"

@app.route('/')
def info():
    h = jinja2.Template('{{ name }} server running')
    return h.render(name=APPLICATION_NAME)

def root_path():
    return current_app.root_path

@app.route('/js/<string:filename>', methods=['GET'])
def download_js(filename):
    dirpath = os.path.join(root_path(), '../js')
    print('js path', dirpath)
    return send_from_directory(directory=dirpath, filename=filename)

@app.route('/assets/<string:filename>', methods=['GET'])
def download_asset(filename):
    dirpath = os.path.join(root_path(), '../assets')
    print('asset path', dirpath)
    return send_from_directory(directory=dirpath, filename=filename)

@app.route('/showdir')
def edit_dir():
    items = []
    with open("virtual.txt","r") as text:
        for line in text:
            from_email, to_email = line.split()
            e = EmailMap(from_email, to_email)
            print('{},{}'.format(e.from_email, e.to_email))
            items.append(e)

    loader = jinja2.FileSystemLoader('./templates/edit_files.html')
    env = jinja2.Environment(loader=loader)
    template = env.get_template('')
    return template.render(items=items)

@app.route('/showdir2')
def show_dir2():
    credentials = get_credentials()
    http = credentials.authorize(httplib2.Http())
    service = discovery.build('drive', 'v3', http=http)

    results = service.files().list(
        fields="files(id, name)",maxResults=100).execute()
    items = results.get('files', [])

    loader = jinja2.FileSystemLoader('./templates/show_dir.html')
    env = jinja2.Environment(loader=loader)
    template = env.get_template('')
    return template.render(items=items)

if __name__ == '__main__':
    app.run(host='0.0.0.0:5000',debug=True)
    #show_dir()
