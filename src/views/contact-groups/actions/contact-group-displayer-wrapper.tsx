/*
 * SPDX-FileCopyrightText: 2025 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React from 'react';

import { useParams } from 'react-router-dom';

import { useAppSelector } from '../../../legacy/hooks/redux';
import { selectContactGroup } from '../../../legacy/store/selectors/contacts';
import ContactsEmptyDisplayer from '../../../legacy/views/app/contacts-empty-displayer';
import { ContactGroupDisplayer } from '../displayer/contact-group-displayer';

export const ContactGroupDisplayerWrapper = (): React.JSX.Element => {
	const { id: contactGroupId, folderId } = useParams<{ folderId: string; id: string }>();
	const contactGroup = useAppSelector((state) =>
		selectContactGroup(state, folderId ?? '', contactGroupId ?? '')
	);
	return (
		<>
			{contactGroup ? (
				<ContactGroupDisplayer contactGroup={contactGroup} />
			) : (
				<ContactsEmptyDisplayer />
			)}
		</>
	);
};
