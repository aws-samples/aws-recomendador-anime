import json

from  aws_cdk import (
    Duration,
    aws_lambda
)

from utils import load_config,save_config,  load_personalize_resources




config = load_config('project_config.json')

STACK_NAME = config['STACK_NAME']
TAGS = config['RESOURCE_TAGS']
REGION = config['REGION']
USE_ACCOUNT_PERSONALIZE_RESOURCES = config['USE_ACCOUNT_PERSONALIZE_RESOURCES']
ACCOUNT_RESOURCES = load_personalize_resources(REGION)
ACCOUNT_RESOURCES_REAL = ACCOUNT_RESOURCES['REAL_DATA']

if USE_ACCOUNT_PERSONALIZE_RESOURCES:
    ACCOUNT_RESOURCES = load_personalize_resources(REGION)
    ACCOUNT_RESOURCES_REAL = ACCOUNT_RESOURCES['REAL_DATA']
    ACCOUNT_RESOURCES_ANON = ACCOUNT_RESOURCES['ANON_DATA']
    config['APIS'] = ACCOUNT_RESOURCES_ANON['APIS']
    config['EVENT_TRACKERS'] = ACCOUNT_RESOURCES_ANON['EVENT_TRACKERS']
    config['FILTERS'] = ACCOUNT_RESOURCES_ANON['FILTERS']
    save_config(config, 'project_config.json')

APIS = ACCOUNT_RESOURCES_REAL['APIS']
EVENT_TRACKERS = ACCOUNT_RESOURCES_REAL['EVENT_TRACKERS']
FILTERS =  ACCOUNT_RESOURCES_REAL['FILTERS']

BASE_LAMBDA_CONFIG = dict (
    timeout=Duration.seconds(20),       
    memory_size=256,
    tracing= aws_lambda.Tracing.ACTIVE)

PYTHON_LAMBDA_CONFIG = dict (runtime=aws_lambda.Runtime.PYTHON_3_8, **BASE_LAMBDA_CONFIG)



BASE_ENV_VARIABLES = dict (REGION= REGION, FILTERS = json.dumps(FILTERS))

BASE_INTEGRATION_CONFIG =  dict(proxy=True,
    integration_responses=[{
        'statusCode': '200',
        'responseParameters': {
            'method.response.header.Access-Control-Allow-Origin': "'*'"
        }
    }])

BASE_METHOD_RESPONSE = dict(
    method_responses=[{
        'statusCode': '200',
        'responseParameters': {
            'method.response.header.Access-Control-Allow-Origin': True,
        }
    }]
)