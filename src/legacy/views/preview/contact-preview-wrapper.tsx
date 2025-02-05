/*
 * SPDX-FileCopyrightText: 2025 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React from 'react';

import { useParams } from 'react-router-dom';

import { ContactPreviewBody } from './contact-preview-body';
import { useAppSelector } from '../../hooks/redux';
import { selectContact } from '../../store/selectors/contacts';

export const ContactPreviewWrapper = (): React.JSX.Element => {
	const { folderId, contactId } = useParams<{ folderId: string; contactId: string }>();
	const contactInternalId = contactId;
	const contact = useAppSelector((state) => selectContact(state, folderId, contactInternalId));

	return <>{contact && <ContactPreviewBody contact={contact} />}</>;
};
