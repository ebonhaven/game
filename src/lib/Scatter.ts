import ScatterJS from '@scatterjs/core';
import ScatterEOS from '@scatterjs/eosjs2';
import { JsonRpc, Api } from 'eosjs';

export class Scatter {
  network;
  rpc;
  public events;
  isAccountRefreshing = false;
  isCharactersRefreshing = false;
  private static instance: Scatter;
  private constructor() {
    this.network = ScatterJS.Network.fromJson({
      blockchain: 'eos',
      chainId: 'cf057bbfb72640471fd910bcb67639c22df9f92470936cddc1ade0e2f2e7dc4f',
      host: '127.0.0.1',
      port: 8888,
      protocol: 'http'
    });
    ScatterJS.plugins( new ScatterEOS() );
    this.rpc = new JsonRpc(this.network.fullhost());
    this.events = new Phaser.Events.EventEmitter();
  }

  static getInstance() {
    if (!Scatter.instance) {
      Scatter.instance = new Scatter();
    }
    return Scatter.instance;
  }

  login() {
    const network = this.network;
    console.log(network);
    ScatterJS.connect('Ebonhaven').then(connected => {
      if (!connected) { return console.error('no scatter'); }
      const scatter = ScatterJS.scatter;
      const requiredFields = { accounts: [ network ]};
      scatter.getIdentity(requiredFields).then(id => {
        console.log(id);
        if (!id) return console.error('no identity');
        let acct = ScatterJS.account('eos');
        console.log(ScatterJS.identity);
        ScatterJS.identity.accounts.forEach((a) => {
          console.log(a);
        });
        this.events.emit('loggedin', acct);
      });
    });
  }

  async getAccount( name ) {
    return this.makeResourceCall({ scope: name, table: 'accounts', limit: 1 });
  }

  async getCharacters( name ) {
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

  newCharacter( account, data ) {
    this.makeTransaction('newcharacter', account, data, 'charactercreated', 'charactererror');
  }

  delCharacter( account, data ) {
    this.makeTransaction('delcharacter', account, data, 'characterdeleted', 'charactererror');
  }

  move( account, data ) {
    this.makeTransaction('move', account, data, 'movesuccess', 'moveerror');
  }

  makeTransaction( action, auth, data, successEvent, errorEvent, options = {} ) {
    let defaults = {
      blocksBehind: 3,
      expireSeconds: 30
    };
    let merged = Object.assign(defaults, options);
    ScatterJS.connect('Ebonhaven').then(connected => {
      if (!connected) { return console.error('No Scatter'); }
      const eos = ScatterJS.eos(this.network, Api, {rpc: this.rpc});
      eos.transact({
        actions: [{
          account: "ebonhavencom",
          name: action,
          authorization: [{
            actor: auth.name,
            permission: auth.authority
          }],
          data: data
        }]
      }, {
        blocksBehind: merged.blocksBehind,
        expireSeconds: merged.expireSeconds
      }).then((res) => {
        console.log("Success: ", res);
        this.events.emit(successEvent);
      }).catch((err) => {
        console.error("Error: ", err);
        this.events.emit(errorEvent);
      })
    });
  }

  logout() {
    ScatterJS.connect('Ebonhaven').then(connected => {
      if (!connected) { return console.error('no scatter'); }
      const scatter = ScatterJS.scatter;
      scatter.forgetIdentity().then(() => {
        console.log('logged out');
        this.events.emit('loggedout');
      });
    });
  }
}