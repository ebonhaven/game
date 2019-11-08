import ScatterJS from '@scatterjs/core';
import ScatterEOS from '@scatterjs/eosjs2';
import { Provider } from './Provider';
import { config as ENV } from '../../config/config';
import { JsonRpc, Api } from 'eosjs';

export class ScatterProvider extends Provider {
  network;
  isAccountRefreshing = false;
  isCharactersRefreshing = false;

  init() {
    this.network = ScatterJS.Network.fromJson(ENV.network);
    ScatterJS.plugins( new ScatterEOS() );
  }

  login() {
    const network = this.network;
    console.log(network);
    ScatterJS.connect(ENV.appName, { network } ).then(connected => {
      if (!connected) {
        console.error('no scatter');
        return false;
      }
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
        super.events.emit('loggedin', acct);
      });
    });
  }

  transact( action, auth, data, options = {} ) {
    let defaults = {
      blocksBehind: 3,
      expireSeconds: 30
    };
    let merged = Object.assign(defaults, options);
    let network = this.network;
    return ScatterJS.connect(ENV.appName, { network }).then(connected => {
      if (!connected) { return console.error('No Scatter'); }
      const eos = ScatterJS.eos(this.network, Api, {rpc: this.rpc});
      return eos.transact({
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
      });
    });
  }

  logout() {
    const network = this.network;
    ScatterJS.connect(ENV.appName, { network}).then(connected => {
      if (!connected) { return console.error('no scatter'); }
      const scatter = ScatterJS.scatter;
      scatter.forgetIdentity().then(() => {
        console.log('logged out');
        super.events.emit('loggedout');
      });
    });
  }
}