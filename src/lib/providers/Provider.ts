import { DefaultProvider } from './DefaultProvider';
import { ScatterProvider } from './ScatterProvider';
import { config as ENV } from '../../config/config';
import { Api, JsonRpc, RpcError } from 'eosjs';

export enum PROVIDERS {
  DEFAULT = 0,
  SCATTER = 1
};

export abstract class Provider {

  private provider;
  private publicKey;
  public events;
  protected rpc;

  public constructor() {
    this.provider = PROVIDERS.DEFAULT;
    let fullHost = `${ENV.network.protocol}://${ENV.network.host}:${ENV.network.port}`;
    this.rpc = new JsonRpc(fullHost);
    this.events = new Phaser.Events.EventEmitter();
  }

  abstract init(): void;
  abstract login(): void;
  abstract logout(): void;
  abstract transact( action, auth, data, successEvent, errorEvent, options? );

  public setProvider(provider: PROVIDERS) {
    this.provider = provider;
    this.init();
  }

  public setPublicKey(publicKey: string) {
    this.publicKey = publicKey;
  }

  async getAccount( name: string ) {
    return this.makeResourceCall({ scope: name, table: 'accounts', limit: 1 });
  }

  async getCharacters( name: string ) {
    return this.makeResourceCall({ scope: name, table: 'characters' });
  }

  async makeResourceCall( options ) {
    let defaults = {
      json: true,
      code: 'ebonhavencom',
      scope: 'ebonhavencom',
      table: 'accounts',
      limit: 5
    };
    let merged = Object.assign(defaults, options);
    let result = await this.rpc.get_table_rows({
      json: merged.json,
      code: merged.code,
      scope: merged.scope,
      table: merged.table,
      limit: merged.limit,
    });
    return result;
  }

  async newCharacter( account, data ) {
    this.transact('newcharacter', account.auth, data, 'charactercreated', 'charactererror');
  }

  async delCharacter( account, data ) {
    this.transact('delcharacter', account.auth, data, 'characterdeleted', 'charactererror');
  }

  async move( account, data ) {
    this.transact('move', account.auth, data, 'movesuccess', 'moveerror');
  }

}