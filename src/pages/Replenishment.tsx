import { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ClipboardList,
  History,
  Filter,
  User,
  Clock,
  Calendar,
  ChevronDown,
  ChevronUp,
  Play,
  CheckCircle,
  Coffee,
  Droplets,
  Package,
  GlassWater,
  Building2,
  Timer,
} from 'lucide-react';
import { useAppStore } from '@/store';
import Loading from '@/components/Loading';
import Error from '@/components/Error';
import StatusBadge from '@/components/StatusBadge';
import MaterialBar from '@/components/MaterialBar';
import { cn } from '@/lib/utils';
import type { ReplenishmentTask } from '../../shared/types';

const TASK_STATUS_OPTIONS = [
  { label: '全部', value: 'all' },
  { label: '待处理', value: 'pending' },
  { label: '进行中', value: 'in_progress' },
  { label: '已完成', value: 'completed' },
];

const TIME_RANGE_OPTIONS = [
  { label: '近7天', value: 7 },
  { label: '近30天', value: 30 },
  { label: '近90天', value: 90 },
];

export default function Replenishment() {
  const { '*': subRoute } = useParams();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<'tasks' | 'history'>(
    subRoute === 'history' ? 'history' : 'tasks'
  );
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [timeRange, setTimeRange] = useState(30);
  const [expandedTasks, setExpandedTasks] = useState<Set<string>>(new Set());

  const {
    tasks,
    taskHistory,
    devices,
    loading,
    error,
    fetchTasks,
    fetchHistory,
    completeTask,
    fetchDevices,
  } = useAppStore();

  useEffect(() => {
    if (subRoute === 'history') {
      setActiveTab('history');
    } else {
      setActiveTab('tasks');
    }
  }, [subRoute]);

  useEffect(() => {
    if (activeTab === 'tasks') {
      fetchTasks(statusFilter === 'all' ? undefined : statusFilter);
    } else {
      fetchHistory(timeRange);
    }
    fetchDevices();
  }, [activeTab, statusFilter, timeRange, fetchTasks, fetchHistory, fetchDevices]);

  const handleTabChange = (tab: 'tasks' | 'history') => {
    setActiveTab(tab);
    if (tab === 'history') {
      navigate('/replenishment/history');
    } else {
      navigate('/replenishment/tasks');
    }
  };

  const toggleTaskExpand = (taskId: string) => {
    setExpandedTasks((prev) => {
      const next = new Set(prev);
      if (next.has(taskId)) {
        next.delete(taskId);
      } else {
        next.add(taskId);
      }
      return next;
    });
  };

  const handleStartTask = (taskId: string) => {
    console.log('开始补货任务:', taskId);
  };

  const handleCompleteTask = async (taskId: string) => {
    await completeTask(taskId);
  };

  const getTaskMaterialSummary = (task: ReplenishmentTask) => {
    return task.items.reduce(
      (acc, item) => ({
        bean: acc.bean + item.beanNeeded,
        milk: acc.milk + item.milkNeeded,
        water: acc.water + item.waterNeeded,
        cup: acc.cup + item.cupNeeded,
      }),
      { bean: 0, milk: 0, water: 0, cup: 0 }
    );
  };

  const getDeviceInfo = (deviceId: string) => {
    return devices.find((d) => d.id === deviceId);
  };

  const calculateDuration = (start: string, end: string | null) => {
    if (!end) return '-';
    const startTime = new Date(start).getTime();
    const endTime = new Date(end).getTime();
    const minutes = Math.floor((endTime - startTime) / 60000);
    if (minutes < 60) return `${minutes}分钟`;
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return `${hours}小时${remainingMinutes > 0 ? ` ${remainingMinutes}分钟` : ''}`;
  };

  const formatDateTime = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleString('zh-CN', {
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getEstimatedCompletion = (createdAt: string) => {
    const date = new Date(createdAt);
    date.setHours(date.getHours() + 2);
    return date.toLocaleString('zh-CN', {
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const filteredTasks = useMemo(() => {
    if (statusFilter === 'all') return tasks;
    return tasks.filter((task) => task.status === statusFilter);
  }, [tasks, statusFilter]);

  if (loading.tasks || loading.taskHistory) {
    return (
      <div className="space-y-6">
        <Loading variant="text" count={1} className="w-48 h-10" />
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="bg-white rounded-xl p-6 shadow-sm">
              <Loading variant="text" count={3} />
              <div className="mt-4 space-y-3">
                <Loading variant="text" count={1} className="h-8" />
                <Loading variant="text" count={1} className="h-8" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return <Error message={error} />;
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">补货管理</h1>
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => handleTabChange('tasks')}
            className={cn(
              'px-6 py-3 text-sm font-medium border-b-2 transition-colors',
              activeTab === 'tasks'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            )}
          >
            <div className="flex items-center gap-2">
              <ClipboardList className="w-4 h-4" />
              补货任务
            </div>
          </button>
          <button
            onClick={() => handleTabChange('history')}
            className={cn(
              'px-6 py-3 text-sm font-medium border-b-2 transition-colors',
              activeTab === 'history'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            )}
          >
            <div className="flex items-center gap-2">
              <History className="w-4 h-4" />
              补货历史
            </div>
          </button>
        </div>
      </div>

      {activeTab === 'tasks' ? (
        <div className="space-y-6">
          <div className="bg-white rounded-xl p-4 shadow-sm">
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-2">
                <Filter className="w-5 h-5 text-gray-400" />
                <span className="text-sm text-gray-600">状态筛选:</span>
                <div className="flex flex-wrap gap-2">
                  {TASK_STATUS_OPTIONS.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => setStatusFilter(option.value)}
                      className={cn(
                        'px-3 py-1 text-sm rounded-full transition-colors',
                        statusFilter === option.value
                          ? 'bg-blue-100 text-blue-700 font-medium'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      )}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {filteredTasks.length === 0 ? (
            <div className="bg-white rounded-xl p-12 shadow-sm text-center">
              <ClipboardList className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">暂无符合条件的补货任务</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredTasks.map((task) => {
                const summary = getTaskMaterialSummary(task);
                const isExpanded = expandedTasks.has(task.id);
                const totalItems = summary.bean + summary.milk + summary.water + summary.cup;

                return (
                  <div
                    key={task.id}
                    className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden"
                  >
                    <div className="p-6">
                      <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
                        <div className="flex items-start gap-4">
                          <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center flex-shrink-0">
                            <Building2 className="w-6 h-6 text-blue-600" />
                          </div>
                          <div>
                            <div className="flex items-center gap-3 mb-1">
                              <h3 className="text-lg font-semibold text-gray-900">
                                {task.floor}层
                              </h3>
                              <StatusBadge status={task.status} />
                            </div>
                            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                              <div className="flex items-center gap-1.5">
                                <User className="w-4 h-4" />
                                <span>负责人: {task.assignee}</span>
                              </div>
                              <div className="flex items-center gap-1.5">
                                <Calendar className="w-4 h-4" />
                                <span>创建时间: {formatDateTime(task.createdAt)}</span>
                              </div>
                              <div className="flex items-center gap-1.5">
                                <Clock className="w-4 h-4" />
                                <span>预计完成: {getEstimatedCompletion(task.createdAt)}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {task.status === 'pending' && (
                            <button
                              onClick={() => handleStartTask(task.id)}
                              className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-500 text-white text-sm font-medium rounded-lg hover:bg-blue-600 transition-colors"
                            >
                              <Play className="w-4 h-4" />
                              开始补货
                            </button>
                          )}
                          {task.status === 'in_progress' && (
                            <button
                              onClick={() => handleCompleteTask(task.id)}
                              disabled={loading.completeTask}
                              className="inline-flex items-center gap-1.5 px-4 py-2 bg-green-500 text-white text-sm font-medium rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50"
                            >
                              <CheckCircle className="w-4 h-4" />
                              完成补货
                            </button>
                          )}
                        </div>
                      </div>

                      <div className="bg-gray-50 rounded-lg p-4 mb-4">
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="text-sm font-semibold text-gray-700">物料需求汇总</h4>
                          <span className="text-sm text-gray-500">
                            共需补充 <span className="font-semibold text-gray-900">{totalItems}</span> 份物料
                          </span>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center">
                              <Coffee className="w-4 h-4 text-amber-600" />
                            </div>
                            <div>
                              <p className="text-xs text-gray-500">豆仓</p>
                              <p className="text-sm font-semibold text-gray-900">{summary.bean}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                              <Droplets className="w-4 h-4 text-blue-600" />
                            </div>
                            <div>
                              <p className="text-xs text-gray-500">奶盒</p>
                              <p className="text-sm font-semibold text-gray-900">{summary.milk}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-cyan-100 rounded-lg flex items-center justify-center">
                              <GlassWater className="w-4 h-4 text-cyan-600" />
                            </div>
                            <div>
                              <p className="text-xs text-gray-500">水箱</p>
                              <p className="text-sm font-semibold text-gray-900">{summary.water}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                              <Package className="w-4 h-4 text-purple-600" />
                            </div>
                            <div>
                              <p className="text-xs text-gray-500">杯子</p>
                              <p className="text-sm font-semibold text-gray-900">{summary.cup}</p>
                            </div>
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={() => toggleTaskExpand(task.id)}
                        className="w-full flex items-center justify-between text-sm text-gray-600 hover:text-gray-900 transition-colors"
                      >
                        <span className="font-medium">设备清单 ({task.items.length} 台)</span>
                        {isExpanded ? (
                          <ChevronUp className="w-5 h-5" />
                        ) : (
                          <ChevronDown className="w-5 h-5" />
                        )}
                      </button>
                    </div>

                    {isExpanded && (
                      <div className="border-t border-gray-100 bg-gray-50">
                        <div className="divide-y divide-gray-100">
                          {task.items.map((item) => {
                            const device = getDeviceInfo(item.deviceId);
                            return (
                              <div
                                key={item.id}
                                className="p-4 hover:bg-gray-100 transition-colors"
                              >
                                <div className="flex items-center justify-between mb-3">
                                  <div className="flex items-center gap-2">
                                    <span className="text-sm font-semibold text-gray-900">
                                      {item.deviceId}
                                    </span>
                                    {device && (
                                      <span className="text-xs text-gray-500">
                                        {device.location}
                                      </span>
                                    )}
                                  </div>
                                  {device && <StatusBadge status={device.status} />}
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                  <MaterialBar
                                    label="咖啡豆"
                                    value={device ? device.bean : 0}
                                    showValue={false}
                                  />
                                  <MaterialBar
                                    label="牛奶"
                                    value={device ? device.milk : 0}
                                    showValue={false}
                                  />
                                  <MaterialBar
                                    label="水"
                                    value={device ? device.water : 0}
                                    showValue={false}
                                  />
                                  <MaterialBar
                                    label="杯子"
                                    value={device ? device.cup : 0}
                                    showValue={false}
                                  />
                                </div>
                                <div className="mt-3 flex flex-wrap gap-4 text-xs text-gray-500">
                                  <span>需补豆仓: {item.beanNeeded}</span>
                                  <span>需补奶盒: {item.milkNeeded}</span>
                                  <span>需补水箱: {item.waterNeeded}</span>
                                  <span>需补杯子: {item.cupNeeded}</span>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-6">
          <div className="bg-white rounded-xl p-4 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-gray-400" />
                <span className="text-sm text-gray-600">时间范围:</span>
                <div className="flex bg-gray-100 rounded-lg p-1">
                  {TIME_RANGE_OPTIONS.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => setTimeRange(option.value)}
                      className={cn(
                        'px-4 py-1.5 text-sm rounded-md transition-colors',
                        timeRange === option.value
                          ? 'bg-white text-blue-600 shadow-sm font-medium'
                          : 'text-gray-600 hover:text-gray-900'
                      )}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {taskHistory.length === 0 ? (
            <div className="bg-white rounded-xl p-12 shadow-sm text-center">
              <History className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">暂无补货历史记录</p>
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        楼层
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        状态
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        负责人
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        完成时间
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        物料补充总量
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        用时
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {taskHistory.map((task) => {
                      const summary = getTaskMaterialSummary(task);
                      const totalItems =
                        summary.bean + summary.milk + summary.water + summary.cup;

                      return (
                        <tr
                          key={task.id}
                          className="hover:bg-gray-50 transition-colors"
                        >
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center gap-2">
                              <Building2 className="w-4 h-4 text-gray-400" />
                              <span className="text-sm font-medium text-gray-900">
                                {task.floor}层
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <StatusBadge status={task.status} />
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center gap-2">
                              <User className="w-4 h-4 text-gray-400" />
                              <span className="text-sm text-gray-900">
                                {task.assignee}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="text-sm text-gray-600">
                              {task.completedAt
                                ? formatDateTime(task.completedAt)
                                : '-'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center gap-3">
                              <span className="text-sm font-semibold text-gray-900">
                                {totalItems}
                              </span>
                              <div className="flex items-center gap-2 text-xs text-gray-500">
                                <span className="flex items-center gap-1">
                                  <Coffee className="w-3 h-3 text-amber-500" />
                                  {summary.bean}
                                </span>
                                <span className="flex items-center gap-1">
                                  <Droplets className="w-3 h-3 text-blue-500" />
                                  {summary.milk}
                                </span>
                                <span className="flex items-center gap-1">
                                  <GlassWater className="w-3 h-3 text-cyan-500" />
                                  {summary.water}
                                </span>
                                <span className="flex items-center gap-1">
                                  <Package className="w-3 h-3 text-purple-500" />
                                  {summary.cup}
                                </span>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center gap-1.5">
                              <Timer className="w-4 h-4 text-gray-400" />
                              <span className="text-sm text-gray-900">
                                {calculateDuration(task.createdAt, task.completedAt)}
                              </span>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
