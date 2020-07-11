#!/usr/bin/env python
import boto3
import argparse
from pprint import pprint

ssm = boto3.client('ssm')

ACCESS_TOKEN_KEY = '__slack_access_token__'
VERFICATION_TOKEN_KEY = '__slack_verification_token__'


def parse_args():
    parser = argparse.ArgumentParser(description='Set SLACK token into AWS SSM Parameter Store')
    parser.add_argument('--access-token', type=str, required=True,
                        help='Bot access token for bot. (like, xoxb-1234..-1234..-xyzx..)')
    parser.add_argument('--verification-token', type=str, required=True,
                        help='Signing secret for verification requests. (like, 098e321cb5f8c794e9a988fac623fe60')
    return parser.parse_args()


if __name__ == '__main__':
    args = parse_args()
    access_token = args.access_token
    verification_token = args.verification_token

    # update access token
    ssm.put_parameter(
        Name=ACCESS_TOKEN_KEY,
        Value=access_token,
        Type='SecureString',
        Overwrite=True
    )
    pprint(ssm.get_parameter(Name=ACCESS_TOKEN_KEY, WithDecryption=True)['Parameter'])

    # update verification token
    ssm.put_parameter(
        Name=VERFICATION_TOKEN_KEY,
        Value=verification_token,
        Type='SecureString',
        Overwrite=True
    )
    pprint(ssm.get_parameter(Name=VERFICATION_TOKEN_KEY, WithDecryption=True)['Parameter'])
