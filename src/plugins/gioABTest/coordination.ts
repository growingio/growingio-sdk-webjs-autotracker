import { guid, niceTry } from '@/utils/tools';

export interface ABRequestLock {
  coordinated: boolean;
  /** IndexedDB 租约在执行请求或消费响应前复核所有权；失去租约的响应不得落盘或命中。 */
  run: (work: () => void) => void;
}

const LEASE_MS = 5000;
const WAIT_MS = 30000;

/** 同源页面协作；存储/API 被禁用时保持原有单实例流程，不能因此中断业务回调。 */
export const acquireABRequestLock = (
  key: string,
  ready: (lock: ABRequestLock) => void,
  lost: () => void
): (() => void) => {
  let cancelled = false;
  let started = false;
  let release = () => {};
  let cancelWait = () => {};
  const fail = () => {
    if (!cancelled) lost();
  };
  const uncoordinated = () => {
    if (cancelled || started) return;
    started = true;
    ready({
      coordinated: false,
      run: (work) => {
        if (!cancelled) work();
      }
    });
  };

  const indexedDBLock = () => {
    const factory = niceTry(() =>
      typeof indexedDB === 'undefined' ? undefined : indexedDB
    );
    if (!factory) {
      uncoordinated();
      return;
    }
    const owner = guid();
    let database: IDBDatabase;
    let owned = false;
    let acquiring = false;
    let timer: ReturnType<typeof setTimeout>;
    const waitingTimer = setTimeout(fail, WAIT_MS);
    let opening = true;
    const waitingSince = Date.now();
    const close = () => niceTry(() => database?.close());
    const transact = (
      decide: (store: IDBObjectStore, record: any) => boolean,
      complete: (accepted: boolean) => void,
      error: () => void
    ) => {
      try {
        const transaction = database.transaction('leases', 'readwrite');
        const store = transaction.objectStore('leases');
        const request = store.get(key);
        let accepted = false;
        request.onsuccess = () => {
          try {
            accepted = decide(store, request.result);
          } catch (_error) {
            niceTry(() => transaction.abort());
            error();
          }
        };
        transaction.oncomplete = () => complete(accepted);
        transaction.onabort = transaction.onerror = error;
      } catch (_error) {
        error();
      }
    };
    const verify = (work: () => void) => {
      if (cancelled || !owned) return;
      transact(
        (store, record) => {
          if (cancelled || !owned || record?.owner !== owner) return false;
          store.put({ key, owner, expiresAt: Date.now() + LEASE_MS });
          // 在原子事务仍持有该槽时处理同步工作，避免事务提交后页面冻结、
          // 租约已被接管，但迟到的 oncomplete 仍按旧校验结果消费响应。
          work();
          return true;
        },
        (valid) => {
          if (cancelled) return;
          if (!valid) fail();
        },
        fail
      );
    };
    const renew = () => {
      timer = setTimeout(() => verify(renew), LEASE_MS / 5);
    };
    release = () => {
      clearTimeout(timer);
      clearTimeout(waitingTimer);
      if (!database) return;
      if (!owned) {
        if (!acquiring) close();
        return;
      }
      owned = false;
      transact(
        (store, record) => {
          if (record?.owner === owner) store.delete(key);
          return true;
        },
        close,
        close
      );
    };
    const acquire = () => {
      if (cancelled) {
        close();
        return;
      }
      acquiring = true;
      transact(
        (store, record) => {
          if (record && record.owner !== owner && record.expiresAt > Date.now())
            return false;
          store.put({ key, owner, expiresAt: Date.now() + LEASE_MS });
          return true;
        },
        (accepted) => {
          acquiring = false;
          if (accepted) owned = true;
          if (cancelled) {
            release();
            return;
          }
          if (accepted) {
            clearTimeout(waitingTimer);
            started = true;
            renew();
            ready({ coordinated: true, run: verify });
          } else if (Date.now() - waitingSince >= WAIT_MS) fail();
          else timer = setTimeout(acquire, 25);
        },
        () => {
          acquiring = false;
          clearTimeout(waitingTimer);
          close();
          uncoordinated();
        }
      );
    };
    const open = niceTry(() => factory.open('gdp_abt_coordination_v1', 1));
    if (!open) {
      clearTimeout(waitingTimer);
      uncoordinated();
      return;
    }
    // 其他页面阻塞数据库升级时也必须完成调用；迟到的连接不再接管已降级的请求。
    timer = setTimeout(() => {
      opening = false;
      clearTimeout(waitingTimer);
      uncoordinated();
    }, 1000);
    open.onupgradeneeded = () => {
      if (!open.result.objectStoreNames.contains('leases'))
        open.result.createObjectStore('leases', { keyPath: 'key' });
    };
    open.onerror = () => {
      clearTimeout(timer);
      opening = false;
      clearTimeout(waitingTimer);
      uncoordinated();
    };
    open.onsuccess = () => {
      clearTimeout(timer);
      database = open.result;
      if (cancelled || !opening || started) {
        close();
        return;
      }
      opening = false;
      database.onversionchange = () => {
        close();
        fail();
      };
      acquire();
    };
  };

  const locks = niceTry(() => navigator.locks);
  // Web Locks 通过 Promise 保持锁的生命周期；缺少构造器时使用回调式租约。
  if (typeof Promise === 'function' && typeof locks?.request === 'function') {
    const controller =
      typeof AbortController === 'function' ? new AbortController() : undefined;
    const timer = setTimeout(() => {
      if (!started && !cancelled) {
        niceTry(() => controller?.abort());
        fail();
      }
    }, WAIT_MS);
    cancelWait = () => {
      clearTimeout(timer);
      niceTry(() => controller?.abort());
    };
    try {
      locks
        .request(
          `gdp-abt:${key}`,
          controller ? { signal: controller.signal } : {},
          () => {
            clearTimeout(timer);
            if (cancelled) return;
            started = true;
            return new Promise<void>((resolve) => {
              release = resolve;
              ready({
                coordinated: true,
                run: (work) => {
                  if (!cancelled) work();
                }
              });
            });
          }
        )
        .catch(() => {
          clearTimeout(timer);
          if (!cancelled && !started) indexedDBLock();
          else if (!cancelled) fail();
        });
    } catch (_error) {
      clearTimeout(timer);
      indexedDBLock();
    }
  } else indexedDBLock();

  return () => {
    if (cancelled) return;
    cancelled = true;
    cancelWait();
    release();
  };
};
