/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React from 'react';

import { render, screen } from '@testing-library/react';
import { times } from 'lodash';

import { setupTest } from '../../../../../carbonio-ui-commons/test/test-setup';
import { buildContact } from '../../../../../tests/model-builder';
import { Contact } from '../../../../types/contact';
import { DragItems } from '../drag-items';

const contacts = times(10, () => buildContact());

describe('DragItems', () => {
	it('renders no items if draggedIds is undefined', () => {
		const { container } = render(<DragItems contacts={contacts} draggedIds={undefined} />);
		expect(container).toBeEmptyDOMElement();

		setupTest(<DragItems contacts={contacts} draggedIds={{}} />);
		expect(screen.queryByTestId('contact-list-item')).not.toBeInTheDocument();
	});

	it('renders no items if draggedIds is empty', () => {
		const { container } = render(<DragItems contacts={contacts} draggedIds={{}} />);
		expect(container).toBeEmptyDOMElement();

		setupTest(<DragItems contacts={contacts} draggedIds={{}} />);
		expect(screen.queryByTestId('contact-list-item')).not.toBeInTheDocument();
	});

	it('renders only the dragged contacts', () => {
		const con0: Contact | undefined = contacts.at(0);
		const con1: Contact | undefined = contacts.at(1);

		const draggedIds = {
			...(con0 ? { [con0.id]: true } : {}),
			...(con1 ? { [con1.id]: true } : {})
		};

		setupTest(<DragItems contacts={contacts} draggedIds={draggedIds} />);

		const items = screen.getAllByTestId('contact-list-item');
		expect(items).toHaveLength(2);
		expect(items[0]).toHaveTextContent(`${con0?.firstName} ${con0?.middleName} ${con0?.lastName}`);
		expect(items[1]).toHaveTextContent(`${con1?.firstName} ${con1?.middleName} ${con1?.lastName}`);
	});

	it('ignores invalid IDs that do not match any contact', () => {
		setupTest(<DragItems contacts={contacts} draggedIds={{ '999': true, '2': true }} />);

		const items = screen.queryAllByTestId('contact-list-item');
		expect(items).toHaveLength(0);
	});
});
