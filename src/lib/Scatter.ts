import ScatterJS from '@scatterjs/core';
import ScatterEOS from '@scatterjs/eosjs2';
import { JsonRpc, Api } from 'eosjs';



export class Scatter {
  network;
  rpc;
  public events;
  constructor() {
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

  async getCharacters( name ) {
    console.log('Getting characters');
    const result = await this.rpc.get_table_rows({
      json: true,
      code: 'ebonhavencom',
      scope: name,
      table: 'characters',
      limit: 5,
    });
    return result.rows;
  }

  newCharacter( account, data ) {
    ScatterJS.connect('Ebonhaven').then(connected => {
      if (!connected) { return console.error('no scatter'); }
      const eos = ScatterJS.eos(this.network, Api, {rpc: this.rpc});
      eos.transact({
        actions: [{
          account: "ebonhavencom",
          name: "newcharacter",
          authorization: [{
            actor: account.name,
            permission: account.authority
          }],
          data: data
        }]
      }, {
        blocksBehind: 3,
        expireSeconds: 30
      }).then((res) => {
        console.log("Success: ", res);
        this.events.emit("charactercreated");
      }).catch((err) => {
        console.error("Error: ", err);
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