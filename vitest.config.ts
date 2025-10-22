/*
 * SPDX-FileCopyrightText: 2025 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { defineConfig } from 'vitest/config';

export default defineConfig({
	define: {
		BASE_PATH: JSON.stringify('/test')
	},
	test: {
		globals: true,
		environment: 'jsdom',
		setupFiles: [
			'./src/__test__/vitest-setup.tsx',
			'./src/__test__/setup-browser-env.ts',
			'./src/__test__/test-setup.tsx',
			'./src/__test__/mocks/**',
			'./src/__test__/mocks/file-mock.ts'
		],
		alias: [
			{
				find: /@test-utils/,
				replacement: new URL('./src/__test__/mocks', import.meta.url).pathname
			},
			{
				find: /@test-setup/,
				replacement: new URL('./src/__test__/test-setup.tsx', import.meta.url).pathname
			}
			// '/@test-utils/': new URL('./src/__test__/mocks', import.meta.url).pathname,
			// '/@test-setup/': new URL('./src/__test__/test-setup.tsx', import.meta.url).pathname,
			// '.*\\.(jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$':
			// 	'./__test/__mocks__/file-mock.ts'
		],
		coverage: {
			provider: 'v8',
			reporter: ['text', 'cobertura', 'lcov'],
			reportsDirectory: 'coverage',
			include: ['src/**'],
			exclude: [
				'**/__tests__/**',
				'**/*.test.{js,jsx,ts,tsx}',
				'**/*.spec.{js,jsx,ts,tsx}',
				'src/tests/**',
				'src/**/test/mocks/**'
			]
		}
	}
});
