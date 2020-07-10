#!/usr/bin/env python
import boto3
import argparse
from pprint import pprint


def parse_args():
    parser = argparse.ArgumentParser(description='Set SLACK token into AWS SSM Parameter Store')
    parser.add_argument('--name', type=str, default='slack_token',
                        help='Name of parameter key for SSM')
    parser.add_argument('--token', type=str, required=True,
                        help='SLACK token for bot. (like, xoxb-1234..-1234..-xyzx..)')
    return parser.parse_args()


if __name__ == '__main__':
    ssm = boto3.client('ssm')
    args = parse_args()
    name = args.name
    token = args.token
    ssm.put_parameter(Name=name, Value=token, Type='SecureString', Overwrite=True)
    pprint(ssm.get_parameter(Name=name, WithDecryption=True)['Parameter'])
