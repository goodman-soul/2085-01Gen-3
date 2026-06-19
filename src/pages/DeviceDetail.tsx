import { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, MapPin, Clock, AlertCircle, CheckCircle, Activity, TrendingUp, Wrench } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useAppStore } from '@/store';
import Loading from '@/components/Loading';
import Error from '@/components/Error';
import MaterialBar from '@/components/MaterialBar';
import StatusBadge from '@/components/StatusBadge';
import { cn } from '@/lib/utils';
import type { DeviceStatus } from '../../shared/types';

interface FaultRecord {
  id: number;
  faultCode: string;
  startTime: string;
  endTime: string | null;
  status: 'resolved' | 'ongoing';
}

export default function DeviceDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { selectedDevice, deviceHistory, loading, error, fetchDevice, fetchDeviceHistory } = useAppStore();

  const [activeTab, setActiveTab] = useState<'realtime' | 'history' | 'faults'>('realtime');

  useEffect(() => {
    if (id) {
      fetchDevice(id);
      fetchDeviceHistory(id, 30);
    }
  }, [id, fetchDevice, fetchDeviceHistory]);

  const chartData = useMemo(() => {
    const dailyData: Record<string, { date: string; bean: number; milk: number; water: number; cup: number }> = {};

    deviceHistory.forEach(record => {
      const date = record.timestamp.slice(0, 10);
      if (!dailyData[date]) {
        dailyData[date] = {
          date,
          bean: record.bean,
          milk: record.milk,
          water: record.water,
          cup: record.cup,
        };
      }
    });

    return Object.values(dailyData).sort((a, b) => a.date.localeCompare(b.date));
  }, [deviceHistory]);

  const faultRecords = useMemo((): FaultRecord[] => {
    const records: FaultRecord[] = [];
    let currentFault: FaultRecord | null = null;

    const sortedHistory = [...deviceHistory].sort((a, b) => a.timestamp.localeCompare(b.timestamp));

    sortedHistory.forEach((record: DeviceStatus) => {
      if (record.faultCode) {
        if (!currentFault) {
          currentFault = {
            id: record.id,
            faultCode: record.faultCode,
            startTime: record.timestamp,
            endTime: null,
            status: 'ongoing',
          };
        } else if (currentFault.faultCode !== record.faultCode) {
          currentFault.endTime = record.timestamp;
          currentFault.status = 'resolved';
          records.push(currentFault);
          currentFault = {
            id: record.id,
            faultCode: record.faultCode,
            startTime: record.timestamp,
            endTime: null,
            status: 'ongoing',
          };
        }
      } else if (currentFault) {
        currentFault.endTime = record.timestamp;
        currentFault.status = 'resolved';
        records.push(currentFault);
        currentFault = null;
      }
    });

    if (currentFault) {
      records.push(currentFault);
    }

    return records.reverse();
  }, [deviceHistory]);

  const isLoading = loading.device || loading.deviceHistory;
  const hasError = error;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Loading variant="text" count={1} className="h-8 w-32" />
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16">
              <Loading variant="circle" />
            </div>
            <div className="flex-1 space-y-2">
              <Loading variant="text" count={1} className="h-6 w-48" />
              <Loading variant="text" count={1} className="h-4 w-64" />
            </div>
          </div>
          <Loading variant="text" count={3} className="h-10" />
        </div>
        <div className="bg-white rounded-xl shadow-sm">
          <Loading variant="text" count={1} className="h-12" />
          <div className="p-6">
            <Loading variant="text" count={4} className="h-16" />
          </div>
        </div>
      </div>
    );
  }

  if (hasError) {
    return (
      <Error
        message={hasError}
        onRetry={() => {
          if (id) {
            fetchDevice(id);
            fetchDeviceHistory(id, 30);
          }
        }}
      />
    );
  }

  if (!selectedDevice) {
    return (
      <div className="bg-white rounded-xl p-12 shadow-sm text-center">
        <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">设备不存在</h3>
        <p className="text-sm text-gray-500 mb-4">请检查设备ID是否正确</p>
        <button
          onClick={() => navigate('/devices')}
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          返回设备列表
        </button>
      </div>
    );
  }

  const tabs = [
    { key: 'realtime', label: '实时状态', icon: Activity },
    { key: 'history', label: '历史趋势', icon: TrendingUp },
    { key: 'faults', label: '故障记录', icon: Wrench },
  ] as const;

  return (
    <div className="space-y-6">
      <button
        onClick={() => navigate('/devices')}
        className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        返回设备列表
      </button>

      <div className="bg-white rounded-xl p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="w-16 h-16 bg-blue-50 rounded-xl flex items-center justify-center">
            <span className="text-2xl font-bold text-blue-600">{selectedDevice.id.slice(-2)}</span>
          </div>
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-3 mb-2">
              <h1 className="text-2xl font-bold text-gray-900">{selectedDevice.id}</h1>
              <StatusBadge status={selectedDevice.status} />
            </div>
            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
              <div className="flex items-center gap-1.5">
                <MapPin className="w-4 h-4" />
                <span>{selectedDevice.floor}层 · {selectedDevice.location}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Clock className="w-4 h-4" />
                <span>上次上报: {selectedDevice.lastReport}</span>
              </div>
              {selectedDevice.faultCode && (
                <div className="flex items-center gap-1.5 text-red-600">
                  <AlertCircle className="w-4 h-4" />
                  <span>故障码: {selectedDevice.faultCode}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="border-b border-gray-200">
          <nav className="flex -mb-px">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={cn(
                    'flex items-center gap-2 px-6 py-4 text-sm font-medium border-b-2 transition-colors',
                    activeTab === tab.key
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  )}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'realtime' && (
            <div className="space-y-8">
              <div className="space-y-4">
                <h2 className="text-lg font-semibold text-gray-900">物料余量</h2>
                <div className="space-y-6">
                  <div>
                    <MaterialBar label="咖啡豆" value={selectedDevice.bean} threshold={30} />
                    <div className="mt-2 flex gap-4">
                      <div className="flex items-center gap-2">
                        <div className={cn('w-3 h-3 rounded-full', selectedDevice.bean < 5 ? 'bg-red-500' : selectedDevice.bean < 30 ? 'bg-orange-500' : 'bg-green-500')} />
                        <span className="text-sm text-gray-600">{selectedDevice.bean < 5 ? '紧急' : selectedDevice.bean < 30 ? '偏低' : '正常'}</span>
                      </div>
                    </div>
                  </div>
                  <div>
                    <MaterialBar label="牛奶" value={selectedDevice.milk} threshold={30} />
                    <div className="mt-2 flex gap-4">
                      <div className="flex items-center gap-2">
                        <div className={cn('w-3 h-3 rounded-full', selectedDevice.milk < 5 ? 'bg-red-500' : selectedDevice.milk < 30 ? 'bg-orange-500' : 'bg-green-500')} />
                        <span className="text-sm text-gray-600">{selectedDevice.milk < 5 ? '紧急' : selectedDevice.milk < 30 ? '偏低' : '正常'}</span>
                      </div>
                    </div>
                  </div>
                  <div>
                    <MaterialBar label="水" value={selectedDevice.water} threshold={30} />
                    <div className="mt-2 flex gap-4">
                      <div className="flex items-center gap-2">
                        <div className={cn('w-3 h-3 rounded-full', selectedDevice.water < 5 ? 'bg-red-500' : selectedDevice.water < 30 ? 'bg-orange-500' : 'bg-green-500')} />
                        <span className="text-sm text-gray-600">{selectedDevice.water < 5 ? '紧急' : selectedDevice.water < 30 ? '偏低' : '正常'}</span>
                      </div>
                    </div>
                  </div>
                  <div>
                    <MaterialBar label="杯子" value={selectedDevice.cup} threshold={30} />
                    <div className="mt-2 flex gap-4">
                      <div className="flex items-center gap-2">
                        <div className={cn('w-3 h-3 rounded-full', selectedDevice.cup < 5 ? 'bg-red-500' : selectedDevice.cup < 30 ? 'bg-orange-500' : 'bg-green-500')} />
                        <span className="text-sm text-gray-600">{selectedDevice.cup < 5 ? '紧急' : selectedDevice.cup < 30 ? '偏低' : '正常'}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-gray-50 rounded-xl p-4">
                  <div className="text-3xl font-bold text-amber-600">{selectedDevice.bean}%</div>
                  <div className="text-sm text-gray-500 mt-1">咖啡豆</div>
                </div>
                <div className="bg-gray-50 rounded-xl p-4">
                  <div className="text-3xl font-bold text-blue-600">{selectedDevice.milk}%</div>
                  <div className="text-sm text-gray-500 mt-1">牛奶</div>
                </div>
                <div className="bg-gray-50 rounded-xl p-4">
                  <div className="text-3xl font-bold text-cyan-600">{selectedDevice.water}%</div>
                  <div className="text-sm text-gray-500 mt-1">水</div>
                </div>
                <div className="bg-gray-50 rounded-xl p-4">
                  <div className="text-3xl font-bold text-emerald-600">{selectedDevice.cup}%</div>
                  <div className="text-sm text-gray-500 mt-1">杯子</div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'history' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">近30天物料趋势</h2>
                <span className="text-sm text-gray-500">共 {chartData.length} 条记录</span>
              </div>
              {chartData.length === 0 ? (
                <div className="text-center py-12">
                  <TrendingUp className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">暂无历史数据</p>
                </div>
              ) : (
                <div className="h-96">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis
                        dataKey="date"
                        tick={{ fontSize: 12 }}
                        tickFormatter={(value) => value.slice(5)}
                        interval={Math.floor(chartData.length / 10)}
                      />
                      <YAxis
                        tick={{ fontSize: 12 }}
                        domain={[0, 100]}
                        tickFormatter={(value) => `${value}%`}
                      />
                      <Tooltip
                        formatter={(value: number) => [`${value}%`]}
                        labelFormatter={(label) => `日期: ${label}`}
                      />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="bean"
                        name="咖啡豆"
                        stroke="#d97706"
                        strokeWidth={2}
                        dot={false}
                        activeDot={{ r: 6 }}
                      />
                      <Line
                        type="monotone"
                        dataKey="milk"
                        name="牛奶"
                        stroke="#2563eb"
                        strokeWidth={2}
                        dot={false}
                        activeDot={{ r: 6 }}
                      />
                      <Line
                        type="monotone"
                        dataKey="water"
                        name="水"
                        stroke="#0891b2"
                        strokeWidth={2}
                        dot={false}
                        activeDot={{ r: 6 }}
                      />
                      <Line
                        type="monotone"
                        dataKey="cup"
                        name="杯子"
                        stroke="#059669"
                        strokeWidth={2}
                        dot={false}
                        activeDot={{ r: 6 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>
          )}

          {activeTab === 'faults' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">故障记录</h2>
                <span className="text-sm text-gray-500">共 {faultRecords.length} 条记录</span>
              </div>
              {faultRecords.length === 0 ? (
                <div className="text-center py-12">
                  <CheckCircle className="w-12 h-12 text-green-300 mx-auto mb-4" />
                  <p className="text-gray-500">暂无故障记录</p>
                </div>
              ) : (
                <div className="relative">
                  <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200" />
                  <div className="space-y-6">
                    {faultRecords.map((fault, index) => (
                      <div key={index} className="relative pl-10">
                        <div className={cn(
                          'absolute left-0 w-8 h-8 rounded-full flex items-center justify-center',
                          fault.status === 'ongoing' ? 'bg-red-100' : 'bg-green-100'
                        )}>
                          {fault.status === 'ongoing' ? (
                            <AlertCircle className="w-4 h-4 text-red-600" />
                          ) : (
                            <CheckCircle className="w-4 h-4 text-green-600" />
                          )}
                        </div>
                        <div className="bg-gray-50 rounded-xl p-4">
                          <div className="flex flex-wrap items-start justify-between gap-2 mb-3">
                            <div className="flex items-center gap-3">
                              <span className="font-mono font-semibold text-red-600 bg-red-50 px-2 py-1 rounded">
                                {fault.faultCode}
                              </span>
                              <span className={cn(
                                'inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium',
                                fault.status === 'ongoing'
                                  ? 'bg-red-100 text-red-700'
                                  : 'bg-green-100 text-green-700'
                              )}>
                                {fault.status === 'ongoing' ? '处理中' : '已恢复'}
                              </span>
                            </div>
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                            <div>
                              <span className="text-gray-500">发生时间: </span>
                              <span className="text-gray-900 font-medium">{fault.startTime}</span>
                            </div>
                            <div>
                              <span className="text-gray-500">恢复时间: </span>
                              <span className="text-gray-900 font-medium">{fault.endTime || '-'}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
