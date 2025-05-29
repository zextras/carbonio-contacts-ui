/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React from 'react';

import { act, screen } from '@testing-library/react';
import { useTags } from '@zextras/carbonio-ui-commons';
import { useNavigate } from 'react-router-dom';

import { getTagsArray } from '../../../helpers/tags';
import { Contact } from '../../../types/contact';
import { SearchContactListItem } from '../search-contact-list-item';
import { setupTest } from '@test-setup';

jest.mock('../../../../carbonio-ui-commons/store/zustand/tags', () => ({
	useTags: jest.fn()
}));

jest.mock('react-router-dom', () => ({
	...jest.requireActual('react-router-dom'),
	useNavigate: jest.fn()
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
		setupTest(<SearchContactListItem item={mockItem} />);
		expect(screen.getByTestId('search-contact-list-item')).toBeInTheDocument();
		expect(screen.getByTestId('avatar')).toBeInTheDocument();
		expect(await screen.findByText('display name')).toBeInTheDocument();
	});

	it('should handle click event correctly', async () => {
		const useNavigateSpy = jest.fn();
		(useNavigate as jest.Mock).mockReturnValue(useNavigateSpy);

		const { user } = setupTest(<SearchContactListItem item={mockItem} />);
		const container = screen.getByTestId('search-contact-list-item');
		await act(async () => {
			await user.click(container);
		});
		expect(useNavigateSpy).toHaveBeenCalledWith('../folder/folder1/contacts/1', { replace: true });
	});

	it('should pass the correct tags to ItemContent', () => {
		setupTest(<SearchContactListItem item={mockItem} />);
		expect(getTagsArray).toHaveBeenCalledWith(mockTags, mockItem.tags);
	});
});
