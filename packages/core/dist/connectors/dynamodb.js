var __esDecorate = (this && this.__esDecorate) || function (ctor, descriptorIn, decorators, contextIn, initializers, extraInitializers) {
    function accept(f) { if (f !== void 0 && typeof f !== "function") throw new TypeError("Function expected"); return f; }
    var kind = contextIn.kind, key = kind === "getter" ? "get" : kind === "setter" ? "set" : "value";
    var target = !descriptorIn && ctor ? contextIn["static"] ? ctor : ctor.prototype : null;
    var descriptor = descriptorIn || (target ? Object.getOwnPropertyDescriptor(target, contextIn.name) : {});
    var _, done = false;
    for (var i = decorators.length - 1; i >= 0; i--) {
        var context = {};
        for (var p in contextIn) context[p] = p === "access" ? {} : contextIn[p];
        for (var p in contextIn.access) context.access[p] = contextIn.access[p];
        context.addInitializer = function (f) { if (done) throw new TypeError("Cannot add initializers after decoration has completed"); extraInitializers.push(accept(f || null)); };
        var result = (0, decorators[i])(kind === "accessor" ? { get: descriptor.get, set: descriptor.set } : descriptor[key], context);
        if (kind === "accessor") {
            if (result === void 0) continue;
            if (result === null || typeof result !== "object") throw new TypeError("Object expected");
            if (_ = accept(result.get)) descriptor.get = _;
            if (_ = accept(result.set)) descriptor.set = _;
            if (_ = accept(result.init)) initializers.unshift(_);
        }
        else if (_ = accept(result)) {
            if (kind === "field") initializers.unshift(_);
            else descriptor[key] = _;
        }
    }
    if (target) Object.defineProperty(target, contextIn.name, descriptor);
    done = true;
};
var __runInitializers = (this && this.__runInitializers) || function (thisArg, initializers, value) {
    var useValue = arguments.length > 2;
    for (var i = 0; i < initializers.length; i++) {
        value = useValue ? initializers[i].call(thisArg, value) : initializers[i].call(thisArg);
    }
    return useValue ? value : void 0;
};
// @ts-nocheck
import { DynamoDBClient, ScanCommand, DescribeTableCommand, ListTablesCommand, } from '@aws-sdk/client-dynamodb';
import { DynamoDBStreamsClient, GetShardIteratorCommand, GetRecordsCommand, DescribeStreamCommand, } from '@aws-sdk/client-dynamodb-streams';
import { unmarshall } from '@aws-sdk/util-dynamodb';
import { BaseConnector } from './base';
import { registerSource } from './registry';
import { createEvent } from '../events';
let DynamoDBConnector = (() => {
    let _classDecorators = [registerSource('dynamodb')];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    let _classSuper = BaseConnector;
    var DynamoDBConnector = class extends _classSuper {
        static { _classThis = this; }
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
            DynamoDBConnector = _classThis = _classDescriptor.value;
            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
            __runInitializers(_classThis, _classExtraInitializers);
        }
        client = null;
        streamsClient = null;
        cdcActive = false;
        async connect(config) {
            try {
                this.config = config;
                const clientConfig = {
                    region: config.region || 'ap-southeast-2',
                    endpoint: config.endpoint || undefined,
                    credentials: config.username ? {
                        accessKeyId: config.username,
                        secretAccessKey: config.password,
                    } : undefined,
                };
                this.client = new DynamoDBClient(clientConfig);
                this.streamsClient = new DynamoDBStreamsClient(clientConfig);
                await this.client.send(new ListTablesCommand({ Limit: 1 }));
                this.connected = true;
            }
            catch (error) {
                throw new Error(`DynamoDB connection failed: ${error.message}`);
            }
        }
        async disconnect() {
            await this.stopCDC();
            if (this.client) {
                this.client.destroy();
                this.client = null;
            }
            if (this.streamsClient) {
                this.streamsClient.destroy();
                this.streamsClient = null;
            }
            this.connected = false;
        }
        async testConnection() {
            try {
                if (!this.client)
                    return false;
                await this.client.send(new ListTablesCommand({ Limit: 1 }));
                return true;
            }
            catch {
                return false;
            }
        }
        async getTables() {
            if (!this.client)
                throw new Error('Not connected');
            const tables = [];
            let lastEvaluated;
            do {
                const result = await this.client.send(new ListTablesCommand({
                    ExclusiveStartTableName: lastEvaluated,
                    Limit: 100,
                }));
                tables.push(...(result.TableNames || []));
                lastEvaluated = result.LastEvaluatedTableName;
            } while (lastEvaluated);
            return tables.sort();
        }
        async getTableSchema(table) {
            if (!this.client)
                throw new Error('Not connected');
            const desc = await this.client.send(new DescribeTableCommand({ TableName: table }));
            const attrs = desc.Table?.AttributeDefinitions || [];
            const keys = desc.Table?.KeySchema || [];
            return {
                table,
                columns: attrs.map((a) => ({
                    name: a.AttributeName, type: a.AttributeType,
                    nullable: false, defaultValue: null,
                })),
                primaryKeys: keys.filter((k) => k.KeyType === 'HASH').map((k) => k.AttributeName),
            };
        }
        async startCDC(callback) {
            if (!this.client || !this.streamsClient)
                throw new Error('Not connected');
            this.cdcActive = true;
            this.pollStreams(callback);
        }
        async pollStreams(cb) {
            while (this.cdcActive && this.streamsClient) {
                try {
                    const tables = await this.getTables();
                    for (const table of tables) {
                        const desc = await this.client.send(new DescribeTableCommand({ TableName: table }));
                        const streamArn = desc.Table?.LatestStreamArn;
                        if (!streamArn)
                            continue;
                        const streamDesc = await this.streamsClient.send(new DescribeStreamCommand({ StreamArn: streamArn }));
                        const shards = streamDesc.StreamDescription?.Shards || [];
                        for (const shard of shards) {
                            const iterRes = await this.streamsClient.send(new GetShardIteratorCommand({
                                StreamArn: streamArn,
                                ShardId: shard.ShardId,
                                ShardIteratorType: 'LATEST',
                            }));
                            let iterator = iterRes.ShardIterator;
                            if (!iterator)
                                continue;
                            const records = await this.streamsClient.send(new GetRecordsCommand({ ShardIterator: iterator }));
                            for (const rec of records.Records || []) {
                                const op = rec.eventName === 'INSERT' ? 'I' : rec.eventName === 'MODIFY' ? 'U' : 'D';
                                const after = rec.dynamodb?.NewImage ? unmarshall(rec.dynamodb.NewImage) : null;
                                const before = rec.dynamodb?.OldImage ? unmarshall(rec.dynamodb.OldImage) : null;
                                cb({ op, table, before, after, ts: new Date() });
                            }
                        }
                    }
                    await new Promise((r) => setTimeout(r, 5000));
                }
                catch {
                    if (this.cdcActive)
                        await new Promise((r) => setTimeout(r, 10000));
                }
            }
        }
        async stopCDC() {
            this.cdcActive = false;
        }
        async extractFull(table) {
            if (!this.client)
                throw new Error('Not connected');
            const events = [];
            let lastKey;
            do {
                const result = await this.client.send(new ScanCommand({
                    TableName: table,
                    Limit: this.batchSize,
                    ExclusiveStartKey: lastKey,
                }));
                for (const item of result.Items || []) {
                    const row = unmarshall(item);
                    events.push(createEvent({ op: 'S', table, after: row, before: null, sourceMetadata: { source: 'dynamodb' } }));
                }
                lastKey = result.LastEvaluatedKey;
            } while (lastKey);
            return events;
        }
        async extractIncremental(table, watermark) {
            if (!this.client)
                throw new Error('Not connected');
            const wmCol = this.config.watermarkColumn || 'updatedAt';
            const events = [];
            const params = {
                TableName: table,
                Limit: this.batchSize,
            };
            if (watermark) {
                params.FilterExpression = `#wm > :wm`;
                params.ExpressionAttributeNames = { '#wm': wmCol };
                params.ExpressionAttributeValues = { ':wm': { S: watermark } };
            }
            const result = await this.client.send(new ScanCommand(params));
            for (const item of result.Items || []) {
                const row = unmarshall(item);
                events.push(createEvent({ op: 'I', table, after: row, before: null, sourceMetadata: { source: 'dynamodb', pk: row[wmCol]?.toString() || null } }));
            }
            return events;
        }
        async estimateRowCount(table) {
            if (!this.client)
                throw new Error('Not connected');
            const desc = await this.client.send(new DescribeTableCommand({ TableName: table }));
            return Number(desc.Table?.ItemCount || 0);
        }
        async getPrimaryKey(table) {
            const schema = await this.getTableSchema(table);
            return schema.primaryKeys[0] || 'pk';
        }
    };
    return DynamoDBConnector = _classThis;
})();
export { DynamoDBConnector };
//# sourceMappingURL=dynamodb.js.map