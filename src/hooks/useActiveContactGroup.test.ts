/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { renderHook } from '@testing-library/react-hooks';
import { useParams } from 'react-router-dom';

import { useActiveContactGroup } from './useActiveContactGroup';
import { useContactGroupStore } from '../store/contact-groups';
import { buildContactGroup } from '../tests/model-builder';

jest.mock('react-router-dom', () => ({
	...jest.requireActual('react-router-dom'),
	useParams: jest.fn()
}));

describe('Active Contact Group', () => {
	it('should return contact group using id parameter', () => {
		const contactGroup = buildContactGroup();
		useContactGroupStore.getState().addContactGroups([contactGroup]);
		(useParams as jest.Mock).mockReturnValue({ id: contactGroup.id });

		const { result } = renderHook(useActiveContactGroup);

		expect(result.current).toBe(contactGroup);
	});

	it('should return undefined if contact group not present', () => {
		useContactGroupStore.getState().addContactGroups([buildContactGroup({ id: '1' })]);
		(useParams as jest.Mock).mockReturnValue({ id: '123' });

		const { result } = renderHook(useActiveContactGroup);

		expect(result.current).toBeUndefined();
	});
});
