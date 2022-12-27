import json 
from constructs import Construct
from aws_cdk import (
    aws_lambda,
    aws_iam ,
    aws_ssm as ssm,
    aws_apigateway,
    aws_dynamodb as ddb,
    CfnOutput
    
)

from configure import ( 
    APIS, 
    EVENT_TRACKERS, 
    PYTHON_LAMBDA_CONFIG, 
    BASE_ENV_VARIABLES, 
    BASE_INTEGRATION_CONFIG,
    BASE_METHOD_RESPONSE)




class ApiPersonalize(Construct):

    def __init__(self, scope: Construct, construct_id: str, **kwargs) -> None:
        super().__init__(scope, construct_id, **kwargs)

        anime_table = ddb.Table(
            self, "anime_table", partition_key=ddb.Attribute(name="MAL_ID", type=ddb.AttributeType.STRING))

        anime_table.add_global_secondary_index(
            index_name='Name-index',
            partition_key=ddb.Attribute(name="Name_lower", type=ddb.AttributeType.STRING), 
            projection_type=ddb.ProjectionType.KEYS_ONLY
        )

        base_api = aws_apigateway.RestApi( self, 'personalize')

        for api in APIS:
            if api['CAMPAIGN_TYPE'] == 'recommend':

                # ** --------------------------------
                # ** RECOMENDADOR DE PRODUCTOS
                # ** --------------------------------
                
                self.make_resource(
                    base_api = base_api, 
                    api_data = api, 
                    resource_name = '{userId}', 
                    methods = ['GET'], 
                    backend_code = aws_lambda.Code.from_asset("./lambdas/personalization"), 
                    table=anime_table
                ) 

            if api['CAMPAIGN_TYPE'] == 'sims':

                # ** --------------------------------
                # ** SIMILAR ITEMS
                # ** --------------------------------

                self.make_resource(
                    base_api = base_api, 
                    api_data = api, 
                    resource_name = '{itemId}', 
                    methods = ['GET'], 
                    backend_code = aws_lambda.Code.from_asset("./lambdas/sims"),
                    table=anime_table
                ) 

            if api['CAMPAIGN_TYPE'] == 'rerank':

            # ** --------------------------------
            # ** RERANKING
            # ** --------------------------------

                self.make_resource(
                    base_api = base_api, 
                    api_data = api, 
                    resource_name = '{userId}', 
                    methods = ['GET'], 
                    backend_code = aws_lambda.Code.from_asset("./lambdas/rerank"),
                    table=anime_table
                )    

            # ** --------------------------------
            # ** SEARCH
            # ** --------------------------------

        self.make_resource(
            base_api = base_api, 
            api_data = {'API_NAME':'search', 'CAMPAIGN_ARN':'"arn:aws:personalize:*:*:campaign/*'}, 
            resource_name = 'search', 
            methods = ['GET'], 
            backend_code = aws_lambda.Code.from_asset("./lambdas/search"),
            table=anime_table
        )    

        self.make_resource(
            base_api = base_api, 
            api_data = {'API_NAME':'anime', 'CAMPAIGN_ARN':'"arn:aws:personalize:*:*:campaign/*'}, 
            resource_name = '{MAL_ID}', 
            methods = ['GET'], 
            backend_code = aws_lambda.Code.from_asset("./lambdas/get_anime"),
            table=anime_table
        )  

        if len(EVENT_TRACKERS):

            # ** --------------------------------
            # ** EVENT TRACKERS
            # ** --------------------------------

            for et_data in EVENT_TRACKERS:
                self.make_event_tracker(
                    base_api = base_api, 
                    api_data = et_data, 
                    resource_name = '{userId}',  
                    backend_code = aws_lambda.Code.from_asset("./lambdas/tracker")
                ) 

        


    def make_event_tracker(self, base_api, api_data, resource_name, backend_code):
        lambda_backend = aws_lambda.Function(
            self,api_data['API_NAME'] + "_lambda" ,handler="lambda_function.lambda_handler",
            code=backend_code,**PYTHON_LAMBDA_CONFIG, 
            environment=json.loads(json.dumps(dict(
                TRACKING_ID =api_data['TRACKING_ID'],
                **BASE_ENV_VARIABLES)))
        )

        lambda_backend.add_to_role_policy(
            aws_iam.PolicyStatement(
                actions=["personalize:PutEvents"], 
                resources=['*']))

        new_api = base_api.root.add_resource(api_data['API_NAME'])
        new_resource = new_api.add_resource(resource_name)

        new_resource.add_method(
            'POST' , aws_apigateway.LambdaIntegration(lambda_backend,**BASE_INTEGRATION_CONFIG), 
            **BASE_METHOD_RESPONSE
        )
        
        self.add_cors_options(new_resource)

        CfnOutput(self, api_data['API_NAME'] + "_out",value=base_api.url_for_path(path=new_resource.path))

    def make_resource(self, base_api, api_data,resource_name, methods, backend_code,table):
        CAMPAIN_ARN = api_data['CAMPAIGN_ARN']
        parts = CAMPAIN_ARN.split(':')
        parts.pop()
        FILTERS_ARN = ':'.join(parts) + ':filter/*'

        lambda_backend = aws_lambda.Function(
            self,api_data['API_NAME'] + "_lambda" ,handler="lambda_function.lambda_handler",
            code=backend_code,**PYTHON_LAMBDA_CONFIG, 
            environment=json.loads(json.dumps(dict(
                CAMPAIN_ARN =CAMPAIN_ARN,
                TABLE_NAME=table.table_name,
                INDEX_NAME = 'Name-index',
                **BASE_ENV_VARIABLES)))
        )
        table.grant_read_data(lambda_backend)

        lambda_backend.add_to_role_policy(
            aws_iam.PolicyStatement(
                actions=["personalize:GetPersonalizedRanking", "personalize:GetRecommendations"], 
                resources=[CAMPAIN_ARN, FILTERS_ARN]))

        new_api = base_api.root.add_resource(api_data['API_NAME'])
        new_resource = new_api.add_resource(resource_name)

        for m in methods:
            new_resource.add_method(
                m , aws_apigateway.LambdaIntegration(lambda_backend,**BASE_INTEGRATION_CONFIG), 
                **BASE_METHOD_RESPONSE
            )
        
        self.add_cors_options(new_resource)

        CfnOutput(self, api_data['API_NAME'] + "_out",value=base_api.url_for_path(path=new_resource.path))

    def add_cors_options(self, apigw_resource):
        apigw_resource.add_method(
            'OPTIONS',
            aws_apigateway.MockIntegration(integration_responses=[{
                'statusCode': '200',
                'responseParameters': {
                    'method.response.header.Access-Control-Allow-Headers':
                    "'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token'",
                    'method.response.header.Access-Control-Allow-Origin': "'*'",
                    'method.response.header.Access-Control-Allow-Methods':
                    "'GET,POST,OPTIONS,DELETE'"
                }
            }],
                passthrough_behavior=aws_apigateway.
                PassthroughBehavior.WHEN_NO_MATCH,
                request_templates={
                "application/json":
                "{\"statusCode\":200}"
            }),
            method_responses=[{
                'statusCode': '200',
                'responseParameters': {
                    'method.response.header.Access-Control-Allow-Headers':
                    True,
                    'method.response.header.Access-Control-Allow-Methods':
                    True,
                    'method.response.header.Access-Control-Allow-Origin': True,
                }
            }],
        )