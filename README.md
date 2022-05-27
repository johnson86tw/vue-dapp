<p align="center">
  <a href="https://github.com/chnejohnson/vue-dapp/blob/main/demo/src/assets/logo.png">
    <img src="https://github.com/chnejohnson/vue-dapp/blob/main/demo/src/assets/logo.png" alt="VueDapp Brand" style="max-width:100%;" width="400">
  </a>
</p>

<br />

# Vue Dapp

- [Documentation (v0.5.x)](https://vue-dapp-docs.netlify.app/)
- [Migrate to v0.5.x](https://vue-dapp-docs.netlify.app/migration)

## Installation

```bash
yarn add ethers vue-dapp
```

## Quick Start
- If you're using [Vue CLI](https://cli.vuejs.org/guide/creating-a-project.html), check out [vuecli + vue-dapp starter](https://github.com/chnejohnson/vue3-dapp-starter/tree/vuecli) or see [Vue CLI settings](https://vue-dapp-docs.netlify.app/environment.html#vue-cli) for more details. 
- If you're using [Vite](https://vitejs.dev/), check out [vue3-dapp-starter](https://github.com/chnejohnson/vue3-dapp-starter) or see [Vite settings](https://vue-dapp-docs.netlify.app/environment.html#vite) for more details. 

Step 1. Add plugin to your app:

```javascript
import { VueDapp } from "vue-dapp";
const app = createApp(App);
app.use(VueDapp);
app.mount("#app");
```

Step 2. Add `<vd-board />` to your `App.vue` and add a button to open the board:

```vue
<button @click="open">Connect Wallet</button>
<vd-board :connectors="connectors" dark />
```

Step 3. Construct your connectors and use composable functions in your scripts:

```js
import {
  MetaMaskConnector,
  WalletConnectConnector,
  CoinbaseWalletConnector,
  useBoard,
} from "vue-dapp";

setup() {
  const { open } = useBoard();
  const infuraId = "";
  const connectors = [
    new MetaMaskConnector({
      appUrl: "http://localhost:3000",
    }),
    new WalletConnectConnector({
      qrcode: true,
      rpc: {
        1: `https://mainnet.infura.io/v3/${infuraId}`,
        4: `https://rinkeby.infura.io/v3/${infuraId}`,
      },
    }),
    new CoinbaseWalletConnector({
      appName: "Vue Dapp",
      jsonRpcUrl: `https://mainnet.infura.io/v3/${infuraId}`,
    }),
  ];
  return {
    connectors,
    open,
  };
}
```

For the demo code, see https://github.com/chnejohnson/vue-dapp/blob/main/demo/src/App.vue

## Sponsor

Gitcoin Grants: https://gitcoin.co/grants/3987/vue-dapp

## License

[MIT](https://opensource.org/licenses/MIT)

Copyright (c) 2021-present, Johnson Chen