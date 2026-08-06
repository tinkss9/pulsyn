// Trivia API — Community API (No Auth)
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
  {
    name: 'questions',
    endpoint: '?amount=50',
    schema: {
      name: 'questions',
      table: 'questions',
      columns: [
        { name: 'question', type: 'string', nullable: false, primaryKey: true },
        { name: 'correct_answer', type: 'string', nullable: false, primaryKey: false },
        { name: 'incorrect_answers', type: 'json', nullable: false, primaryKey: false },
        { name: 'category', type: 'string', nullable: false, primaryKey: false },
        { name: 'difficulty', type: 'string', nullable: false, primaryKey: false }
      ],
      primaryKey: ['question'],
    },
    idField: 'question',
  }
];

@registerSource('trivia')
export class TriviaConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'trivia', 'trivia', config, {
      baseUrl: config.host || 'https://opentdb.com/api.php',
      authType: 'none',
      resources: RESOURCES,
      paginationType: 'offset',
      healthEndpoint: '',
    });
  }
}
