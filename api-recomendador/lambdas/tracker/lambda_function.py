import json
import os
import uuid
import time
import boto3
from botocore.exceptions import ClientError


def lambda_handler(event, context):
    REGION =os.environ.get('REGION')
    TRACKING_ID = os.environ.get('TRACKING_ID')
    print (event)
    # ** --------------------------------
    # ** REGISTRAR EVENTO NUEVO
    # ** --------------------------------

    pathParameters = event['pathParameters']

    if not 'userId' in pathParameters:
        return build_response(400, 'missing userId')

    userId = pathParameters['userId']
    body = json.loads(event['body'])

    if body is None:
        return build_response(400, 'missing body')

    if not 'itemId' in body:
        return build_response(400, 'missing itemId')

    itemId = body['itemId']

     
    eventType = body['eventType'] if 'eventType' in body else None
    eventValue = body['eventValue'] if 'eventValue'  in body else None

    
    if 'sessionId' in body:
        sessionId = body['sessionId']
    else:
        sessionId = str(uuid.uuid1())

    
    personalize_events = boto3.client(service_name='personalize-events', region_name=REGION)

    the_event = {
        'sentAt': int(time.time()),
        'properties': json.dumps({"itemId": str(itemId)})
    }

    if eventType:
        the_event['eventType'] = eventType
    
    if eventValue:
        the_event['eventValue'] = eventValue

    
    try:
        args = dict(
            trackingId = TRACKING_ID,
            userId= userId,
            sessionId = sessionId,
            eventList = [the_event]
        )
        put_event_response = personalize_events.put_events(**args)

        print (put_event_response)
        return build_response(200, put_event_response)
    except ClientError as error:
        print (error.response['Error']['Code'], error.response['Error'])
        return build_response(error.response['Error']['Code'], error.response['Error'])
    except BaseException as error:
        print("Unknown error while executing: " + str(error))
        build_response(500, error.response['Error'])



def build_response(status_code, json_content):
        return {
        'statusCode': status_code,
        "headers": {
            "Access-Control-Allow-Origin":"*",
			"Content-Type": "application/json",
			"Access-Control-Allow-Methods" : "GET, OPTIONS, POST, DELETE",
        },
        'body': json.dumps({'data':json_content})
    }
