// Watermark Tracker Unit Tests
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';
import { WatermarkTracker } from '../checkpoint/watermark';

describe('WatermarkTracker', () => {
  const testFile = path.join(__dirname, '.test-watermarks.json');
  let tracker: WatermarkTracker;

  beforeEach(() => {
    tracker = new WatermarkTracker({ stateFile: testFile });
  });

  afterEach(() => {
    try { fs.unlinkSync(testFile); } catch {}
  });

  it('should return null for unknown table', () => {
    expect(tracker.getWatermark('users')).toBeNull();
  });

  it('should set and get watermark', () => {
    tracker.setWatermark('users', '12345');
    expect(tracker.getWatermark('users')).toBe('12345');
  });

  it('should persist across instances', () => {
    tracker.setWatermark('users', '12345');
    const tracker2 = new WatermarkTracker({ stateFile: testFile });
    expect(tracker2.getWatermark('users')).toBe('12345');
  });

  it('should get all watermarks', () => {
    tracker.setWatermark('users', '100');
    tracker.setWatermark('orders', '200');
    const all = tracker.getAll();
    expect(all).toEqual({ users: '100', orders: '200' });
  });

  it('should clear specific table', () => {
    tracker.setWatermark('users', '100');
    tracker.setWatermark('orders', '200');
    tracker.clear('users');
    expect(tracker.getWatermark('users')).toBeNull();
    expect(tracker.getWatermark('orders')).toBe('200');
  });

  it('should clear all', () => {
    tracker.setWatermark('users', '100');
    tracker.setWatermark('orders', '200');
    tracker.clear();
    expect(tracker.getAll()).toEqual({});
  });

  it('should check if table exists', () => {
    expect(tracker.has('users')).toBe(false);
    tracker.setWatermark('users', '100');
    expect(tracker.has('users')).toBe(true);
  });
});
