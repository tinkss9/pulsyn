#!/usr/bin/env python3
"""
Pulsyn Brain Agent — Strategy & Prioritization

This script categorizes connectors and prioritizes them for development.
"""

import json
import os
from pathlib import Path

# Connector categories
QUICK_WINS = [
    'postgresql', 'mysql', 'mongodb', 'redis', 'mssql',
    'oracle', 'cassandra', 'clickhouse', 'dynamodb', 'elasticsearch',
    'salesforce', 'hubspot', 'stripe', 'shopify', 'slack',
    'jira', 'github', 'gitlab', 'notion', 'airtable',
    's3', 'gcs', 'azure-blob', 'bigquery', 'snowflake',
    'kafka', 'kinesis', 'redshift', 'databricks', 'supabase',
    'r2', 'kinesis', 'eventbridge', 'pulsar', 'rabbitmq',
    'minio', 'digitalocean-spaces', 'tableau', 'looker', 'power-bi',
    'metabase', 'superset', 'grafana', 'redash', 'mode',
    'sigma', 'thoughtspot', 'pipedrive', 'close', 'copper',
]

COMMON_SAAS = [
    'freshsales', 'zoho-crm', 'dynamics-365', 'sugarcrm', 'insightly',
    'nimble', 'agile-crm', 'teams', 'discord', 'twilio',
    'sendgrid', 'mailchimp', 'intercom', 'zendesk', 'freshdesk',
    'drift', 'crisp', 'basecamp', 'wrike', 'smartsheet',
    'teamwork', 'height', 'plane', 'shortcut', 'youtrack',
    'pivotal-tracker', 'clubhouse', 'figma', 'canva', 'miro',
    'loom', 'calendly', 'zoom', 'google-calendar', 'outlook-calendar',
    'google-drive', 'dropbox', 'box', 'onedrive', 'sharepoint',
    'confluence', 'gitbook', 'bitbucket', 'azure-repos', 'harness',
    'okta', 'azure-entra-id', 'bamboohr', 'jamf', 'intune',
    'gong', 'chorus', 'outreach', 'salesloft', 'apollo',
    'clearbit', '6sense', 'demandbase', 'marketo', 'hubspot-marketing',
    'active-campaign', 'mailchimp', 'klaviyo', 'brevo', 'convertkit',
    'beehiiv', 'substack', 'ghost', 'wordpress', 'webflow',
    'squarespace', 'wix', 'shopify', 'bigcommerce', 'woocommerce',
    'magento', 'prestashop', 'opencart', 'volusion', '3dcart',
    'stripe', 'paypal', 'braintree', 'adyen', 'square',
    'razorpay', 'mollie', 'klarna', 'afterpay', 'affirm',
    'chargebee', 'recurly', 'zuora', 'paddle', 'fastspring',
    'gumroad', 'lemon-squeezy', 'paddle', 'fastspring',
]

DATABASES = [
    'mariadb', 'cockroachdb', 'tidb', 'singlestore', 'timescaledb',
    'questdb', 'duckdb', 'firebolt', 'starrocks', 'doris',
    'clickhouse', 'influxdb', 'prometheus', 'victoriametrics', 'loki',
    'elasticsearch', 'opensearch', 'solr', 'splunk', 'datadog',
    'newrelic', 'pagerduty', 'opsgenie', 'victorops', 'pagerduty',
    'servicenow', 'jira-service-management', 'freshservice', 'zendesk',
    'intercom', 'drift', 'crisp', 'tawk', 'livechat',
    'hubspot-service', 'zoho-desk', 'freshdesk', 'helpscout', 'groove',
    'front', 'shared-inbox', 'missive', 'spike', 'Heymarket',
]

STREAMING = [
    'kinesis', 'pubsub', 'eventbridge', 'pulsar', 'rabbitmq',
    'activemq', 'zeromq', 'nats', 'mosquitto', 'emqx',
    'hivemq', 'vernemq', 'mosquitto', 'emqx', 'hivemq',
]

CLOUD_STORAGE = [
    's3', 'gcs', 'azure-blob', 'minio', 'digitalocean-spaces',
    'backblaze-b2', 'wasabi', 'cloudflare-r2', 'linode-obj', 'vultr-obj',
]

BI_ANALYTICS = [
    'tableau', 'looker', 'power-bi', 'metabase', 'superset',
    'grafana', 'redash', 'mode', 'sigma', 'thoughtspot',
    'sisense', 'domo', 'qlik', 'microstrategy', 'tibco',
    'sap-analytics', 'oracle-analytics', 'ibm-cognos', 'sas', 'spss',
]

CRM_SALES = [
    'pipedrive', 'close', 'copper', 'freshsales', 'zoho-crm',
    'dynamics-365', 'sugarcrm', 'insightly', 'nimble', 'agile-crm',
    'salesforce', 'hubspot', 'zoho', 'freshworks', 'pipedrive',
    'close', 'copper', 'insightly', 'nimble', 'agile-crm',
]

COMMUNICATION = [
    'teams', 'discord', 'twilio', 'sendgrid', 'mailchimp',
    'intercom', 'zendesk', 'freshdesk', 'drift', 'crisp',
    'slack', 'microsoft-teams', 'google-chat', 'zoom', 'webex',
    'gotomeeting', 'joinme', 'bluejeans', 'ringcentral', 'dialpad',
]

PROJECT_MANAGEMENT = [
    'basecamp', 'wrike', 'smartsheet', 'teamwork', 'height',
    'plane', 'shortcut', 'youtrack', 'pivotal-tracker', 'clubhouse',
    'asana', 'monday', 'clickup', 'trello', 'jira',
    'notion', 'linear', 'height', 'plane', 'shortcut',
]

OTHER = [
    'figma', 'canva', 'miro', 'loom', 'calendly',
    'zoom', 'google-calendar', 'outlook-calendar', 'google-drive', 'dropbox',
    'box', 'onedrive', 'sharepoint', 'confluence', 'gitbook',
    'bitbucket', 'azure-repos', 'harness', 'okta', 'azure-entra-id',
    'bamboohr', 'jamf', 'intune', 'gong', 'chorus',
]

def categorize_connector(name):
    """Categorize a connector by complexity and demand"""
    if name in QUICK_WINS:
        return 'quick_win', 'high', 'low'
    elif name in COMMON_SAAS:
        return 'common', 'high', 'medium'
    elif name in DATABASES:
        return 'database', 'high', 'medium'
    elif name in STREAMING:
        return 'streaming', 'medium', 'high'
    elif name in CLOUD_STORAGE:
        return 'cloud_storage', 'high', 'low'
    elif name in BI_ANALYTICS:
        return 'bi_analytics', 'medium', 'medium'
    elif name in CRM_SALES:
        return 'crm_sales', 'high', 'medium'
    elif name in COMMUNICATION:
        return 'communication', 'high', 'low'
    elif name in PROJECT_MANAGEMENT:
        return 'project_management', 'medium', 'low'
    elif name in OTHER:
        return 'other', 'medium', 'medium'
    else:
        return 'unknown', 'low', 'high'

def prioritize_connectors(connectors):
    """Prioritize connectors by impact/effort ratio"""
    prioritized = []
    for name in connectors:
        category, demand, effort = categorize_connector(name)
        demand_score = {'high': 3, 'medium': 2, 'low': 1}[demand]
        effort_score = {'low': 3, 'medium': 2, 'high': 1}[effort]
        priority = demand_score * effort_score
        prioritized.append({
            'name': name,
            'category': category,
            'demand': demand,
            'effort': effort,
            'priority': priority
        })
    return sorted(prioritized, key=lambda x: x['priority'], reverse=True)

def assign_agent(task):
    """Assign the best agent for a task"""
    if task['effort'] == 'low' and task['category'] in ['quick_win', 'cloud_storage', 'communication']:
        return 'nvidia'  # Fast, free
    elif task['effort'] == 'medium' and task['category'] in ['common', 'database', 'crm_sales']:
        return 'deepseek'  # Good quality, cheap
    elif task['category'] == 'streaming':
        return 'kimi'  # Best for complex orchestration
    else:
        return 'deepseek'  # Default

def generate_strategy(connectors):
    """Generate a strategy for building connectors"""
    prioritized = prioritize_connectors(connectors)
    
    # Group into batches of 20
    batches = []
    for i in range(0, len(prioritized), 20):
        batch = prioritized[i:i+20]
        agent = assign_agent(batch[0])  # Use first connector's agent
        batches.append({
            'batch_id': f'batch-{i//20 + 1:03d}',
            'strategy': batch[0]['category'],
            'connectors': [c['name'] for c in batch],
            'agent': agent,
            'estimated_time': f'{len(batch) * 2} minutes',
            'estimated_pass_rate': '85%',
            'dependencies': [],
            'risks': []
        })
    
    return batches

def main():
    """Main entry point"""
    # Get all connectors from the codebase
    connectors_dir = Path('packages/core/src/connectors')
    connectors = []
    for f in connectors_dir.glob('*.ts'):
        if f.name not in ['base.ts', 'registry.ts', 'abstract.ts', 'index.ts']:
            connectors.append(f.stem)
    
    # Generate strategy
    strategy = generate_strategy(connectors)
    
    # Output strategy
    print(json.dumps(strategy, indent=2))

if __name__ == '__main__':
    main()
