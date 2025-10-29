/*
 * SPDX-FileCopyrightText: 2025 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import react from '@vitejs/plugin-react';
import path from 'path';
import tsconfigPaths from 'vite-tsconfig-paths';
import { defineConfig } from 'vitest/config';

export default defineConfig({
	define: {
		BASE_PATH: JSON.stringify('/test')
	},
	plugins: [
		react({
			jsxImportSource: '@emotion/react',
			babel: {
				plugins: ['@emotion/babel-plugin']
			}
		}),
		tsconfigPaths()
	],
	test: {
		globals: true,
		environment: 'jsdom',
		setupFiles: [
			path.resolve(__dirname, 'src/__test__/vitest-setup.tsx'),
			path.resolve(__dirname, 'src/__test__/setup-browser-env.ts')
		],
		// clearMocks: true,
		// mockReset: true,
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
