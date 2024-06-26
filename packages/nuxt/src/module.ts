import { defineNuxtModule, addImports, createResolver } from '@nuxt/kit'

export interface ModuleOptions {}

export default defineNuxtModule<ModuleOptions>({
	meta: {
		name: '@vue-dapp/nuxt',
		configKey: 'vue-dapp',
	},

	defaults: {},
	setup(options, nuxt) {
		const resolver = createResolver(import.meta.url)

		// Do not add the extension since the `.ts` will be transpiled to `.mjs` after `npm run prepack`
		// addPlugin(resolver.resolve('./runtime/plugin'))

		addImports({
			name: 'useVueDapp', // name of the composable to be used
			as: 'useVueDapp',
			from: resolver.resolve('./runtime/composables'), // path of composable
		})
	},
})
