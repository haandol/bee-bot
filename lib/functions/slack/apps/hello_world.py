from . import on_command

@on_command(['ㅎㅇ', '하이', 'hi'])
def run(robot, channel, user, tokens):
    '''헬로월드를 출력'''
    return channel, 'hello world'