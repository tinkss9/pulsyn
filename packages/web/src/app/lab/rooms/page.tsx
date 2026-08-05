'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Header from '@/components/Header';
import { 
  Users, Database, Zap, Clock, Eye, Play, Plus,
  Monitor, Activity, Globe, Server, Cpu, HardDrive,
  Wifi, WifiOff, ChevronRight, ArrowRight, RefreshCw
} from 'lucide-react';

interface LabRoom {
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
  features: string[];
  pricePerHour: number;
  streamEnabled: boolean;
}

const ROOMS: LabRoom[] = [
  {
    id: 'room-std-01',
    name: 'Standard Lab 1',
    type: 'standard',
    status: 'available',
    capacity: 10,
    currentUsers: 3,
    specs: { cpu: '4 vCPU', ram: '16 GB', storage: '100 GB SSD', network: '1 Gbps' },
    engines: ['PostgreSQL', 'MySQL'],
    features: ['Basic CDC', 'Checkpointing', 'CLI'],
    pricePerHour: 0,
    streamEnabled: false,
  },
  {
    id: 'room-std-02',
    name: 'Standard Lab 2',
    type: 'standard',
    status: 'occupied',
    capacity: 10,
    currentUsers: 8,
    specs: { cpu: '4 vCPU', ram: '16 GB', storage: '100 GB SSD', network: '1 Gbps' },
    engines: ['PostgreSQL', 'MySQL', 'MongoDB'],
    features: ['Basic CDC', 'Checkpointing', 'CLI', 'MCP'],
    pricePerHour: 0,
    streamEnabled: false,
  },
  {
    id: 'room-prem-01',
    name: 'Premium Lab 1',
    type: 'premium',
    status: 'available',
    capacity: 5,
    currentUsers: 1,
    specs: { cpu: '16 vCPU', ram: '64 GB', storage: '500 GB NVMe', network: '10 Gbps' },
    engines: ['PostgreSQL', 'MySQL', 'Oracle', 'SQL Server', 'MongoDB'],
    features: ['Full CDC', 'Masking', 'Transforms', 'MCP', 'API', 'Benchmarking'],
    pricePerHour: 5,
    streamEnabled: false,
  },
  {
    id: 'room-prem-02',
    name: 'Premium Lab 2',
    type: 'premium',
    status: 'available',
    capacity: 5,
    currentUsers: 2,
    specs: { cpu: '16 vCPU', ram: '64 GB', storage: '500 GB NVMe', network: '10 Gbps' },
    engines: ['PostgreSQL', 'MySQL', 'Oracle', 'SQL Server', 'MongoDB', 'Snowflake', 'BigQuery'],
    features: ['Full CDC', 'Masking', 'Transforms', 'MCP', 'API', 'Benchmarking', 'Multi-engine'],
    pricePerHour: 5,
    streamEnabled: false,
  },
  {
    id: 'room-stream-01',
    name: 'Streaming Studio 1',
    type: 'streaming',
    status: 'available',
    capacity: 3,
    currentUsers: 0,
    specs: { cpu: '32 vCPU', ram: '128 GB', storage: '1 TB NVMe', network: '25 Gbps' },
    engines: ['PostgreSQL', 'MySQL', 'Oracle', 'SQL Server', 'MongoDB', 'Snowflake', 'BigQuery'],
    features: ['Full CDC', 'Masking', 'Transforms', 'MCP', 'API', 'Benchmarking', 'Multi-engine', 'YouTube Stream', 'OBS'],
    pricePerHour: 15,
    streamEnabled: true,
  },
  {
    id: 'room-stream-02',
    name: 'Streaming Studio 2',
    type: 'streaming',
    status: 'maintenance',
    capacity: 3,
    currentUsers: 0,
    specs: { cpu: '32 vCPU', ram: '128 GB', storage: '1 TB NVMe', network: '25 Gbps' },
    engines: ['PostgreSQL', 'MySQL', 'Oracle', 'SQL Server', 'MongoDB', 'Snowflake', 'BigQuery'],
    features: ['Full CDC', 'Masking', 'Transforms', 'MCP', 'API', 'Benchmarking', 'Multi-engine', 'YouTube Stream', 'OBS', 'Twitch'],
    pricePerHour: 15,
    streamEnabled: true,
  },
  {
    id: 'room-practice-01',
    name: 'Practice Pod 1',
    type: 'practice',
    status: 'available',
    capacity: 50,
    currentUsers: 12,
    specs: { cpu: '2 vCPU', ram: '8 GB', storage: '50 GB SSD', network: '500 Mbps' },
    engines: ['PostgreSQL'],
    features: ['Basic CDC', 'Tutorial Mode', 'AI Guide'],
    pricePerHour: 1,
    streamEnabled: false,
  },
  {
    id: 'room-practice-02',
    name: 'Practice Pod 2',
    type: 'practice',
    status: 'available',
    capacity: 50,
    currentUsers: 23,
    specs: { cpu: '2 vCPU', ram: '8 GB', storage: '50 GB SSD', network: '500 Mbps' },
    engines: ['PostgreSQL', 'MySQL'],
    features: ['Basic CDC', 'Tutorial Mode', 'AI Guide', 'MCP Intro'],
    pricePerHour: 1,
    streamEnabled: false,
  },
];

const ROOM_TYPE_CONFIG = {
  standard: { color: 'cyan', icon: Monitor, label: 'Standard' },
  premium: { color: 'purple', icon: Zap, label: 'Premium' },
  streaming: { color: 'red', icon: Play, label: 'Streaming' },
  practice: { color: 'green', icon: Users, label: 'Practice' },
};

export default function RoomsPage() {
  const [rooms, setRooms] = useState<LabRoom[]>(ROOMS);
  const [filterType, setFilterType] = useState<string>('');
  const [filterStatus, setFilterStatus] = useState<string>('');
  const [autoRefresh, setAutoRefresh] = useState(true);

  useEffect(() => {
    if (!autoRefresh) return;
    const timer = setInterval(() => {
      // Simulate real-time updates
      setRooms(prev => prev.map(room => ({
        ...room,
        currentUsers: Math.max(0, Math.min(room.capacity, 
          room.currentUsers + Math.floor(Math.random() * 3) - 1
        )),
      })));
    }, 5000);
    return () => clearInterval(timer);
  }, [autoRefresh]);

  const filteredRooms = rooms.filter(room => 
    (filterType === '' || room.type === filterType) &&
    (filterStatus === '' || room.status === filterStatus)
  );

  const totalCapacity = rooms.reduce((sum, r) => sum + r.capacity, 0);
  const totalUsers = rooms.reduce((sum, r) => sum + r.currentUsers, 0);
  const availableRooms = rooms.filter(r => r.status === 'available').length;

  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      <Header />
      
      <div className="pt-24 pb-16">
        <div className="max-w-7xl mx-auto px-6">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <div>
              <h1 className="text-3xl font-bold mb-2">Lab Rooms</h1>
              <p className="text-gray-400">Multi-room infrastructure with auto-scaling</p>
            </div>
            
            <div className="flex items-center gap-3">
              <button 
                onClick={() => setAutoRefresh(!autoRefresh)}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
                  autoRefresh 
                    ? 'bg-green-500/10 text-green-400 border border-green-500/20' 
                    : 'bg-white/5 text-gray-400 border border-white/10'
                }`}
              >
                <RefreshCw className={`w-4 h-4 ${autoRefresh ? 'animate-spin' : ''}`} />
                {autoRefresh ? 'Live' : 'Paused'}
              </button>
              <Link 
                href="/lab/practice"
                className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-400 hover:to-emerald-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all"
              >
                Practice ($1/run)
              </Link>
            </div>
          </div>
          
          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4">
              <div className="flex items-center gap-2 text-gray-500 mb-1">
                <Server className="w-4 h-4" />
                <span className="text-sm">Total Rooms</span>
              </div>
              <div className="text-2xl font-bold">{rooms.length}</div>
            </div>
            <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4">
              <div className="flex items-center gap-2 text-gray-500 mb-1">
                <Users className="w-4 h-4" />
                <span className="text-sm">Active Users</span>
              </div>
              <div className="text-2xl font-bold text-cyan-400">{totalUsers}</div>
            </div>
            <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4">
              <div className="flex items-center gap-2 text-gray-500 mb-1">
                <HardDrive className="w-4 h-4" />
                <span className="text-sm">Total Capacity</span>
              </div>
              <div className="text-2xl font-bold">{totalCapacity}</div>
            </div>
            <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4">
              <div className="flex items-center gap-2 text-gray-500 mb-1">
                <Wifi className="w-4 h-4" />
                <span className="text-sm">Available</span>
              </div>
              <div className="text-2xl font-bold text-green-400">{availableRooms}</div>
            </div>
          </div>
          
          {/* Filters */}
          <div className="flex flex-wrap gap-3 mb-6">
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-gray-300 focus:outline-none focus:border-cyan-500"
            >
              <option value="">All Types</option>
              <option value="standard">Standard</option>
              <option value="premium">Premium</option>
              <option value="streaming">Streaming</option>
              <option value="practice">Practice</option>
            </select>
            
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-gray-300 focus:outline-none focus:border-cyan-500"
            >
              <option value="">All Status</option>
              <option value="available">Available</option>
              <option value="occupied">Occupied</option>
              <option value="maintenance">Maintenance</option>
            </select>
          </div>
          
          {/* Room Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredRooms.map((room) => {
              const config = ROOM_TYPE_CONFIG[room.type];
              const occupancy = (room.currentUsers / room.capacity) * 100;
              
              return (
                <div 
                  key={room.id}
                  className={`bg-white/[0.02] border rounded-xl overflow-hidden transition-all hover:bg-white/[0.04] ${
                    room.status === 'available' 
                      ? `border-${config.color}-500/20` 
                      : room.status === 'maintenance'
                      ? 'border-amber-500/20 opacity-60'
                      : 'border-white/5'
                  }`}
                >
                  {/* Header */}
                  <div className={`px-4 py-3 bg-${config.color}-500/5 border-b border-white/5`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <config.icon className={`w-4 h-4 text-${config.color}-400`} />
                        <span className="font-semibold text-sm">{room.name}</span>
                      </div>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        room.status === 'available' ? 'bg-green-500/10 text-green-400' :
                        room.status === 'occupied' ? 'bg-amber-500/10 text-amber-400' :
                        'bg-gray-500/10 text-gray-400'
                      }`}>
                        {room.status}
                      </span>
                    </div>
                  </div>
                  
                  {/* Body */}
                  <div className="p-4 space-y-3">
                    {/* Occupancy */}
                    <div>
                      <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                        <span>Occupancy</span>
                        <span>{room.currentUsers}/{room.capacity}</span>
                      </div>
                      <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full transition-all ${
                            occupancy > 80 ? 'bg-red-500' :
                            occupancy > 50 ? 'bg-amber-500' :
                            'bg-green-500'
                          }`}
                          style={{ width: `${occupancy}%` }}
                        />
                      </div>
                    </div>
                    
                    {/* Specs */}
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="flex items-center gap-1 text-gray-500">
                        <Cpu className="w-3 h-3" /> {room.specs.cpu}
                      </div>
                      <div className="flex items-center gap-1 text-gray-500">
                        <HardDrive className="w-3 h-3" /> {room.specs.ram}
                      </div>
                      <div className="flex items-center gap-1 text-gray-500">
                        <Database className="w-3 h-3" /> {room.specs.storage}
                      </div>
                      <div className="flex items-center gap-1 text-gray-500">
                        <Wifi className="w-3 h-3" /> {room.specs.network}
                      </div>
                    </div>
                    
                    {/* Engines */}
                    <div className="flex flex-wrap gap-1">
                      {room.engines.slice(0, 3).map(engine => (
                        <span key={engine} className="text-xs bg-white/5 px-2 py-0.5 rounded">
                          {engine}
                        </span>
                      ))}
                      {room.engines.length > 3 && (
                        <span className="text-xs text-gray-500">+{room.engines.length - 3}</span>
                      )}
                    </div>
                    
                    {/* Features */}
                    <div className="flex flex-wrap gap-1">
                      {room.features.slice(0, 2).map(feature => (
                        <span key={feature} className="text-xs bg-purple-500/10 text-purple-400 px-2 py-0.5 rounded">
                          {feature}
                        </span>
                      ))}
                      {room.features.length > 2 && (
                        <span className="text-xs text-gray-500">+{room.features.length - 2}</span>
                      )}
                    </div>
                    
                    {/* Price & Stream */}
                    <div className="flex items-center justify-between pt-2 border-t border-white/5">
                      <div className="text-sm">
                        {room.pricePerHour === 0 ? (
                          <span className="text-green-400 font-semibold">Free</span>
                        ) : (
                          <span className="text-amber-400 font-semibold">${room.pricePerHour}/hr</span>
                        )}
                      </div>
                      {room.streamEnabled && (
                        <span className="text-xs bg-red-500/10 text-red-400 px-2 py-0.5 rounded flex items-center gap-1">
                          <Play className="w-3 h-3" /> Stream
                        </span>
                      )}
                    </div>
                    
                    {/* Action */}
                    <Link
                      href={room.status === 'available' ? `/lab/${room.id}` : '#'}
                      className={`block w-full text-center py-2 rounded-lg text-sm font-medium transition-colors ${
                        room.status === 'available'
                          ? `bg-${config.color}-500/20 text-${config.color}-400 hover:bg-${config.color}-500/30`
                          : 'bg-white/5 text-gray-500 cursor-not-allowed'
                      }`}
                    >
                      {room.status === 'available' ? 'Enter Room' : 
                       room.status === 'occupied' ? 'Join Queue' : 'Under Maintenance'}
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
