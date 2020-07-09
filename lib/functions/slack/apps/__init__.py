import re
import traceback
from functools import wraps

TOKENIZE_PATTERN = re.compile(r'["“](.+?)["”]|(\S+)', re.U | re.S)


def build_message(text='', attachments=[], unfurl_media=True, as_user=True):
    message = {
        'text': text,
        'as_user': as_user,
        'unfurl_media': unfurl_media,
    }
    if attachments:
        message.update({'attachments': attachments})
    return message


def _extract_tokens(message):
    '''Parse the given message, extract command and split'em into tokens

        Args:
            message (str): user gave message

        Returns:
            (list): tokens
    '''
    return list(filter(lambda x: x and x.strip(), TOKENIZE_PATTERN.split(message)))


def on_command(commands):
    def decorator(func):
        func.commands = commands

        @wraps(func)
        def _decorator(robot, channel, user, message):
            if commands:
                tokens = _extract_tokens(message)
                try:
                    channel, text = func(robot, channel, user, tokens)
                    robot.logger.debug('[Debug] message: {}'.format(text))
                    if channel:
                        robot.post_message(channel, text)
                        return text
                    else:
                        robot.logger.warning('Can not send to empty channel')
                except:
                    robot.logger.error('Can not deliver the message because...')
                    robot.logger.error(traceback.format_exc())
            return None
        return _decorator
    return decorator