/*
 * SPDX-FileCopyrightText: 2023 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
const path = require('path');

const customizeConfig = (config, pkg, options, mode) => {
	const newConfig = { ...config };

	newConfig.resolve = {
		...config.resolve,
		alias: {
			...(config.resolve?.alias || {}),
			'app-entrypoint': path.resolve(__dirname, 'src/app.tsx')
		},
		modules: [path.resolve(__dirname, 'src'), 'node_modules']
	};

	return newConfig;
};

// Still required to keep the compatibility with the sdk
module.exports = customizeConfig;
