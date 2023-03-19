export enum ErrorStatus {
  blocked = 'Открытие indexedDB заблокировано! Проверьте миграцию(config дату)!',
  unknownStoreName = 'storeName отсутствует! Проверьте storeName!',
  invalidDB = 'indexedDB не открыт! Откройте DB!',
  invalidStore = 'Не тот store!'
}

export class BlockedIndefinitelyException extends Error {
  constructor(message?: any) {
    super(message ?? ErrorStatus.blocked);
  }
}
