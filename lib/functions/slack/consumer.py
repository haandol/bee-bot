import os
import sys
import json
import boto3
import logging
import requests
import traceback
from importlib import import_module
sys.path.append(os.path.abspath('.'))

logger = logging.getLogger('consumter')
logger.setLevel(logging.INFO)

sqs = boto3.client('sqs')

TOKEN = os.environ['TOKEN']
QUEUE_URL = os.environ['QUEUE_URL']
CMD_PREFIX = os.environ.get('CMD_PREFIX', '!')
CMD_LENGTH = len(CMD_PREFIX)
APPS = json.loads(os.environ['APPS'])


consumer = None

class Consumer(object):
    def __init__(self, token, queue_url, logger):
        self.token = token
        self.queue_url = queue_url
        self.apps, self.docs = self.load_apps()
        self.logger = logger
        self.post_url = 'https://slack.com/api/chat.postMessage'

    def load_apps(self):
        docs = ['='*14, 'Usage', '='*14]
        apps = {}

        for name in APPS:
            app = import_module('apps.%s' % name)
            docs.append('{0}{1}: {2}'.format(
                CMD_PREFIX, ', '.join(app.run.commands), app.run.__doc__
            ))
            for command in app.run.commands:
                apps[command] = app

        return apps, docs

    def handle_data(self, data):
        channel, user, text = data

        command, payloads = self.extract_command(text)
        if not command:
            return

        app = self.apps.get(command, None)
        if not app:
            return

        try:
            app.run(self, channel, user, payloads)
        except:
            self.logger.error(traceback.format_exc())

    def extract_command(self, text):
        if CMD_PREFIX and CMD_PREFIX != text[0]:
            return (None, None)

        tokens = text.split(' ', 1)
        if 1 < len(tokens):
            return tokens[0][CMD_LENGTH:], tokens[1]
        else:
            return (text[CMD_LENGTH:], '')

    def post_message(self, channel, message):
        requests.post(url=self.post_url, data={
            'token': self.token,
            'channel': channel,
            'text': message,
        })


def handler(event, context):
    logger.info(event)

    global consumer
    if not consumer:
        consumer = Consumer(TOKEN, QUEUE_URL, logger)

    for record in event['Records']:
        receipt_handler = record['receiptHandle']
        body = json.loads(record['body'])
        data = (body['channel'], body['user'], body['text'])
        try:
            consumer.handle_data(data)
        except:
            traceback.print_exc()
        else:
            sqs.delete_message(
                QueueUrl=QUEUE_URL,
                ReceiptHandle=receipt_handler
            )