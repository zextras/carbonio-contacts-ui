/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React from 'react';

import { act, screen } from '@testing-library/react';
import { useTags, replaceHistory } from '@zextras/carbonio-shell-ui';

import { setupTest } from '../../../../carbonio-ui-commons/test/test-setup';
import { getTagsArray } from '../../../helpers/tags';
import { generateStore } from '../../../tests/generators/store';
import { Contact } from '../../../types/contact';
import { SearchContactListItem } from '../search-contact-list-item';

jest.mock('@zextras/carbonio-shell-ui', () => ({
	useTags: jest.fn(),
	replaceHistory: jest.fn()
}));

jest.mock('../../../helpers/tags', () => ({
	getTagsArray: jest.fn()
}));

describe('SearchContactListItem', () => {
	const mockTags = { tag1: { id: 'tag1', name: 'Tag 1', color: 1 } };
	const mockItem: Contact = {
		id: '1',
		parent: 'folder1',
		tags: ['tag1'],
		firstName: '',
		middleName: '',
		lastName: '',
		displayName: 'display name',
		nickName: '',
		address: {},
		company: '',
		department: '',
		email: {},
		image: '',
		jobTitle: '',
		notes: '',
		phone: {},
		nameSuffix: '',
		namePrefix: '',
		URL: {},
		fileAsStr: ''
	};

	beforeEach(() => {
		(useTags as jest.Mock).mockReturnValue(mockTags);
		(getTagsArray as jest.Mock).mockReturnValue([{ id: 'tag1', name: 'Tag 1', color: 1 }]);
	});

	it('should render the component with correct structure', async () => {
		const store = generateStore();
		setupTest(<SearchContactListItem item={mockItem} />, { store });
		expect(screen.getByTestId('search-contact-list-item')).toBeInTheDocument();
		expect(screen.getByTestId('avatar')).toBeInTheDocument();
		expect(await screen.findByText('display name')).toBeInTheDocument();
	});

	it('should handle click event correctly', async () => {
		const store = generateStore();
		const { user } = setupTest(<SearchContactListItem item={mockItem} />, { store });
		const container = screen.getByTestId('search-contact-list-item');
		await act(async () => {
			await user.click(container);
		});
		expect(replaceHistory).toHaveBeenCalledWith('/folder/folder1/contacts/1');
	});

	it('should pass the correct tags to ItemContent', () => {
		const store = generateStore();
		setupTest(<SearchContactListItem item={mockItem} />, { store });
		expect(getTagsArray).toHaveBeenCalledWith(mockTags, mockItem.tags);
	});
});
