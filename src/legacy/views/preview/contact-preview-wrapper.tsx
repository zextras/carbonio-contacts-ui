/*
 * SPDX-FileCopyrightText: 2025 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React from 'react';

import { useParams } from 'react-router-dom';

import { ContactPreviewPanel } from './contact-preview-panel';
import { useContactById } from '../../store/contacts';
import ContactsEmptyDisplayer from '../app/contacts-empty-displayer';

export const ContactPreviewWrapper = (): React.JSX.Element => {
	const { contactId } = useParams<{ folderId: string; contactId: string }>();
	const contact = useContactById(contactId as string);

	return <>{contact ? <ContactPreviewPanel contact={contact} /> : <ContactsEmptyDisplayer />}</>;
};
