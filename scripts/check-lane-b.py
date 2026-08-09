import json

data = json.load(open('docs/lab/cert-matrix.json'))
connectors = data['connectors']

print('=== LANE B (DATABASE) CONNECTORS ===')
for name, info in sorted(connectors.items()):
    if info.get('lane') == 'B':
        print(f'{info["pass_rate"]:>5.1f}%  {name}')

print()
print('=== SUMMARY ===')
print(f'Total: {data["metadata"]["total_connectors"]}')
print(f'Certified: {data["metadata"]["total_certified"]}')
at100 = sum(1 for v in connectors.values() if v['pass_rate'] == 100)
print(f'At 100%: {at100}')
