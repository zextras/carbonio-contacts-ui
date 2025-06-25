/*
 * SPDX-FileCopyrightText: 2025 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React from 'react';

import { useParams } from 'react-router-dom';

import { ContactGroupDisplayer } from 'views/contact-groups/displayer/contact-group-displayer';
import { useContactGroupById } from 'legacy/store/contacts';
import ContactsEmptyDisplayer from 'legacy/views/app/contacts-empty-displayer';

export const ContactGroupDisplayerWrapper = (): React.JSX.Element => {
	const { id } = useParams();
	const contactGroup = useContactGroupById(id as string);
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
