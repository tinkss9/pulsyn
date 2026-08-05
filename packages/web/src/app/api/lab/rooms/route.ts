import { NextRequest, NextResponse } from 'next/server';

// Auto-scaling room management API

interface Room {
  id: string;
  name: string;
  type: 'standard' | 'premium' | 'streaming' | 'practice';
  status: 'available' | 'occupied' | 'maintenance';
  capacity: number;
  currentUsers: number;
  specs: {
    cpu: string;
    ram: string;
    storage: string;
    network: string;
  };
  engines: string[];
  pricePerHour: number;
  streamEnabled: boolean;
  autoScale: {
    enabled: boolean;
    minInstances: number;
    maxInstances: number;
    currentInstances: number;
    scaleUpThreshold: number; // % occupancy
    scaleDownThreshold: number; // % occupancy
  };
}

// In-memory room store (replace with database in production)
const rooms: Map<string, Room> = new Map([
  ['room-std-01', {
    id: 'room-std-01',
    name: 'Standard Lab 1',
    type: 'standard',
    status: 'available',
    capacity: 10,
    currentUsers: 3,
    specs: { cpu: '4 vCPU', ram: '16 GB', storage: '100 GB SSD', network: '1 Gbps' },
    engines: ['PostgreSQL', 'MySQL'],
    pricePerHour: 0,
    streamEnabled: false,
    autoScale: {
      enabled: true,
      minInstances: 1,
      maxInstances: 10,
      currentInstances: 2,
      scaleUpThreshold: 80,
      scaleDownThreshold: 20,
    },
  }],
  ['room-practice-01', {
    id: 'room-practice-01',
    name: 'Practice Pod 1',
    type: 'practice',
    status: 'available',
    capacity: 50,
    currentUsers: 12,
    specs: { cpu: '2 vCPU', ram: '8 GB', storage: '50 GB SSD', network: '500 Mbps' },
    engines: ['PostgreSQL'],
    pricePerHour: 1,
    streamEnabled: false,
    autoScale: {
      enabled: true,
      minInstances: 2,
      maxInstances: 100,
      currentInstances: 5,
      scaleUpThreshold: 70,
      scaleDownThreshold: 30,
    },
  }],
]);

// Auto-scaling logic
function checkAutoScale(room: Room): { action: string; newInstances: number } | null {
  if (!room.autoScale.enabled) return null;

  const occupancy = (room.currentUsers / room.capacity) * 100;

  if (occupancy >= room.autoScale.scaleUpThreshold) {
    const newInstances = Math.min(
      room.autoScale.currentInstances + 1,
      room.autoScale.maxInstances
    );
    if (newInstances > room.autoScale.currentInstances) {
      return { action: 'scale_up', newInstances };
    }
  }

  if (occupancy <= room.autoScale.scaleDownThreshold) {
    const newInstances = Math.max(
      room.autoScale.currentInstances - 1,
      room.autoScale.minInstances
    );
    if (newInstances < room.autoScale.currentInstances) {
      return { action: 'scale_down', newInstances };
    }
  }

  return null;
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const type = searchParams.get('type');
  const status = searchParams.get('status');

  let roomList = Array.from(rooms.values());

  if (type) {
    roomList = roomList.filter(r => r.type === type);
  }
  if (status) {
    roomList = roomList.filter(r => r.status === status);
  }

  // Check auto-scaling for all rooms
  const scalingActions = roomList.map(room => ({
    roomId: room.id,
    action: checkAutoScale(room),
  })).filter(s => s.action !== null);

  return NextResponse.json({
    data: roomList,
    total: roomList.length,
    totalCapacity: roomList.reduce((sum, r) => sum + r.capacity, 0),
    totalUsers: roomList.reduce((sum, r) => sum + r.currentUsers, 0),
    autoScaling: {
      enabled: roomList.filter(r => r.autoScale.enabled).length,
      actions: scalingActions,
    },
  });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, roomId, userId } = body;

    const room = rooms.get(roomId);
    if (!room) {
      return NextResponse.json({ error: 'Room not found' }, { status: 404 });
    }

    if (action === 'join') {
      if (room.currentUsers >= room.capacity) {
        return NextResponse.json({ error: 'Room is full' }, { status: 409 });
      }
      room.currentUsers++;
      
      // Check if we need to scale up
      const scaleAction = checkAutoScale(room);
      if (scaleAction?.action === 'scale_up') {
        room.autoScale.currentInstances = scaleAction.newInstances;
        // TODO: Trigger actual infrastructure scaling
      }

      return NextResponse.json({
        success: true,
        message: 'Joined room',
        data: { roomId, currentUsers: room.currentUsers, capacity: room.capacity },
      });
    }

    if (action === 'leave') {
      room.currentUsers = Math.max(0, room.currentUsers - 1);
      
      // Check if we can scale down
      const scaleAction = checkAutoScale(room);
      if (scaleAction?.action === 'scale_down') {
        room.autoScale.currentInstances = scaleAction.newInstances;
        // TODO: Trigger actual infrastructure scaling
      }

      return NextResponse.json({
        success: true,
        message: 'Left room',
        data: { roomId, currentUsers: room.currentUsers, capacity: room.capacity },
      });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });

  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
