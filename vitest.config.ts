/*
 * SPDX-FileCopyrightText: 2025 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

/* eslint-disable import/no-extraneous-dependencies */
import tsconfigPaths from 'vite-tsconfig-paths';
import { defineConfig } from 'vitest/config';

export default defineConfig({
	define: {
		BASE_PATH: JSON.stringify('/test')
	},
	plugins: [tsconfigPaths()],
	test: {
		globals: true,
		environment: 'jsdom',
		setupFiles: ['./src/__test__/vitest-setup.tsx', './src/__test__/setup-browser-env.ts'],
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
