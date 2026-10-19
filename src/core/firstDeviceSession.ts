import { GrowingIOType } from '@/types/internal/growingIO';
import { niceTry } from '@/utils/tools';

type FirstDeviceSession = { deviceId: string; sessionId: string };
const UUID_REG =
  /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;
const UID_KEY = 'gdp_user_id_gioenc';

/** Web 首访事实及 4.4.0/4.4.1 的 session 标记兼容，不消费宿主的首访状态。 */
export default class WebFirstDeviceSessions {
  private generatedDeviceId?: string;
  private allowLegacyImport = true;
  private records: Record<string, FirstDeviceSession> = {};

  constructor(private growingIO: GrowingIOType) {}

  private sessionKey = (trackingId: string) =>
    this.growingIO.dataStore.getStorageKey(trackingId, 'sessionId');

  private recordKey = (trackingId: string) =>
    `${this.sessionKey(trackingId)}_first_device`;

  private legacyKey = (trackingId: string) =>
    this.growingIO.dataStore.getStorageKey(trackingId, 'abts');

  private isWeb = (trackingId: string) =>
    trackingId !== this.growingIO.useHybridInherit &&
    trackingId !== this.growingIO.useEmbeddedInherit;

  private read = (trackingId: string, deviceId: string): FirstDeviceSession => {
    const key = this.recordKey(trackingId);
    const stored = niceTry(() => JSON.parse(localStorage.getItem(key) || ''));
    const record = stored?.deviceId === deviceId ? stored : this.records[key];
    return record &&
      record.deviceId === deviceId &&
      typeof record.sessionId === 'string'
      ? record
      : undefined;
  };

  private save = (trackingId: string, record: FirstDeviceSession) => {
    const key = this.recordKey(trackingId);
    this.records[key] = record;
    niceTry(() => localStorage.setItem(key, JSON.stringify(record)));
    this.syncLegacy(trackingId, record);
  };

  private syncLegacy = (trackingId: string, record: FirstDeviceSession) => {
    if (
      this.isWeb(trackingId) &&
      this.growingIO.storage.getItem(UID_KEY) === record.deviceId &&
      this.growingIO.storage.getItem(this.sessionKey(trackingId)) ===
        record.sessionId
    ) {
      niceTry(() =>
        localStorage.setItem(this.legacyKey(trackingId), record.sessionId)
      );
    }
  };

  updateDevice = (previous: string, deviceId: string, generated: boolean) => {
    const trackingIds = [
      this.growingIO.trackingId,
      ...(this.growingIO.dataStore.initializedTrackingIds || [])
    ].filter(Boolean);
    if (previous !== deviceId) {
      this.records = {};
      this.generatedDeviceId = undefined;
      this.allowLegacyImport = false;
      trackingIds.forEach((trackingId) => {
        if (!this.isWeb(trackingId)) return;
        const sessionId = this.growingIO.storage.getItem(
          this.sessionKey(trackingId)
        );
        niceTry(() => {
          if (localStorage.getItem(this.legacyKey(trackingId)) === sessionId)
            localStorage.removeItem(this.legacyKey(trackingId));
        });
      });
    }
    if (generated) {
      this.generatedDeviceId = deviceId;
      trackingIds.forEach((trackingId) => this.record(trackingId));
    }
  };

  record = (trackingId: string, sessionId?: string) => {
    const deviceId = this.generatedDeviceId;
    if (
      !trackingId ||
      !deviceId ||
      this.growingIO.storage.getItem(UID_KEY) !== deviceId
    )
      return;
    if (this.read(trackingId, deviceId)) return;
    const firstSession =
      sessionId || this.growingIO.storage.getItem(this.sessionKey(trackingId));
    if (firstSession)
      this.save(trackingId, { deviceId, sessionId: firstSession });
  };

  updateSession = (trackingId: string, previous: string, sessionId: string) => {
    this.record(trackingId, previous || sessionId);
    const record = this.read(
      trackingId,
      this.growingIO.storage.getItem(UID_KEY)
    );
    if (record?.sessionId === sessionId) this.syncLegacy(trackingId, record);
    else if (previous && previous !== sessionId && this.isWeb(trackingId)) {
      niceTry(() => {
        if (localStorage.getItem(this.legacyKey(trackingId)) === previous)
          localStorage.removeItem(this.legacyKey(trackingId));
      });
    }
  };

  isFirst = (trackingId: string, sessionId: string) => {
    const deviceId = this.growingIO.storage.getItem(UID_KEY);
    const record = this.read(trackingId, deviceId);
    if (record) {
      if (record.sessionId === sessionId) this.syncLegacy(trackingId, record);
      return record.sessionId === sessionId;
    }
    // 只接受普通 Web UUID 的同一当前 session。identify、宿主身份、冲突或损坏
    // 的绑定记录均不猜测归属；导入后立即绑定 deviceId，后续不再依赖裸 session。
    if (
      !this.allowLegacyImport ||
      !this.isWeb(trackingId) ||
      !UUID_REG.test(deviceId) ||
      !sessionId ||
      this.growingIO.storage.getItem(this.sessionKey(trackingId)) !==
        sessionId ||
      niceTry(() => localStorage.getItem(this.recordKey(trackingId))) !==
        null ||
      niceTry(() => localStorage.getItem(this.legacyKey(trackingId))) !==
        sessionId
    )
      return false;
    this.save(trackingId, { deviceId, sessionId });
    return true;
  };
}
