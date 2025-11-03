/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React from 'react';

import { renderHook } from '@testing-library/react';
import { useParams } from 'react-router-dom';
import { Mock } from 'vitest';

import { useGetContactGroupFromPath } from 'hooks/useGetContactGroupFromPath';
import { addContactsToStore } from 'legacy/store/contacts';
import { buildContactGroup } from 'tests/model-builder';

vi.mock('react-router-dom', async () => {
	const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom');
	return {
		...actual,
		useParams: vi.fn()
	};
});

function getWrapper(): React.FC {
	// eslint-disable-next-line react/display-name
	return ({ children }: { children?: React.ReactNode }) => <>{children}</>;
}

describe('Active Contact Group', () => {
	const folderId = '1';

	it('should return contact group using id parameter', () => {
		const contactGroup = buildContactGroup();
		addContactsToStore([contactGroup]);
		(useParams as Mock).mockReturnValue({ id: contactGroup.id, folderId });
		const wrapper = getWrapper();

		const { result } = renderHook(useGetContactGroupFromPath, { wrapper });

		expect(result.current).toBe(contactGroup);
	});

	it('should return undefined if contact group not present', () => {
		const wrapper = getWrapper();
		(useParams as Mock).mockReturnValue({ id: 'non-existing', folderId });

		const { result } = renderHook(useGetContactGroupFromPath, { wrapper });

		expect(result.current).toBeUndefined();
	});
});
