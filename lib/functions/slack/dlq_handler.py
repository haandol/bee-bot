import os
import boto3
import logging

logger = logging.getLogger('dlq')
logger.setLevel(logging.INFO)

queue_url = os.environ['QUEUE_URL']
sqs = boto3.client('sqs')


def handler(event, context):
    logger.info(event)

    for record in event['Records']:
        receipt_handler = record['receiptHandle']
        sqs.delete_message(
            QueueUrl=queue_url,
            ReceiptHandle=receipt_handler
        )