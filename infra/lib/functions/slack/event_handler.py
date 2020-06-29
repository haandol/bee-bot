import boto3

client = boto3.client('lex-runtime')


def handler(event, context):
    print(event)
    if 'challenge' in event:
        return event['challenge']

    client.post_text(
        botName='',
        botAlias='',
        userId='',
    )