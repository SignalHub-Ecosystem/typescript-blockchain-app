import { State, Item } from './state';

interface ChainInfo {
  height: number;
  validators: { [pubkey: string]: number};
}

enum MiddlewareType {
  TX = 'tx',
  QUERY = 'query',
  BLOCK = 'block',
  INITIALIZER = 'initializer',
  TX_ENDPOINT = 'tx-endpoint',
  POST_LISTEN = 'post-listen',
}

export interface Middleware {
  type: MiddlewareType;
  middleware: any;
}

export interface Tx<T> {
  sender: string;
  type?: TxType;
  payload?: T;
}

export interface TxTypeToHandler {
  [txType: string]: TxHandler | TxHandler[];
}

export type TxHandler<T = any> = (state: State, tx: Tx<T>, chainInfo?: ChainInfo) => void;

export enum TxType {
  ADD = 'ADD',
  COMPLETE = 'COMPLETE',
  UNDO_COMPLETE = 'UNDO-COMPLETE',
}

const add: TxHandler<{ text: string }> = (state, { payload }) => {
  if (!payload || typeof payload.text !== 'string') return;
  const item = {text: payload.text, completed: false, timestamp: Date.now() };

  state.items.push(item);
};

const toggle = (completed): TxHandler<{index: number}> => (state, {payload}) => {
  if (!payload || typeof payload.index !== 'number') return;
  const item = state.items[payload.index];
  item.completed = completed;
};

const complete = toggle(true);
const undoComplete = toggle(false);

const createTxMiddleware = (txTypeHandlers: TxTypeToHandler, fallbackHandler?: TxHandler): Middleware =>
({
  type: MiddlewareType.TX,
  middleware: (state, tx, chainInfo) => {
    const txType = tx.type;
    const handler = txTypeHandlers[txType] || fallbackHandler;
    if (handler) {
      Array.isArray(handler) ? handler.forEach(h => h(state, tx, chainInfo)) : handler(state, tx, chainInfo);
    }
  },
});

export const txMiddleware = createTxMiddleware({
  [TxType.ADD]: add,
  [TxType.COMPLETE]: complete,
  [TxType.UNDO_COMPLETE]: undoComplete,
}, (state, tx, chainInfo) => {
  console.log(JSON.stringify({tx, chainInfo}, null, 2));
  return new Error('Missing haandler for tx');
});
