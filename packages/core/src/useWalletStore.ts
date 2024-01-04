import { computed, markRaw, ref } from 'vue'
import { defineStore } from 'pinia'
import { Connector } from './types'
import { ConnectorNotFoundError, ConnectError, AutoConnectError } from './errors'
import { WalletProvider } from './types'
import { normalizeChainId } from './utils'
import { MetaMaskConnector } from './metamaskConnector'

export type ConnectionStatus = 'idle' | 'connecting' | 'connected'

// feat: callbacks
export type OnDisconnectCallback = (...args: any[]) => void
export type OnAccountsChangedCallback = (accounts: string[]) => void
export type OnChainChangedCallback = (chainId: number) => void

/**
 * Pinia Setup Store
 *  - Setup Stores https://pinia.vuejs.org/core-concepts/#Setup-Stores
 *  - dealing with SSR https://pinia.vuejs.org/cookbook/composables.html#SSR
 */
export const useWalletStore = defineStore('vd-wallet', () => {
	const status = ref<ConnectionStatus>('idle')
	const error = ref('')

	const dumb = ref(true)
	function setDumb(isDumb: boolean) {
		dumb.value = isDumb
	}

	const connector = ref<Connector | null>(null)
	const provider = ref<WalletProvider | null>(null)
	const address = ref('')
	const chainId = ref(-1)

	// feat: callbacks
	const onDisconnectCallback = ref<OnDisconnectCallback | null>(null)
	const onAccountsChangedCallback = ref<OnAccountsChangedCallback | null>(null)
	const onChainChangedCallback = ref<OnChainChangedCallback | null>(null)

	const isConnected = computed(() => status.value === 'connected')

	async function connectWith(_connector: Connector, timeout?: number) {
		error.value = ''
		status.value = 'connecting'

		try {
			if (!_connector) throw new ConnectorNotFoundError()

			const { provider: _provider, account, chainId: _chainId } = await _connector.connect(timeout)

			connector.value = markRaw(_connector)
			provider.value = markRaw(_provider)
			address.value = account
			chainId.value = normalizeChainId(_chainId)
		} catch (err: any) {
			await disconnect() // will also resetWallet()
			error.value = err.message
			throw new ConnectError(err)
		}

		status.value = 'connected'
		localStorage.removeItem('VUE_DAPP__hasDisconnected')

		// feat: callbacks
		connector.value.onDisconnect((...args: any[]) => {
			onDisconnectCallback.value && onDisconnectCallback.value(...args)
			/**
			 * Exclude metamask to disconnect on this event
			 * @note MetaMask disconnect event would be triggered when the specific chain changed (like L2 network),
			 * so if we disconnect in this case, it would fail to reactivate ethers when chain changed
			 * because the wallet state was cleared.
			 * @todo better solution
			 */
			if (connector.value?.name === 'metaMask') {
				return
			}
			disconnect()
		})

		connector.value.onAccountsChanged(async (accounts: string[]) => {
			onAccountsChangedCallback.value && onAccountsChangedCallback.value(accounts)
			address.value = accounts[0]
		})

		connector.value.onChainChanged(async (_chainId: number) => {
			onChainChangedCallback.value && onChainChangedCallback.value(normalizeChainId(_chainId))
			chainId.value = normalizeChainId(_chainId)
		})
	}

	async function disconnect() {
		if (connector.value) {
			try {
				await connector.value.disconnect()
			} catch (err: any) {
				resetWallet()
				throw new Error(err)
			}
		}
		resetWallet()

		localStorage.setItem('VUE_DAPP__hasDisconnected', 'true')
	}

	async function resetWallet() {
		connector.value = null
		provider.value = null
		status.value = 'idle'
		address.value = ''
		chainId.value = -1
	}

	async function autoConnect(connectors: Connector[]) {
		if (localStorage.getItem('VUE_DAPP__hasDisconnected')) {
			!dumb.value && console.warn('No auto-connect: has disconnected') // eslint-disable-line
			return
		}

		const metamask = connectors.find(conn => conn.name === 'metaMask') as MetaMaskConnector | undefined

		if (metamask) {
			try {
				const isConnected = await MetaMaskConnector.checkConnection()
				if (isConnected) {
					await connectWith(metamask)
				} else if (!dumb.value) {
					console.warn('No auto-connect to MetaMask: not connected')
				}
			} catch (err: any) {
				throw new AutoConnectError(err)
			}
		} else if (!dumb.value) {
			console.warn('No auto-connect to MetaMask: connector not found')
		}
	}

	return {
		// state
		isConnected,
		error,

		provider,
		connector,
		status,
		address,
		chainId,

		// wallet functions
		connectWith,
		disconnect,
		resetWallet,
		autoConnect,

		// callbacks (for listener)
		onDisconnectCallback,
		onAccountsChangedCallback,
		onChainChangedCallback,

		// others
		setDumb,
	}
})
