/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React from 'react';

import { screen, fireEvent, act } from '@testing-library/react';
import { getAction } from '@zextras/carbonio-shell-ui';
import { useNavigate } from 'react-router-dom';
import { Mock } from 'vitest';

import { setupTest, UserEvent } from '@test-setup';
import { Contact } from 'legacy/types/contact';
import { ContactListItem } from 'legacy/views/app/folder-panel/contact-list-item';

vi.mock('@zextras/carbonio-shell-ui', () => ({
	useTags: vi.fn(() => []),
	getAction: vi.fn()
}));

vi.mock('react-router-dom', async () => {
	const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom');
	return {
		...actual,
		useNavigate: vi.fn()
	};
});

const mockToggle = vi.fn();
const mockSetDraggedIds = vi.fn();
const mockSetIsDragging = vi.fn();

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
	beforeAll(() => {
		const mailTo = { id: 'mail-to', label: 'action.send_msg', execute: vi.fn() };
		(getAction as Mock).mockReturnValue([mailTo, true]);
	});

	it('renders the contact item with avatar and content', () => {
		renderComponent();
		expect(screen.getByTestId(`contact-list-item-${contact.id}`)).toBeInTheDocument();
	});

	it('calls navigate on click when not prevented', async () => {
		const useNavigateSpy = vi.fn();
		(useNavigate as Mock).mockReturnValue(useNavigateSpy);
		const { user } = renderComponent();

		const listItem = await screen.findByTestId(`contact-list-item-${contact.id}`);
		await user.hover(listItem);
		await user.click(listItem);

		expect(useNavigateSpy).toHaveBeenCalledWith('../folder/folder123/contacts/1');
	});

	it('calls setIsDragging and sets dragged item IDs on drag start', () => {
		renderComponent({ selectedItems: { '1': true } });

		const listItem = screen.getByTestId(`contact-list-item-${contact.id}`);
		fireEvent.dragStart(listItem);

		expect(mockSetIsDragging).toHaveBeenCalledWith(true);
		expect(mockSetDraggedIds).toHaveBeenCalledWith({ '1': true });
	});

	it('calls setDraggedIds with only the dragged item if it is not already selected', () => {
		renderComponent({ selectedItems: {} });

		const listItem = screen.getByTestId(`contact-list-item-${contact.id}`);
		fireEvent.dragStart(listItem);

		expect(mockSetDraggedIds).toHaveBeenCalledWith({ '1': true });
	});
});
