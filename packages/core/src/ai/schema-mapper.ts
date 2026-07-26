// AI-Powered Schema Mapper — Auto-map fields across connectors
export interface FieldMapping {
  sourceField: string;
  targetField: string;
  confidence: number;
  transform?: string;
  reason: string;
}

export interface SchemaMapping {
  sourceTable: string;
  targetTable: string;
  mappings: FieldMapping[];
  unmappedSource: string[];
  unmappedTarget: string[];
  overallConfidence: number;
}

// Common field name patterns
const FIELD_PATTERNS: Record<string, string[]> = {
  id: ['id', '_id', 'uuid', 'guid', 'key', 'pk', 'primary'],
  name: ['name', 'full_name', 'fullname', 'first_name', 'last_name', 'display_name', 'title'],
  email: ['email', 'email_address', 'mail', 'e_mail'],
  phone: ['phone', 'phone_number', 'mobile', 'cell', 'telephone', 'tel'],
  address: ['address', 'street', 'city', 'state', 'zip', 'postal', 'country'],
  created: ['created', 'created_at', 'created_date', 'creation_date', 'date_created', 'inserted_at'],
  updated: ['updated', 'updated_at', 'updated_date', 'modification_date', 'date_updated', 'modified_at'],
  deleted: ['deleted', 'deleted_at', 'is_deleted', 'soft_deleted', 'archived'],
  status: ['status', 'state', 'stage', 'phase', 'condition'],
  amount: ['amount', 'total', 'subtotal', 'price', 'cost', 'value', 'sum'],
  quantity: ['quantity', 'qty', 'count', 'number', 'num'],
  description: ['description', 'desc', 'details', 'notes', 'comments', 'remarks'],
  type: ['type', 'category', 'kind', 'class', 'group'],
  date: ['date', 'timestamp', 'datetime', 'time', 'ts'],
  url: ['url', 'link', 'href', 'uri', 'website'],
  image: ['image', 'photo', 'picture', 'avatar', 'thumbnail', 'img'],
  boolean: ['is_', 'has_', 'can_', 'should_', 'active', 'enabled', 'visible', 'public'],
};

// Type inference patterns
const TYPE_PATTERNS: Record<string, string> = {
  id: 'string',
  uuid: 'string',
  email: 'string',
  phone: 'string',
  url: 'string',
  name: 'string',
  description: 'text',
  amount: 'number',
  price: 'number',
  quantity: 'number',
  count: 'number',
  total: 'number',
  date: 'datetime',
  timestamp: 'datetime',
  created_at: 'datetime',
  updated_at: 'datetime',
  is_: 'boolean',
  has_: 'boolean',
  active: 'boolean',
  enabled: 'boolean',
  status: 'string',
  type: 'string',
  category: 'string',
  address: 'object',
  metadata: 'object',
  tags: 'array',
  json: 'json',
};

export class SchemaMapper {
  /**
   * Suggest mappings between source and target schemas
   */
  static suggestMappings(
    sourceSchema: { name: string; columns: { name: string; type: string }[] },
    targetSchema: { name: string; columns: { name: string; type: string }[] }
  ): SchemaMapping {
    const mappings: FieldMapping[] = [];
    const unmappedSource: string[] = [];
    const unmappedTarget = targetSchema.columns.map(c => c.name);

    for (const sourceCol of sourceSchema.columns) {
      const bestMatch = this.findBestMatch(sourceCol, targetSchema.columns);

      if (bestMatch) {
        mappings.push({
          sourceField: sourceCol.name,
          targetField: bestMatch.name,
          confidence: bestMatch.confidence,
          transform: this.suggestTransform(sourceCol.type, targetSchema.columns.find(c => c.name === bestMatch!.name)?.type || 'string'),
          reason: bestMatch.reason,
        });

        // Remove from unmapped
        const idx = unmappedTarget.indexOf(bestMatch.name);
        if (idx !== -1) unmappedTarget.splice(idx, 1);
      } else {
        unmappedSource.push(sourceCol.name);
      }
    }

    const overallConfidence = mappings.length > 0
      ? mappings.reduce((sum, m) => sum + m.confidence, 0) / mappings.length
      : 0;

    return {
      sourceTable: sourceSchema.name,
      targetTable: targetSchema.name,
      mappings,
      unmappedSource,
      unmappedTarget,
      overallConfidence,
    };
  }

  /**
   * Find the best matching target column for a source column
   */
  private static findBestMatch(
    sourceCol: { name: string; type: string },
    targetCols: { name: string; type: string }[]
  ): { name: string; confidence: number; reason: string } | null {
    let bestMatch: { name: string; confidence: number; reason: string } | null = null;

    for (const targetCol of targetCols) {
      const confidence = this.calculateConfidence(sourceCol, targetCol);

      if (confidence > 0.5 && (!bestMatch || confidence > bestMatch.confidence)) {
        bestMatch = {
          name: targetCol.name,
          confidence,
          reason: this.explainMatch(sourceCol.name, targetCol.name, confidence),
        };
      }
    }

    return bestMatch;
  }

  /**
   * Calculate confidence score between two columns
   */
  private static calculateConfidence(
    source: { name: string; type: string },
    target: { name: string; type: string }
  ): number {
    let score = 0;
    let factors = 0;

    // 1. Exact name match
    if (source.name === target.name) {
      return 1.0;
    }

    // 2. Case-insensitive name match
    if (source.name.toLowerCase() === target.name.toLowerCase()) {
      return 0.99;
    }

    // 3. Similar name (Levenshtein-like)
    const nameSimilarity = this.stringSimilarity(source.name, target.name);
    score += nameSimilarity * 0.4;
    factors += 0.4;

    // 4. Pattern match
    const sourcePattern = this.getFieldPattern(source.name);
    const targetPattern = this.getFieldPattern(target.name);
    if (sourcePattern && targetPattern && sourcePattern === targetPattern) {
      score += 0.3;
    }
    factors += 0.3;

    // 5. Type compatibility
    if (this.areTypesCompatible(source.type, target.type)) {
      score += 0.2;
    }
    factors += 0.2;

    // 6. Semantic similarity (common synonyms)
    const semanticScore = this.semanticSimilarity(source.name, target.name);
    score += semanticScore * 0.1;
    factors += 0.1;

    return factors > 0 ? score / factors : 0;
  }

  /**
   * Get field pattern category
   */
  private static getFieldPattern(fieldName: string): string | null {
    const lower = fieldName.toLowerCase();
    for (const [pattern, keywords] of Object.entries(FIELD_PATTERNS)) {
      if (keywords.some(kw => lower.includes(kw))) {
        return pattern;
      }
    }
    return null;
  }

  /**
   * Check if two types are compatible
   */
  private static areTypesCompatible(type1: string, type2: string): boolean {
    const t1 = type1.toLowerCase();
    const t2 = type2.toLowerCase();

    // Same type
    if (t1 === t2) return true;

    // Numeric types
    const numericTypes = ['int', 'integer', 'bigint', 'float', 'double', 'decimal', 'number', 'numeric'];
    if (numericTypes.some(t => t1.includes(t)) && numericTypes.some(t => t2.includes(t))) return true;

    // String types
    const stringTypes = ['varchar', 'char', 'text', 'string', 'nvarchar', 'nchar'];
    if (stringTypes.some(t => t1.includes(t)) && stringTypes.some(t => t2.includes(t))) return true;

    // Date types
    const dateTypes = ['date', 'datetime', 'timestamp', 'time'];
    if (dateTypes.some(t => t1.includes(t)) && dateTypes.some(t => t2.includes(t))) return true;

    // Boolean
    if (t1.includes('bool') && t2.includes('bool')) return true;

    return false;
  }

  /**
   * Calculate string similarity (0-1)
   */
  private static stringSimilarity(s1: string, s2: string): number {
    const longer = s1.length > s2.length ? s1 : s2;
    const shorter = s1.length > s2.length ? s2 : s1;

    if (longer.length === 0) return 1.0;

    const editDistance = this.levenshteinDistance(longer, shorter);
    return (longer.length - editDistance) / longer.length;
  }

  /**
   * Levenshtein distance
   */
  private static levenshteinDistance(s1: string, s2: string): number {
    const costs: number[] = [];
    for (let i = 0; i <= s1.length; i++) {
      let lastValue = i;
      for (let j = 0; j <= s2.length; j++) {
        if (i === 0) {
          costs[j] = j;
        } else if (j > 0) {
          let newValue = costs[j - 1];
          if (s1.charAt(i - 1) !== s2.charAt(j - 1)) {
            newValue = Math.min(Math.min(newValue, lastValue), costs[j]) + 1;
          }
          costs[j - 1] = lastValue;
          lastValue = newValue;
        }
      }
      if (i > 0) costs[s2.length] = lastValue;
    }
    return costs[s2.length];
  }

  /**
   * Calculate semantic similarity using synonyms
   */
  private static semanticSimilarity(name1: string, name2: string): number {
    const synonyms: Record<string, string[]> = {
      id: ['_id', 'uuid', 'guid', 'key', 'pk'],
      name: ['title', 'label', 'display_name', 'full_name'],
      email: ['mail', 'e_mail', 'email_address'],
      phone: ['mobile', 'cell', 'telephone', 'tel'],
      address: ['street', 'location', 'addr'],
      created: ['inserted', 'added', 'generated'],
      updated: ['modified', 'changed', 'edited'],
      deleted: ['removed', 'archived', 'soft_deleted'],
      amount: ['total', 'sum', 'value', 'price'],
      quantity: ['qty', 'count', 'num'],
      description: ['desc', 'details', 'notes', 'comments'],
      status: ['state', 'stage', 'phase'],
      type: ['category', 'kind', 'class'],
    };

    const lower1 = name1.toLowerCase();
    const lower2 = name2.toLowerCase();

    for (const [key, syns] of Object.entries(synonyms)) {
      const allTerms = [key, ...syns];
      const match1 = allTerms.some(t => lower1.includes(t));
      const match2 = allTerms.some(t => lower2.includes(t));
      if (match1 && match2) return 0.8;
    }

    return 0;
  }

  /**
   * Suggest type transformation
   */
  private static suggestTransform(sourceType: string, targetType: string): string | undefined {
    const s = sourceType.toLowerCase();
    const t = targetType.toLowerCase();

    if (s === t) return undefined;

    // String to number
    if (s.includes('varchar') && t.includes('int')) return 'parseInt';
    if (s.includes('text') && t.includes('int')) return 'parseInt';
    if (s.includes('varchar') && t.includes('float')) return 'parseFloat';

    // Number to string
    if (s.includes('int') && t.includes('varchar')) return 'toString';
    if (s.includes('float') && t.includes('varchar')) return 'toString';

    // Date conversions
    if (s.includes('timestamp') && t.includes('date')) return 'toDate';
    if (s.includes('date') && t.includes('timestamp')) return 'toTimestamp';

    // Boolean conversions
    if (s.includes('int') && t.includes('bool')) return 'toBoolean';
    if (s.includes('bool') && t.includes('int')) return 'toInteger';

    return 'cast';
  }

  /**
   * Explain why two fields match
   */
  private static explainMatch(source: string, target: string, confidence: number): string {
    if (confidence > 0.9) return `Exact match: ${source} = ${target}`;
    if (confidence > 0.7) return `Similar name: ${source} ≈ ${target}`;
    if (confidence > 0.5) return `Pattern match: ${source} → ${target}`;
    return `Low confidence: ${source} → ${target}`;
  }

  /**
   * Infer types from sample data
   */
  static inferTypes(data: Record<string, any>[]): Record<string, string> {
    if (data.length === 0) return {};

    const types: Record<string, string> = {};
    const columns = Object.keys(data[0]);

    for (const col of columns) {
      const values = data.map(row => row[col]).filter(v => v !== null && v !== undefined);

      if (values.length === 0) {
        types[col] = 'unknown';
        continue;
      }

      // Check patterns in column name
      const pattern = this.getFieldPattern(col);
      if (pattern && TYPE_PATTERNS[pattern]) {
        types[col] = TYPE_PATTERNS[pattern];
        continue;
      }

      // Infer from values
      const sample = values[0];
      if (typeof sample === 'boolean') {
        types[col] = 'boolean';
      } else if (typeof sample === 'number') {
        types[col] = Number.isInteger(sample) ? 'integer' : 'number';
      } else if (typeof sample === 'string') {
        // Check if it's a date
        if (/^\d{4}-\d{2}-\d{2}/.test(sample)) {
          types[col] = 'datetime';
        } else if (/^[a-f0-9-]{36}$/.test(sample)) {
          types[col] = 'uuid';
        } else if (sample.includes('@')) {
          types[col] = 'email';
        } else if (/^https?:\/\//.test(sample)) {
          types[col] = 'url';
        } else {
          types[col] = 'string';
        }
      } else if (Array.isArray(sample)) {
        types[col] = 'array';
      } else if (typeof sample === 'object') {
        types[col] = 'object';
      } else {
        types[col] = 'string';
      }
    }

    return types;
  }
}
