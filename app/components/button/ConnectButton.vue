<script setup lang="ts">
import { useVueDapp, shortenAddress } from '@vue-dapp/core'
import { useVueDappModal } from '@vue-dapp/modal'

const { address, status, disconnect } = useVueDapp()

function onClickConnectButton() {
	if (status.value === 'connected') {
		disconnect()
		return
	}
	const { open } = useVueDappModal()
	open()
}
</script>

<template>
	<div class="flex items-center gap-2">
		<n-button
			size="medium"
			:loading="status === 'connecting'"
			:disabled="status === 'connecting'"
			@click="onClickConnectButton"
		>
			<div v-if="status === 'idle'">Connect Wallet</div>
			<div v-else-if="status === 'connecting'">Connecting...</div>
			<div v-if="status === 'connected'">Disconnect</div>
		</n-button>
		<div v-if="address">{{ shortenAddress(address) }}</div>
	</div>
</template>

<style lang="scss"></style>
