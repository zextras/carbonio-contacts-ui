/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { useTranslation } from 'react-i18next';

import { getRoleDescription } from './shares-utils';
import { setupHook } from '../../carbonio-ui-commons/test/test-setup';

describe('getRoleDescription', () => {
	const {
		result: {
			current: [t]
		}
	} = setupHook(useTranslation);
	it('should return "None" if no matching role is found', () => {
		expect(getRoleDescription('non-existing-value', t)).toEqual('None');
	});

	it('should return "None" if the given perms is an empty string', () => {
		expect(getRoleDescription('', t)).toEqual('None');
	});

	it('should return "Viewer" if the given perms is "r"', () => {
		expect(getRoleDescription('r', t)).toEqual('Viewer');
	});

	it('should return "Admin" if the given perms contains "rwidxa"', () => {
		expect(getRoleDescription('rwidxa', t)).toEqual('Admin');
	});

	it('should return "Admin" if the given perms contains "rwidxac"', () => {
		expect(getRoleDescription('rwidxac', t)).toEqual('Admin');
	});

	it('should return "Manager" if the given perms contains "rwidx"', () => {
		expect(getRoleDescription('rwidx', t)).toEqual('Manager');
	});

	it('should return "Manager" if the given perms contains "rwidxc"', () => {
		expect(getRoleDescription('rwidxc', t)).toEqual('Manager');
	});
});
