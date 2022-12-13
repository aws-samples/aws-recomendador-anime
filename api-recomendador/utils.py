import json
import boto3

def load_config(conf_file):
    with open (conf_file, 'r') as f:
        cf = json.load(f)
    return cf

def save_config(config_data, conf_file):
    with open (conf_file, 'w') as f:
        json.dump(config_data, f)
    

def print_title(some_text):
    n = len(some_text)
    print ('='*(n+3),f'\n\n   {some_text}   \n\n', '='*(n+3),'\n')


def print_subtitle(some_text):
    n = len(some_text)
    print (f'\n- {some_text} \n', '-'*(n+3),'\n')



def load_personalize_resources(region_name):
    print_title('Personalize Resources')
    account_id = boto3.client('sts').get_caller_identity()['Account']
    account_id_anonymized = 'XXXXXX' + str(account_id)[6:]


    print (f'Account ID: {account_id_anonymized}')
    print (f'Region    : {region_name}')
    personalize_client = boto3.client('personalize', region_name=region_name)
    campaigns = get_personalize_campaigns(personalize_client)
    APIS = []
    APIS_ANON = [] 

    print_subtitle('Campañas:')

    for c in campaigns:
        if 'sims' in c['recipe']:
            c['type'] = 'sims'
        elif 'ranking' in c['recipe']:
            c['type'] = 'rerank'
        elif ('user-personalization' in c['recipe']) or ('hrnn' in c['recipe']) or ('popularity-count' in c['recipe']):
            c['type'] = 'recommend'
        
        print (c['name'],'(', c['type'],'):', c['arn'].replace(account_id, account_id_anonymized))

        APIS.append({
            'CAMPAIGN_ARN': c['arn'],
            'API_NAME': c['name'].lower(),
            'CAMPAIGN_TYPE': c['type']
        })

        APIS_ANON.append({
            'CAMPAIGN_ARN': c['arn'].replace(account_id, account_id_anonymized),
            'API_NAME': c['name'].lower(),
            'CAMPAIGN_TYPE': c['type']
        })

    
    e_trackers = get_personalize_event_trackers(personalize_client)
    EVENT_TRACKERS = []
    EVENT_TRACKERS_ANON = []
    print_subtitle('Event Trackers:')
    for et in e_trackers:
        print (et['name'],':', et['arn'].replace(account_id, account_id_anonymized))

        EVENT_TRACKERS.append({
            'TRACKING_ID' : et['trackingId'],
            'TRACKER_ARN': et['arn'],
            'API_NAME': et['name'].lower()
        })
        EVENT_TRACKERS_ANON.append({
            'TRACKING_ID' : et['trackingId'],
            'TRACKER_ARN': et['arn'].replace(account_id, account_id_anonymized),
            'API_NAME': et['name'].lower()
        })
    print_subtitle('Filters:')
    FILTERS = get_personalize_filters(personalize_client)
    FILTERS_ANON = [] 
    for fil in FILTERS:
        print (fil['name'],':', fil['filterArn'].replace(account_id, account_id_anonymized))

        FILTERS_ANON.append({
            'name': fil['name'],
            'filterArn': fil['filterArn'].replace(account_id, account_id_anonymized)
        })
    return {
        'REAL_DATA': {
            'APIS' : APIS,
            'EVENT_TRACKERS': EVENT_TRACKERS,
            'FILTERS': FILTERS
        },
        'ANON_DATA': {
            'APIS' : APIS_ANON,
            'EVENT_TRACKERS': EVENT_TRACKERS_ANON,
            'FILTERS': FILTERS_ANON
        }
    }





def get_personalize_campaigns(client):
    campaigns = client.list_campaigns()['campaigns']
    camps = []
    for c in campaigns:
        if c['status'] == 'ACTIVE':
            details = client.describe_campaign(campaignArn=c['campaignArn'])['campaign']
            solution_version_arn = details['solutionVersionArn']
            solution_details = client.describe_solution_version(solutionVersionArn=solution_version_arn)['solutionVersion']
            recipe_arn = solution_details['recipeArn']
            camps.append({
                'name': c['name'],
                'arn': c['campaignArn'],
                'recipe': recipe_arn.split('/')[-1]
            })
    return camps


def get_personalize_event_trackers(client):
    dsgs = client.list_dataset_groups()['datasetGroups']
    dsg_arns = []
    for dsg in dsgs:
        if dsg['status'] == 'ACTIVE':
            dsg_arns.append(dsg['datasetGroupArn'])
    
    event_trackers = []
    for dsg_arn in dsg_arns:
        e_trackers = client.list_event_trackers(datasetGroupArn=dsg_arn)['eventTrackers']
        for et in e_trackers:
            if et['status'] == 'ACTIVE':
                details = client.describe_event_tracker(eventTrackerArn=et['eventTrackerArn'])['eventTracker']
                event_trackers.append({
                    'name': et['name'], 
                    'arn':et['eventTrackerArn'],
                    'trackingId': details['trackingId']
                    })

    return event_trackers


def get_personalize_filters(client):
    dsgs = client.list_dataset_groups()['datasetGroups']
    dsg_arns = []
    for dsg in dsgs:
        if dsg['status'] == 'ACTIVE':
            dsg_arns.append(dsg['datasetGroupArn'])
    
    filters = []
    for dsg_arn in dsg_arns:
        ffilters = client.list_filters(datasetGroupArn=dsg_arn)['Filters']
        for ffilter in ffilters:
            if ffilter['status'] == 'ACTIVE':
                filters.append({'name': ffilter['name'], 'filterArn':ffilter['filterArn']})

    return filters