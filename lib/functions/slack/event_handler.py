import os
import json
import boto3
import logging
import traceback
logger = logging.getLogger('event-handler')
logger.setLevel(logging.INFO)

sqs = boto3.client('sqs')
ssm = boto3.client('ssm')

queue_url = os.environ['QUEUE_URL']
VERIFICATION_TOKEN_KEY = os.environ['VERIFICATION_TOKEN_KEY']
CMD_PREFIX = os.environ['CMD_PREFIX']

VERIFICATION_TOKEN = None


def handler(event, context):
    logger.debug(event)

    if event['token'] != get_veification_token():
        logger.error('Invalid token')
        get_veification_token(False)
        return

    if 'challenge' in event:
        return event['challenge']

    if 'bot_id' in event['event']:
        return

    text = event['event']['text']
    if CMD_PREFIX and not text.startswith(CMD_PREFIX):
        return

    body = json.dumps({
        'channel': event['event']['channel'],
        'user': event['event']['user'],
        'text': text,
    })
    sqs.send_message(
        QueueUrl=queue_url,
        MessageBody=body
    )


def get_veification_token(cache=True):
    global VERIFICATION_TOKEN
    if not (cache and VERIFICATION_TOKEN):
        try:
            resp = ssm.get_parameter(Name=VERIFICATION_TOKEN_KEY, WithDecryption=True)
            VERIFICATION_TOKEN = resp['Parameter']['Value']
        except:
            logger.error(traceback.format_exc())
    return VERIFICATION_TOKEN