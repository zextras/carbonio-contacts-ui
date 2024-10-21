/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React from 'react';

import { screen, fireEvent, act } from '@testing-library/react';
import { replaceHistory } from '@zextras/carbonio-shell-ui';

import { setupTest, UserEvent } from '../../../../../carbonio-ui-commons/test/test-setup';
import { Contact } from '../../../../types/contact';
import { ContactListItem } from '../contact-list-item';

jest.mock('@zextras/carbonio-shell-ui', () => ({
	replaceHistory: jest.fn(),
	useTags: jest.fn(() => [])
}));

const mockToggle = jest.fn();
const mockSetDraggedIds = jest.fn();
const mockSetIsDragging = jest.fn();

const contact: Contact = {
	URL: {},
	address: {},
	company: '',
	department: '',
	email: {},
	fileAsStr: '',
	image: '',
	jobTitle: '',
	middleName: '',
	namePrefix: '',
	nameSuffix: '',
	nickName: '',
	notes: '',
	parent: '',
	phone: {},
	id: '1',
	firstName: 'John',
	lastName: 'Doe',
	tags: ['important']
};

const renderComponent = (props = {}): { user: UserEvent } =>
	setupTest(
		<ContactListItem
			item={contact}
			folderId="folder123"
			active={false}
			toggle={mockToggle}
			setDraggedIds={mockSetDraggedIds}
			setIsDragging={mockSetIsDragging}
			selectedItems={{}}
			{...props}
		/>
	);

describe('ContactListItem', () => {
	afterEach(() => {
		jest.clearAllMocks();
	});

	it('renders the contact item with avatar and content', () => {
		renderComponent();
		expect(screen.getByTestId('contact-list-item')).toBeInTheDocument();
	});

	it('calls replaceHistory on click when not prevented', async () => {
		const { user } = renderComponent();

		const listItem = await screen.findByTestId('contact-list-item');
		await act(async () => {
			await user.hover(listItem);
		});

		await act(async () => {
			await user.click(listItem);
		});

		expect(replaceHistory).toHaveBeenCalledWith('/folder/folder123/contacts/1');
	});

	it('does not call replaceHistory if the click event is prevented', () => {
		const { user } = renderComponent();

		const listItem = screen.getByTestId('contact-list-item');
		act(() => listItem.addEventListener('click', (e) => e.preventDefault()));

		user.click(listItem);

		expect(replaceHistory).not.toHaveBeenCalled();
	});

	it('calls setIsDragging and sets dragged item IDs on drag start', () => {
		renderComponent({ selectedItems: { '1': true } });

		const listItem = screen.getByTestId('contact-list-item');
		fireEvent.dragStart(listItem);

		expect(mockSetIsDragging).toHaveBeenCalledWith(true);
		expect(mockSetDraggedIds).toHaveBeenCalledWith({ '1': true });
	});

	it('calls setDraggedIds with only the dragged item if it is not already selected', () => {
		renderComponent({ selectedItems: {} });

		const listItem = screen.getByTestId('contact-list-item');
		fireEvent.dragStart(listItem);

		expect(mockSetDraggedIds).toHaveBeenCalledWith({ '1': true });
	});
});
