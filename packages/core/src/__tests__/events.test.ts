// Events Module Unit Tests
import { describe, it, expect } from 'vitest';
import { createEvent, eventKey, eventToDict, dictToEvent } from '../events';

describe('UnifiedChangeEvent', () => {
  describe('createEvent', () => {
    it('should create a basic INSERT event', () => {
      const event = createEvent({
        op: 'I',
        table: 'users',
        after: { id: 1, name: 'Alice' },
      });

      expect(event.op).toBe('I');
      expect(event.table).toBe('users');
      expect(event.after).toEqual({ id: 1, name: 'Alice' });
      expect(event.before).toBeNull();
      expect(event.ts).toBeInstanceOf(Date);
      expect(event.watermark).toBeNull();
    });

    it('should create an UPDATE event with before/after', () => {
      const event = createEvent({
        op: 'U',
        table: 'users',
        before: { id: 1, name: 'Alice' },
        after: { id: 1, name: 'Bob' },
      });

      expect(event.op).toBe('U');
      expect(event.before?.name).toBe('Alice');
      expect(event.after?.name).toBe('Bob');
    });

    it('should create a DELETE event', () => {
      const event = createEvent({
        op: 'D',
        table: 'users',
        before: { id: 1, name: 'Alice' },
      });

      expect(event.op).toBe('D');
      expect(event.before).toEqual({ id: 1, name: 'Alice' });
      expect(event.after).toBeNull();
    });
  });

  describe('eventKey', () => {
    it('should return pk from sourceMetadata', () => {
      const event = createEvent({
        op: 'I',
        table: 'users',
        after: { id: 1 },
        sourceMetadata: { pk: '1' },
      });
      expect(eventKey(event)).toBe('1');
    });

    it('should return null if no pk', () => {
      const event = createEvent({ op: 'I', table: 'users', after: {} });
      expect(eventKey(event)).toBeNull();
    });
  });

  describe('eventToDict / dictToEvent', () => {
    it('should round-trip through dict', () => {
      const event = createEvent({
        op: 'I',
        table: 'users',
        after: { id: 1, name: 'Alice' },
        watermark: '123',
      });

      const dict = eventToDict(event);
      expect(dict.op).toBe('I');
      expect(dict.table).toBe('users');

      const restored = dictToEvent(dict);
      expect(restored.op).toBe('I');
      expect(restored.table).toBe('users');
      expect(restored.watermark).toBe('123');
    });
  });
});
