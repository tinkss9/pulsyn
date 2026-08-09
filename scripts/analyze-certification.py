import json

data = json.load(open('docs/lab/cert-matrix.json'))
connectors = data['connectors']

# Find connectors close to certification (80-99% pass rate)
close = [(k, v) for k, v in connectors.items() if 80 <= v['pass_rate'] < 100]
close.sort(key=lambda x: -x[1]['pass_rate'])

print('=== CONNECTORS CLOSE TO 100% (easy wins) ===')
for name, info in close:
    print(f'{info["pass_rate"]:>5.1f}%  {info["lane"]:>2}  {name}')

print()
print('=== BY LANE ===')
for lane in ['A', 'B']:
    lane_connectors = [(k, v) for k, v in connectors.items() if v['lane'] == lane and v['pass_rate'] < 100]
    lane_connectors.sort(key=lambda x: -x[1]['pass_rate'])
    print(f'\nLane {lane} ({len(lane_connectors)} below 100%):')
    for name, info in lane_connectors[:20]:
        print(f'  {info["pass_rate"]:>5.1f}%  {name}')

# Summary
total = len(connectors)
at_100 = sum(1 for v in connectors.values() if v['pass_rate'] == 100)
at_90 = sum(1 for v in connectors.values() if v['pass_rate'] >= 90)
at_80 = sum(1 for v in connectors.values() if v['pass_rate'] >= 80)
below_80 = sum(1 for v in connectors.values() if v['pass_rate'] < 80)

print(f'\n=== SUMMARY ===')
print(f'Total: {total}')
print(f'At 100%: {at_100} ({at_100*100//total}%)')
print(f'At 90%+: {at_90} ({at_90*100//total}%)')
print(f'At 80%+: {at_80} ({at_80*100//total}%)')
print(f'Below 80%: {below_80}')
print(f'Easy wins (90-99%): {at_90 - at_100}')
