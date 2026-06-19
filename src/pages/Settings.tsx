import { useEffect, useState } from 'react'
import {
  Building2,
  Bell,
  Clock,
  Mail,
  AlertTriangle,
  TrendingDown,
  RefreshCw,
  Save,
  CheckCircle2,
  Settings as SettingsIcon,
} from 'lucide-react'
import { useAppStore } from '@/store'
import Loading from '@/components/Loading'
import Error from '@/components/Error'
import { cn } from '@/lib/utils'

interface FormData {
  buildingName: string
  totalFloors: number
  replenishmentTime: string
  notificationEmail: string
  lowMaterialThreshold: number
  anomalyThreshold: number
  autoRefreshInterval: number
  anomalyDetectionEnabled: boolean
  emailNotificationEnabled: boolean
}

const DEFAULT_FORM_DATA: FormData = {
  buildingName: '商务中心A座',
  totalFloors: 15,
  replenishmentTime: '08:00',
  notificationEmail: 'admin@example.com',
  lowMaterialThreshold: 20,
  anomalyThreshold: 30,
  autoRefreshInterval: 30,
  anomalyDetectionEnabled: true,
  emailNotificationEnabled: true,
}

function Slider({
  label,
  value,
  onChange,
  min,
  max,
  unit,
  icon,
  color,
}: {
  label: string
  value: number
  onChange: (value: number) => void
  min: number
  max: number
  unit: string
  icon: React.ReactNode
  color: 'blue' | 'orange' | 'green'
}) {
  const colorClasses = {
    blue: {
      track: 'bg-blue-500',
      text: 'text-blue-600',
      iconBg: 'bg-blue-50',
      iconColor: 'text-blue-500',
    },
    orange: {
      track: 'bg-orange-500',
      text: 'text-orange-600',
      iconBg: 'bg-orange-50',
      iconColor: 'text-orange-500',
    },
    green: {
      track: 'bg-green-500',
      text: 'text-green-600',
      iconBg: 'bg-green-50',
      iconColor: 'text-green-500',
    },
  }

  const colors = colorClasses[color]
  const percentage = ((value - min) / (max - min)) * 100

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center', colors.iconBg)}>
            <div className={colors.iconColor}>{icon}</div>
          </div>
          <span className="text-sm font-medium text-gray-700">{label}</span>
        </div>
        <span className={cn('text-sm font-semibold', colors.text)}>
          {value} {unit}
        </span>
      </div>
      <div className="relative">
        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
          <div
            className={cn('h-full rounded-full transition-all duration-200', colors.track)}
            style={{ width: `${percentage}%` }}
          />
        </div>
        <input
          type="range"
          min={min}
          max={max}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />
      </div>
      <div className="flex justify-between text-xs text-gray-400">
        <span>{min} {unit}</span>
        <span>{max} {unit}</span>
      </div>
    </div>
  )
}

function ToggleSwitch({
  label,
  description,
  checked,
  onChange,
  icon,
}: {
  label: string
  description: string
  checked: boolean
  onChange: (checked: boolean) => void
  icon: React.ReactNode
}) {
  return (
    <div className="flex items-start justify-between p-4 bg-gray-50 rounded-xl">
      <div className="flex items-start gap-3">
        <div className={cn(
          'w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0',
          checked ? 'bg-green-100' : 'bg-gray-200'
        )}>
          <div className={checked ? 'text-green-600' : 'text-gray-400'}>{icon}</div>
        </div>
        <div>
          <p className="text-sm font-medium text-gray-900">{label}</p>
          <p className="text-xs text-gray-500 mt-0.5">{description}</p>
        </div>
      </div>
      <button
        onClick={() => onChange(!checked)}
        className={cn(
          'relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2',
          checked ? 'bg-green-500' : 'bg-gray-300'
        )}
      >
        <span
          className={cn(
            'pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out',
            checked ? 'translate-x-5' : 'translate-x-0'
          )}
        />
      </button>
    </div>
  )
}

function InputField({
  label,
  value,
  onChange,
  type = 'text',
  icon,
  placeholder,
}: {
  label: string
  value: string | number
  onChange: (value: string) => void
  type?: string
  icon: React.ReactNode
  placeholder?: string
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1.5">{label}</label>
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
          {icon}
        </div>
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none text-sm bg-gray-50 focus:bg-white"
        />
      </div>
    </div>
  )
}

export default function Settings() {
  const { settings, loading, error, fetchSettings, updateSettings } = useAppStore()
  const [formData, setFormData] = useState<FormData>(DEFAULT_FORM_DATA)
  const [saveSuccess, setSaveSuccess] = useState(false)

  useEffect(() => {
    fetchSettings()
  }, [fetchSettings])

  useEffect(() => {
    if (Object.keys(settings).length > 0) {
      setFormData({
        buildingName: settings.building_name || DEFAULT_FORM_DATA.buildingName,
        totalFloors: Number(settings.total_floors) || DEFAULT_FORM_DATA.totalFloors,
        replenishmentTime: settings.replenishment_time || DEFAULT_FORM_DATA.replenishmentTime,
        notificationEmail: settings.notification_email || DEFAULT_FORM_DATA.notificationEmail,
        lowMaterialThreshold: Number(settings.low_material_threshold) || DEFAULT_FORM_DATA.lowMaterialThreshold,
        anomalyThreshold: Number(settings.anomaly_threshold) || DEFAULT_FORM_DATA.anomalyThreshold,
        autoRefreshInterval: Number(settings.auto_refresh_interval) || DEFAULT_FORM_DATA.autoRefreshInterval,
        anomalyDetectionEnabled: settings.anomaly_detection_enabled === 'true' || DEFAULT_FORM_DATA.anomalyDetectionEnabled,
        emailNotificationEnabled: settings.email_notification_enabled === 'true' || DEFAULT_FORM_DATA.emailNotificationEnabled,
      })
    }
  }, [settings])

  const handleSave = async () => {
    try {
      await updateSettings({
        building_name: formData.buildingName,
        total_floors: String(formData.totalFloors),
        replenishment_time: formData.replenishmentTime,
        notification_email: formData.notificationEmail,
        low_material_threshold: String(formData.lowMaterialThreshold),
        anomaly_threshold: String(formData.anomalyThreshold),
        auto_refresh_interval: String(formData.autoRefreshInterval),
        anomaly_detection_enabled: String(formData.anomalyDetectionEnabled),
        email_notification_enabled: String(formData.emailNotificationEnabled),
      })
      setSaveSuccess(true)
      setTimeout(() => setSaveSuccess(false), 3000)
    } catch {
      // Error is handled by store
    }
  }

  const handleRefresh = () => {
    fetchSettings()
  }

  const updateField = <K extends keyof FormData>(key: K, value: FormData[K]) => {
    setFormData((prev) => ({ ...prev, [key]: value }))
  }

  if (loading.settings && Object.keys(settings).length === 0) {
    return (
      <div className="space-y-6">
        <Loading variant="card" className="h-16" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Loading variant="card" className="h-96" />
          <Loading variant="card" className="h-96" />
        </div>
      </div>
    )
  }

  if (error && Object.keys(settings).length === 0) {
    return <Error message={error} onRetry={handleRefresh} />
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">系统设置</h1>
          <p className="text-sm text-gray-500 mt-1">配置楼宇信息和系统阈值参数</p>
        </div>
        {saveSuccess && (
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-50 text-green-700 rounded-lg text-sm font-medium">
            <CheckCircle2 className="w-4 h-4" />
            保存成功
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
              <Building2 className="w-5 h-5 text-blue-500" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">楼宇配置</h2>
              <p className="text-xs text-gray-500">设置楼宇基本信息</p>
            </div>
          </div>
          <div className="p-6 space-y-5">
            <InputField
              label="楼宇名称"
              value={formData.buildingName}
              onChange={(v) => updateField('buildingName', v)}
              icon={<Building2 className="w-4 h-4" />}
              placeholder="请输入楼宇名称"
            />
            <InputField
              label="总楼层数"
              type="number"
              value={formData.totalFloors}
              onChange={(v) => updateField('totalFloors', Number(v))}
              icon={<Bell className="w-4 h-4" />}
              placeholder="请输入总楼层数"
            />
            <InputField
              label="补货时间"
              type="time"
              value={formData.replenishmentTime}
              onChange={(v) => updateField('replenishmentTime', v)}
              icon={<Clock className="w-4 h-4" />}
            />
            <InputField
              label="通知邮箱"
              type="email"
              value={formData.notificationEmail}
              onChange={(v) => updateField('notificationEmail', v)}
              icon={<Mail className="w-4 h-4" />}
              placeholder="请输入通知邮箱"
            />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-3">
            <div className="w-10 h-10 bg-orange-50 rounded-xl flex items-center justify-center">
              <SettingsIcon className="w-5 h-5 text-orange-500" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">阈值设置</h2>
              <p className="text-xs text-gray-500">配置预警和检测阈值</p>
            </div>
          </div>
          <div className="p-6 space-y-6">
            <Slider
              label="低物料预警阈值"
              value={formData.lowMaterialThreshold}
              onChange={(v) => updateField('lowMaterialThreshold', v)}
              min={0}
              max={100}
              unit="%"
              icon={<AlertTriangle className="w-4 h-4" />}
              color="orange"
            />
            <Slider
              label="销量异常阈值"
              value={formData.anomalyThreshold}
              onChange={(v) => updateField('anomalyThreshold', v)}
              min={0}
              max={100}
              unit="%"
              icon={<TrendingDown className="w-4 h-4" />}
              color="orange"
            />
            <Slider
              label="自动刷新间隔"
              value={formData.autoRefreshInterval}
              onChange={(v) => updateField('autoRefreshInterval', v)}
              min={10}
              max={120}
              unit="秒"
              icon={<RefreshCw className="w-4 h-4" />}
              color="blue"
            />

            <div className="pt-2 space-y-3">
              <p className="text-sm font-medium text-gray-700">功能开关</p>
              <ToggleSwitch
                label="启用异常检测"
                description="自动检测销量异常并生成预警"
                checked={formData.anomalyDetectionEnabled}
                onChange={(v) => updateField('anomalyDetectionEnabled', v)}
                icon={<AlertTriangle className="w-5 h-5" />}
              />
              <ToggleSwitch
                label="启用邮件通知"
                description="异常发生时发送邮件通知"
                checked={formData.emailNotificationEnabled}
                onChange={(v) => updateField('emailNotificationEnabled', v)}
                icon={<Mail className="w-5 h-5" />}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-3">
        <button
          onClick={handleRefresh}
          disabled={loading.settings}
          className="inline-flex items-center gap-2 px-5 py-2.5 border border-gray-200 text-gray-700 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <RefreshCw className={cn('w-4 h-4', loading.settings && 'animate-spin')} />
          重置
        </button>
        <button
          onClick={handleSave}
          disabled={loading.updateSettings}
          className="inline-flex items-center gap-2 px-6 py-2.5 bg-blue-500 text-white rounded-xl text-sm font-medium hover:bg-blue-600 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Save className="w-4 h-4" />
          保存设置
        </button>
      </div>
    </div>
  )
}
