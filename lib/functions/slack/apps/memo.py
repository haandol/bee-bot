import boto3
from . import on_command


def get_key(key):
    PREFIX = '__BEEBOT_MEMO_'
    return f'{PREFIX}{key}'


@on_command(['ㅁㅁ', '메모', 'memo'])
def run(robot, channel, user, tokens):
    '''메모를 해드립니다'''
    robot.logger.info(tokens)

    msg = '요청하신 작업을 수행할 수 없습니다. 로그를 확인해주세요.'
    if len(tokens) == 1:
        msg = robot.brain.get(get_key(tokens[0]))
        if not msg:
            msg = f'{tokens[0]} 으로 기억해둔 내용을 찾을 수 없습니다.'
    elif len(tokens) == 2:
        robot.brain.store(get_key(tokens[0]), tokens[1])
        msg = f'{tokens[0]} 를 잘 기억해두었습니다.'
    elif len(tokens) > 2:
        msg = '저장하실 내용에 띄어쓰기가 들어갈 경우 따옴표(")로 감싸보세요.'
        
    return channel, msg