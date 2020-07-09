import os
import json
import boto3
import logging

logger = logging.getLogger('event-handler')
logger.setLevel(logging.INFO)

queue_url = os.environ['QUEUE_URL']
sqs = boto3.client('sqs')


def handler(event, context):
    logger.info(event)
    if 'challenge' in event:
        return event['challenge']

    if 'bot_id' in event['event']:
        return

    body = json.dumps({
        'token': event['token'],
        'channel': event['event']['channel'],
        'user': event['event']['user'],
        'text': event['event']['text'],
    })
    sqs.send_message(
        QueueUrl=queue_url,
        MessageBody=body
    )