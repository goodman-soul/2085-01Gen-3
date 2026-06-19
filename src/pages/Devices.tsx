import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, MapPin, Clock, Eye } from 'lucide-react';
import { useAppStore } from '@/store';
import Loading from '@/components/Loading';
import Error from '@/components/Error';
import MaterialBar from '@/components/MaterialBar';
import StatusBadge from '@/components/StatusBadge';
import { cn } from '@/lib/utils';

export default function Devices() {
  const navigate = useNavigate();
  const { devices, loading, error, fetchDevices } = useAppStore();

  const [floorFilter, setFloorFilter] = useState<number | 'all'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'online' | 'offline' | 'error'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchDevices();
  }, [fetchDevices]);

  const floors = useMemo(() => {
    const floorSet = new Set(devices.map(d => d.floor));
    return Array.from(floorSet).sort((a, b) => a - b);
  }, [devices]);

  const filteredDevices = useMemo(() => {
    return devices.filter(device => {
      const matchFloor = floorFilter === 'all' || device.floor === floorFilter;
      const matchStatus = statusFilter === 'all' || device.status === statusFilter;
      const matchSearch = searchQuery === '' ||
        device.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        device.location.toLowerCase().includes(searchQuery.toLowerCase());
      return matchFloor && matchStatus && matchSearch;
    });
  }, [devices, floorFilter, statusFilter, searchQuery]);

  if (loading.devices) {
    return (
      <div className="space-y-6">
        <div className="flex flex-wrap gap-4">
          <Loading variant="text" count={1} className="w-40 h-10" />
          <Loading variant="text" count={1} className="w-40 h-10" />
          <Loading variant="text" count={1} className="flex-1 h-10" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-white rounded-xl p-6 shadow-sm">
              <Loading variant="text" count={3} />
              <div className="space-y-4 mt-6">
                <Loading variant="text" count={1} className="h-12" />
                <Loading variant="text" count={1} className="h-12" />
                <Loading variant="text" count={1} className="h-12" />
                <Loading variant="text" count={1} className="h-12" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return <Error message={error} onRetry={() => fetchDevices()} />;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold text-gray-900">设备管理</h1>
        <span className="text-sm text-gray-500">共 {filteredDevices.length} 台设备</span>
      </div>

      <div className="bg-white rounded-xl p-4 shadow-sm">
        <div className="flex flex-wrap gap-4">
          <div className="w-full sm:w-auto">
            <label className="block text-sm font-medium text-gray-700 mb-1">楼层</label>
            <select
              value={floorFilter}
              onChange={(e) => setFloorFilter(e.target.value === 'all' ? 'all' : Number(e.target.value))}
              className="w-full sm:w-40 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
            >
              <option value="all">全部楼层</option>
              {floors.map(floor => (
                <option key={floor} value={floor}>{floor}层</option>
              ))}
            </select>
          </div>

          <div className="w-full sm:w-auto">
            <label className="block text-sm font-medium text-gray-700 mb-1">状态</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as 'all' | 'online' | 'offline' | 'error')}
              className="w-full sm:w-40 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
            >
              <option value="all">全部状态</option>
              <option value="online">在线</option>
              <option value="offline">离线</option>
              <option value="error">错误</option>
            </select>
          </div>

          <div className="flex-1 min-w-[200px]">
            <label className="block text-sm font-medium text-gray-700 mb-1">搜索</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="搜索设备ID或位置..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
              />
            </div>
          </div>
        </div>
      </div>

      {filteredDevices.length === 0 ? (
        <div className="bg-white rounded-xl p-12 shadow-sm text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Search className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">没有找到设备</h3>
          <p className="text-sm text-gray-500">请尝试调整筛选条件</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDevices.map(device => (
            <div key={device.id} className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{device.id}</h3>
                  <div className="flex items-center gap-1 text-sm text-gray-500 mt-1">
                    <MapPin className="w-3.5 h-3.5" />
                    <span>{device.floor}层 · {device.location}</span>
                  </div>
                </div>
                <StatusBadge status={device.status} />
              </div>

              {device.faultCode && (
                <div className="mb-4 px-3 py-2 bg-red-50 border border-red-100 rounded-lg">
                  <span className="text-sm font-medium text-red-700">故障码: {device.faultCode}</span>
                </div>
              )}

              <div className="space-y-3 mb-4">
                <MaterialBar label="咖啡豆" value={device.bean} />
                <MaterialBar label="牛奶" value={device.milk} />
                <MaterialBar label="水" value={device.water} />
                <MaterialBar label="杯子" value={device.cup} />
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                <div className="flex items-center gap-1.5 text-sm text-gray-500">
                  <Clock className="w-4 h-4" />
                  <span>{device.lastReport}</span>
                </div>
                <button
                  onClick={() => navigate(`/devices/${device.id}`)}
                  className={cn(
                    'inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-lg transition-colors',
                    'bg-blue-50 text-blue-600 hover:bg-blue-100'
                  )}
                >
                  <Eye className="w-4 h-4" />
                  详情
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
