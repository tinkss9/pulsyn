import json

data = json.load(open('docs/lab/cert-matrix.json'))
connectors = data['connectors']

# Check if there's test result detail
at_95 = [(k, v) for k, v in connectors.items() if v['pass_rate'] == 95.0]
at_95_2 = [(k, v) for k, v in connectors.items() if v['pass_rate'] == 95.2]

print(f'=== CONNECTORS AT 95.0% ({len(at_95)}) ===')
# Check if there's any additional info in the cert data
sample = at_95[0] if at_95 else None
if sample:
    print(f'Sample entry: {json.dumps(sample[1], indent=2)}')

print(f'\n=== CONNECTORS AT 95.2% ({len(at_95_2)}) ===')
if at_95_2:
    print(f'Sample entry: {json.dumps(at_95_2[0][1], indent=2)}')

# Check Lane B failures
print('\n=== LANE B FAILURES ===')
for name, info in connectors.items():
    if info['lane'] == 'B' and info['pass_rate'] < 100:
        print(f'{info["pass_rate"]:>5.1f}%  {name}')
        print(f'  Full data: {json.dumps(info, indent=2)}')
