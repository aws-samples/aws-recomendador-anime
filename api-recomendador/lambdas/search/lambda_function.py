import json
import os
import boto3
from botocore.exceptions import ClientError
from boto3.dynamodb.conditions import Attr


table_name = os.environ.get('TABLE_NAME')
index_name = os.environ.get('INDEX_NAME')
dynamo = boto3.resource('dynamodb')
anime_table = dynamo.Table(table_name)

def lambda_handler(event, context):
    REGION =os.environ.get('REGION')
 

    qs_params = event['queryStringParameters']

    nombre =  ""

    if (qs_params is not None) and ('nombre' in qs_params):
        nombre =  qs_params['nombre']


    anime_list = get_anime_ids_by_name(anime_table, index_name, nombre)
    return build_response(200, anime_list)



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


def myFunc(e):
    return float(e['Score'])

def get_anime_ids_by_name(table,index_name,  name):
    FilterExpression=Attr("Name_lower").contains(name.lower())
    response = table.scan(
        IndexName=index_name,
        FilterExpression=FilterExpression,
        
        )
    data = response.get('Items')
    
    data_full = add_anime_data(anime_table, data)
    print(data_full)
    data_full.sort(reverse=True,key=myFunc)
    return data_full
    

    


def add_anime_data(table,itemlist):
    list_with_data=[]
    for animeid in itemlist:
        anime=get_anime_data(table,animeid["MAL_ID"])
        anime['Score'] = 0 if anime['Score'] == 'Unknown' else anime['Score']
        list_with_data.append(anime)
    return list_with_data


def get_anime_data(table,anime_id):
    print (anime_id)
    item = table.get_item(Key={'MAL_ID': anime_id})
    return item.get('Item')
