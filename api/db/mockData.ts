import type Database from 'better-sqlite3';

const TODAY = new Date();

function formatDate(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function formatDateTime(d: Date): string {
  return d.toISOString().replace('T', ' ').slice(0, 19);
}

function addDays(d: Date, days: number): Date {
  const result = new Date(d);
  result.setDate(result.getDate() + days);
  return result;
}

function randBetween(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

interface FloorRow {
  id: number;
  floorNumber: number;
  name: string;
}

interface DeviceRow {
  id: string;
  floorId: number;
  location: string;
  status: 'online' | 'offline' | 'error';
  bean: number;
  milk: number;
  water: number;
  cup: number;
  faultCode: string | null;
  lastReport: string;
}

interface ProductRow {
  id: string;
  name: string;
  category: string;
  price: number;
  status: 'active' | 'inactive';
  removedAt: string | null;
}

interface DeviceStatusRow {
  deviceId: string;
  bean: number;
  milk: number;
  water: number;
  cup: number;
  faultCode: string | null;
  timestamp: string;
}

interface SalesRecordRow {
  deviceId: string;
  productId: string;
  amount: number;
  timestamp: string;
}

interface ReplenishmentTaskRow {
  id: string;
  floorId: number;
  status: 'pending' | 'in_progress' | 'completed';
  assignee: string | null;
  createdAt: string;
  completedAt: string | null;
}

interface ReplenishmentItemRow {
  taskId: string;
  deviceId: string;
  beanNeeded: number;
  milkNeeded: number;
  waterNeeded: number;
  cupNeeded: number;
}

interface SalesAnomalyRow {
  deviceId: string;
  productId: string | null;
  date: string;
  dropRate: number;
  cause: 'out_of_stock' | 'machine_down' | 'product_removed' | 'unknown';
  confidence: number;
  details: string | null;
  confirmed: boolean;
}

interface SettingRow {
  key: string;
  value: string;
}

const LOCATIONS = [
  'A区电梯口', 'B区电梯口', 'C区电梯口',
  '前台大厅', '休息区', '茶水间',
  '会议室旁', '走廊尽头', '入口处',
  'A区走廊', 'B区走廊', 'C区走廊',
  '健身房旁', '餐厅旁', '接待处'
];

const FAULT_CODES = ['E001', 'E002', 'E003', 'E004', 'E005'];

function generateFloors(): FloorRow[] {
  const floors: FloorRow[] = [];
  for (let i = 1; i <= 15; i++) {
    floors.push({
      id: i,
      floorNumber: i,
      name: `${i}层`
    });
  }
  return floors;
}

function generateDevices(floors: FloorRow[]): DeviceRow[] {
  const devices: DeviceRow[] = [];
  for (let i = 0; i < 15; i++) {
    const isFaulty = i === 2 || i === 7;
    const isOutOfStock = i === 5 || i === 11;
    devices.push({
      id: `DEV${String(i + 1).padStart(3, '0')}`,
      floorId: floors[i].id,
      location: LOCATIONS[i],
      status: isFaulty ? 'error' : 'online',
      bean: isOutOfStock ? randBetween(0, 4) : randBetween(20, 100),
      milk: isOutOfStock ? randBetween(0, 4) : randBetween(20, 100),
      water: isOutOfStock ? randBetween(0, 4) : randBetween(20, 100),
      cup: isOutOfStock ? randBetween(0, 4) : randBetween(20, 100),
      faultCode: isFaulty ? FAULT_CODES[i % FAULT_CODES.length] : null,
      lastReport: formatDateTime(addDays(TODAY, 0))
    });
  }
  return devices;
}

function generateProducts(): ProductRow[] {
  const coldBrewRemoved = formatDateTime(addDays(TODAY, -10));
  const hazelnutRemoved = formatDateTime(addDays(TODAY, -5));

  return [
    { id: 'P001', name: '美式咖啡', category: '咖啡', price: 18, status: 'active', removedAt: null },
    { id: 'P002', name: '拿铁', category: '咖啡', price: 22, status: 'active', removedAt: null },
    { id: 'P003', name: '卡布奇诺', category: '咖啡', price: 24, status: 'active', removedAt: null },
    { id: 'P004', name: '摩卡', category: '咖啡', price: 26, status: 'active', removedAt: null },
    { id: 'P005', name: '冷萃', category: '咖啡', price: 28, status: 'inactive', removedAt: coldBrewRemoved },
    { id: 'P006', name: '榛果拿铁', category: '咖啡', price: 25, status: 'inactive', removedAt: hazelnutRemoved },
    { id: 'P007', name: '燕麦拿铁', category: '咖啡', price: 26, status: 'active', removedAt: null },
    { id: 'P008', name: '热巧克力', category: '饮品', price: 20, status: 'active', removedAt: null },
    { id: 'P009', name: '抹茶拿铁', category: '饮品', price: 23, status: 'active', removedAt: null },
    { id: 'P010', name: '柠檬茶', category: '饮品', price: 16, status: 'active', removedAt: null }
  ];
}

function generateDeviceStatusHistory(devices: DeviceRow[]): DeviceStatusRow[] {
  const history: DeviceStatusRow[] = [];
  const faultyDeviceIds = devices.filter(d => d.status === 'error').map(d => d.id);
  const outOfStockDeviceIds = devices.filter(d => d.bean < 5 || d.milk < 5 || d.water < 5 || d.cup < 5).map(d => d.id);

  for (let dayOffset = 29; dayOffset >= 0; dayOffset--) {
    const date = addDays(TODAY, -dayOffset);
    const timestamp = formatDateTime(date);

    for (const device of devices) {
      const isFaulty = faultyDeviceIds.includes(device.id);
      const isOutOfStock = outOfStockDeviceIds.includes(device.id);

      const consumptionRate = isFaulty ? 0 : (isOutOfStock && dayOffset < 5 ? 1 : randBetween(3, 8));
      const startLevel = 100 - consumptionRate * (30 - dayOffset);

      let bean = Math.max(0, startLevel - randBetween(0, 5));
      let milk = Math.max(0, startLevel - randBetween(0, 5));
      let water = Math.max(0, startLevel - randBetween(0, 5));
      let cup = Math.max(0, startLevel - randBetween(0, 5));

      if (isOutOfStock && dayOffset < 3) {
        bean = randBetween(0, 4);
        milk = randBetween(0, 4);
        water = randBetween(0, 4);
        cup = randBetween(0, 4);
      }

      history.push({
        deviceId: device.id,
        bean,
        milk,
        water,
        cup,
        faultCode: isFaulty ? FAULT_CODES[devices.indexOf(device) % FAULT_CODES.length] : null,
        timestamp
      });
    }
  }
  return history;
}

function generateSalesRecords(devices: DeviceRow[], products: ProductRow[]): SalesRecordRow[] {
  const records: SalesRecordRow[] = [];
  const faultyDeviceIds = devices.filter(d => d.status === 'error').map(d => d.id);
  const outOfStockDeviceIds = devices.filter(d => d.bean < 5 || d.milk < 5 || d.water < 5 || d.cup < 5).map(d => d.id);
  const activeProducts = products.filter(p => p.status === 'active');
  const coldBrew = products.find(p => p.name === '冷萃')!;
  const hazelnut = products.find(p => p.name === '榛果拿铁')!;

  for (let dayOffset = 29; dayOffset >= 0; dayOffset--) {
    const date = addDays(TODAY, -dayOffset);

    for (const device of devices) {
      const isFaulty = faultyDeviceIds.includes(device.id);
      const isOutOfStock = outOfStockDeviceIds.includes(device.id);

      let baseSales = randBetween(8, 15);

      if (isFaulty) {
        baseSales = Math.floor(baseSales * (1 - randBetween(70, 90) / 100));
      } else if (isOutOfStock && dayOffset < 5) {
        baseSales = Math.floor(baseSales * (1 - randBetween(60, 80) / 100));
      }

      for (let s = 0; s < baseSales; s++) {
        let product: ProductRow;
        const coldBrewAvailable = dayOffset > 10;
        const hazelnutAvailable = dayOffset > 5;

        const availableProducts = [...activeProducts];
        if (coldBrewAvailable) availableProducts.push(coldBrew);
        if (hazelnutAvailable) availableProducts.push(hazelnut);

        product = availableProducts[randBetween(0, availableProducts.length - 1)];

        const hour = randBetween(8, 20);
        const minute = randBetween(0, 59);
        const saleTime = new Date(date);
        saleTime.setHours(hour, minute, 0, 0);

        records.push({
          deviceId: device.id,
          productId: product.id,
          amount: product.price,
          timestamp: formatDateTime(saleTime)
        });
      }
    }
  }
  return records;
}

function generateReplenishmentTasks(
  floors: FloorRow[],
  devices: DeviceRow[]
): { tasks: ReplenishmentTaskRow[]; items: ReplenishmentItemRow[] } {
  const tasks: ReplenishmentTaskRow[] = [];
  const items: ReplenishmentItemRow[] = [];
  const assignees = ['张三', '李四', '王五'];
  const statuses: Array<'pending' | 'in_progress' | 'completed'> = ['completed', 'completed', 'in_progress', 'pending', 'pending', 'completed', 'pending'];

  for (let dayOffset = 6; dayOffset >= 0; dayOffset--) {
    const date = addDays(TODAY, -dayOffset);
    const status = statuses[6 - dayOffset];
    const floor = floors[randBetween(0, floors.length - 1)];
    const taskId = `TASK${String(7 - dayOffset).padStart(4, '0')}`;

    tasks.push({
      id: taskId,
      floorId: floor.id,
      status,
      assignee: status === 'pending' ? null : assignees[randBetween(0, assignees.length - 1)],
      createdAt: formatDateTime(addDays(date, -1)),
      completedAt: status === 'completed' ? formatDateTime(date) : null
    });

    const floorDevices = devices.filter(d => d.floorId === floor.id);
    for (const device of floorDevices) {
      items.push({
        taskId,
        deviceId: device.id,
        beanNeeded: randBetween(20, 60),
        milkNeeded: randBetween(20, 60),
        waterNeeded: randBetween(20, 60),
        cupNeeded: randBetween(20, 60)
      });
    }
  }

  return { tasks, items };
}

function generateSalesAnomalies(
  devices: DeviceRow[],
  products: ProductRow[],
  deviceStatusHistory: DeviceStatusRow[],
  salesRecords: SalesRecordRow[]
): SalesAnomalyRow[] {
  const anomalies: SalesAnomalyRow[] = [];
  const faultyDeviceIds = devices.filter(d => d.status === 'error').map(d => d.id);
  const outOfStockDeviceIds = devices.filter(d => d.bean < 5 || d.milk < 5 || d.water < 5 || d.cup < 5).map(d => d.id);

  for (const deviceId of faultyDeviceIds) {
    for (let dayOffset = 7; dayOffset >= 1; dayOffset--) {
      const date = formatDate(addDays(TODAY, -dayOffset));
      const statusForDay = deviceStatusHistory.find(
        s => s.deviceId === deviceId && s.timestamp.startsWith(date)
      );

      if (statusForDay?.faultCode) {
        anomalies.push({
          deviceId,
          productId: null,
          date,
          dropRate: randBetween(75, 90),
          cause: 'machine_down',
          confidence: 98,
          details: `故障码 ${statusForDay.faultCode} 导致设备停机`,
          confirmed: false
        });
      }
    }
  }

  for (const deviceId of outOfStockDeviceIds) {
    for (let dayOffset = 4; dayOffset >= 1; dayOffset--) {
      const date = formatDate(addDays(TODAY, -dayOffset));
      const statusForDay = deviceStatusHistory.find(
        s => s.deviceId === deviceId && s.timestamp.startsWith(date)
      );

      if (statusForDay && (statusForDay.bean < 5 || statusForDay.milk < 5 || statusForDay.water < 5 || statusForDay.cup < 5)) {
        const lowItems = [];
        if (statusForDay.bean < 5) lowItems.push('咖啡豆');
        if (statusForDay.milk < 5) lowItems.push('牛奶');
        if (statusForDay.water < 5) lowItems.push('水');
        if (statusForDay.cup < 5) lowItems.push('杯子');

        anomalies.push({
          deviceId,
          productId: null,
          date,
          dropRate: randBetween(60, 80),
          cause: 'out_of_stock',
          confidence: 92,
          details: `物料不足: ${lowItems.join(', ')}`,
          confirmed: false
        });
      }
    }
  }

  const coldBrew = products.find(p => p.name === '冷萃')!;
  const hazelnut = products.find(p => p.name === '榛果拿铁')!;
  const normalDevices = devices.filter(d => !faultyDeviceIds.includes(d.id) && !outOfStockDeviceIds.includes(d.id));

  for (let dayOffset = 9; dayOffset >= 6; dayOffset--) {
    const date = formatDate(addDays(TODAY, -dayOffset));
    const device = normalDevices[randBetween(0, normalDevices.length - 1)];
    anomalies.push({
      deviceId: device.id,
      productId: coldBrew.id,
      date,
      dropRate: 100,
      cause: 'product_removed',
      confidence: 100,
      details: '产品「冷萃」已下架',
      confirmed: true
    });
  }

  for (let dayOffset = 4; dayOffset >= 1; dayOffset--) {
    const date = formatDate(addDays(TODAY, -dayOffset));
    const device = normalDevices[randBetween(0, normalDevices.length - 1)];
    anomalies.push({
      deviceId: device.id,
      productId: hazelnut.id,
      date,
      dropRate: 100,
      cause: 'product_removed',
      confidence: 100,
      details: '产品「榛果拿铁」已下架',
      confirmed: true
    });
  }

  for (let dayOffset = 3; dayOffset >= 1; dayOffset--) {
    const date = formatDate(addDays(TODAY, -dayOffset));
    const device = normalDevices[randBetween(0, normalDevices.length - 1)];
    anomalies.push({
      deviceId: device.id,
      productId: null,
      date,
      dropRate: randBetween(65, 85),
      cause: 'unknown',
      confidence: 45,
      details: '销量异常下降，原因待排查',
      confirmed: false
    });
  }

  return anomalies;
}

function generateSettings(): SettingRow[] {
  return [
    { key: 'low_material_threshold', value: '20' },
    { key: 'anomaly_detection_enabled', value: 'true' },
    { key: 'auto_refresh_interval', value: '30' },
    { key: 'notification_email', value: 'admin@example.com' },
    { key: 'maintenance_schedule', value: 'weekly' }
  ];
}

function floorToSnake(row: FloorRow): Record<string, unknown> {
  return {
    id: row.id,
    floor_number: row.floorNumber,
    name: row.name
  };
}

function deviceToSnake(row: DeviceRow): Record<string, unknown> {
  return {
    id: row.id,
    floor_id: row.floorId,
    location: row.location,
    status: row.status,
    bean: row.bean,
    milk: row.milk,
    water: row.water,
    cup: row.cup,
    fault_code: row.faultCode,
    last_report: row.lastReport
  };
}

function productToSnake(row: ProductRow): Record<string, unknown> {
  return {
    id: row.id,
    name: row.name,
    category: row.category,
    price: row.price,
    status: row.status,
    removed_at: row.removedAt
  };
}

function deviceStatusToSnake(row: DeviceStatusRow): Record<string, unknown> {
  return {
    device_id: row.deviceId,
    bean: row.bean,
    milk: row.milk,
    water: row.water,
    cup: row.cup,
    fault_code: row.faultCode,
    timestamp: row.timestamp
  };
}

function salesRecordToSnake(row: SalesRecordRow): Record<string, unknown> {
  return {
    device_id: row.deviceId,
    product_id: row.productId,
    amount: row.amount,
    timestamp: row.timestamp
  };
}

function replenishmentTaskToSnake(row: ReplenishmentTaskRow): Record<string, unknown> {
  return {
    id: row.id,
    floor_id: row.floorId,
    status: row.status,
    assignee: row.assignee,
    created_at: row.createdAt,
    completed_at: row.completedAt
  };
}

function replenishmentItemToSnake(row: ReplenishmentItemRow): Record<string, unknown> {
  return {
    task_id: row.taskId,
    device_id: row.deviceId,
    bean_needed: row.beanNeeded,
    milk_needed: row.milkNeeded,
    water_needed: row.waterNeeded,
    cup_needed: row.cupNeeded
  };
}

function salesAnomalyToSnake(row: SalesAnomalyRow): Record<string, unknown> {
  return {
    device_id: row.deviceId,
    product_id: row.productId,
    date: row.date,
    drop_rate: row.dropRate,
    cause: row.cause,
    confidence: row.confidence,
    details: row.details,
    confirmed: row.confirmed ? 1 : 0
  };
}

function settingToSnake(row: SettingRow): Record<string, unknown> {
  return {
    key: row.key,
    value: row.value
  };
}

export function seedDatabase(db: Database.Database): void {
  const existingFloors = db.prepare('SELECT COUNT(*) as count FROM floor').get() as { count: number };
  if (existingFloors.count > 0) {
    return;
  }

  const floors = generateFloors();
  const devices = generateDevices(floors);
  const products = generateProducts();
  const deviceStatusHistory = generateDeviceStatusHistory(devices);
  const salesRecords = generateSalesRecords(devices, products);
  const { tasks, items } = generateReplenishmentTasks(floors, devices);
  const anomalies = generateSalesAnomalies(devices, products, deviceStatusHistory, salesRecords);
  const settings = generateSettings();

  const tx = db.transaction(() => {
    const insertFloor = db.prepare(
      'INSERT INTO floor (id, floor_number, name) VALUES (@id, @floor_number, @name)'
    );
    for (const row of floors) {
      insertFloor.run(floorToSnake(row));
    }

    const insertDevice = db.prepare(
      'INSERT INTO device (id, floor_id, location, status, bean, milk, water, cup, fault_code, last_report) ' +
      'VALUES (@id, @floor_id, @location, @status, @bean, @milk, @water, @cup, @fault_code, @last_report)'
    );
    for (const row of devices) {
      insertDevice.run(deviceToSnake(row));
    }

    const insertProduct = db.prepare(
      'INSERT INTO product (id, name, category, price, status, removed_at) ' +
      'VALUES (@id, @name, @category, @price, @status, @removed_at)'
    );
    for (const row of products) {
      insertProduct.run(productToSnake(row));
    }

    const insertDeviceStatus = db.prepare(
      'INSERT INTO device_status (device_id, bean, milk, water, cup, fault_code, timestamp) ' +
      'VALUES (@device_id, @bean, @milk, @water, @cup, @fault_code, @timestamp)'
    );
    for (const row of deviceStatusHistory) {
      insertDeviceStatus.run(deviceStatusToSnake(row));
    }

    const insertSalesRecord = db.prepare(
      'INSERT INTO sales_record (device_id, product_id, amount, timestamp) ' +
      'VALUES (@device_id, @product_id, @amount, @timestamp)'
    );
    for (const row of salesRecords) {
      insertSalesRecord.run(salesRecordToSnake(row));
    }

    const insertReplenishmentTask = db.prepare(
      'INSERT INTO replenishment_task (id, floor_id, status, assignee, created_at, completed_at) ' +
      'VALUES (@id, @floor_id, @status, @assignee, @created_at, @completed_at)'
    );
    for (const row of tasks) {
      insertReplenishmentTask.run(replenishmentTaskToSnake(row));
    }

    const insertReplenishmentItem = db.prepare(
      'INSERT INTO replenishment_item (task_id, device_id, bean_needed, milk_needed, water_needed, cup_needed) ' +
      'VALUES (@task_id, @device_id, @bean_needed, @milk_needed, @water_needed, @cup_needed)'
    );
    for (const row of items) {
      insertReplenishmentItem.run(replenishmentItemToSnake(row));
    }

    const insertSalesAnomaly = db.prepare(
      'INSERT INTO sales_anomaly (device_id, product_id, date, drop_rate, cause, confidence, details, confirmed) ' +
      'VALUES (@device_id, @product_id, @date, @drop_rate, @cause, @confidence, @details, @confirmed)'
    );
    for (const row of anomalies) {
      insertSalesAnomaly.run(salesAnomalyToSnake(row));
    }

    const insertSetting = db.prepare(
      'INSERT INTO settings (key, value) VALUES (@key, @value)'
    );
    for (const row of settings) {
      insertSetting.run(settingToSnake(row));
    }
  });

  tx();
}
