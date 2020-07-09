def handler(event, context):
    print(event)
    response = {
        'dialogAction': {
            'type': 'Close',
            'fulfillmentState': 'Fulfilled',
            'message': {
                'contentType': 'PlainText',
                'content': 'Thanks, your pizza has been ordered.',
            },
        }
    }
    return response