import { Provider } from './Provider';
import { Api, JsonRpc, RpcError } from 'eosjs';
import { JsSignatureProvider } from 'eosjs/dist/eosjs-jssig';
import { config as ENV } from '../../config/config';
import ecc from 'eosjs-ecc';

export class DefaultProvider extends Provider {

  signatureProvider;
  api;

  init() {
    this.signatureProvider = new JsSignatureProvider([ENV.privKey]);
    this.api = new Api({ rpc: this.rpc, signatureProvider: this.signatureProvider });
  }

  login(): boolean {
    return true;
  }

  logout(): boolean {
    return true;
  }

  setPrivateKey(privKey: string) {
    this.signatureProvider = new JsSignatureProvider([privKey]);
    let pubkey = ecc.privateToPublic(privKey);
    this.setPublicKey(pubkey);
    this.getAccounts(pubkey);
  }

  async getAccounts(pubkey: string) {
    console.log(pubkey);
    let rpc = new JsonRpc(`${ENV.network.protocol}://${ENV.network.host}:${ENV.network.port}`);
    let accounts = await rpc.history_get_key_accounts(pubkey);
    this.events.emit("accountsrefreshed", accounts);
    console.log(accounts);
  }

  async transact( action, auth, data, successEvent, errorEvent, options? ) {
    let defaults = {
      blocksBehind: 3,
      expireSeconds: 30
    };
    let merged = Object.assign(defaults, options);
    console.log('starting transaction')
    await this.api.transact({
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
      }
    ).then((result) => {
      console.log('transaction complete');
      this.events.emit(successEvent);
    }, (err) => {
      console.error(err);
      this.events.emit(errorEvent)
    });
  }

}