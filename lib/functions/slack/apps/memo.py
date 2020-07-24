import re
import boto3
from . import on_command

KEY_PATH = '/BEEBOT/MEMO/'


def convert_key(key):
    if re.search(r'[^a-zA-Z0-9.-_]', key):
        return None
    return f'{KEY_PATH}{key}'


@on_command(['ㅁㅁ', '메모', 'memo'])
def run(robot, channel, user, tokens):
    '''메모를 해드립니다. - !memo 이름 "저장할 내용"'''
    robot.logger.debug(tokens)

    if len(tokens) == 0:
        params = robot.brain.get_list(KEY_PATH)
        msg = '최근 저장된 10개입니다\n'
        msg += '\n'.join((param['Name'].replace(KEY_PATH, '') for param in params))
        return channel, msg

    key = convert_key(tokens[0])
    if not key:
        return channel, f'{key}: 한글이나 특수문자는 이름으로 입력하실 수 없습니다.'

    if len(tokens) == 1:
        msg = robot.brain.get(key)
        if not msg:
            msg = f'{key} 으로 기억해둔 내용을 찾을 수 없습니다.'
    elif len(tokens) == 2:
        robot.brain.store(key, tokens[1])
        msg = f'{key} 를 잘 기억해두었습니다.'
    elif len(tokens) > 2:
        msg = '저장하실 내용에 띄어쓰기가 들어갈 경우 따옴표(")로 감싸보세요.'
    return channel, msg