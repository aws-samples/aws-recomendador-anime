import aws_cdk as core
import aws_cdk.assertions as assertions

from api_recomendador.api_recomendador_stack import ApiRecomendadorStack

# example tests. To run these tests, uncomment this file along with the example
# resource in api_recomendador/api_recomendador_stack.py
def test_sqs_queue_created():
    app = core.App()
    stack = ApiRecomendadorStack(app, "api-recomendador")
    template = assertions.Template.from_stack(stack)

#     template.has_resource_properties("AWS::SQS::Queue", {
#         "VisibilityTimeout": 300
#     })
