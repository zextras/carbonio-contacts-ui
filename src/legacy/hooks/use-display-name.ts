/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { useMemo } from 'react';

import { t } from '@zextras/carbonio-shell-ui';
import { trim } from 'lodash';
import { useTranslation } from 'react-i18next';

import { Contact } from '../types/contact';

/*
 * Returns the Display name
 * It will check the firstName, middleName and lastName props in contact and will return in string which are available.
 * If firstName, middleName or lastName not available and email found in contact then will return <No name> with email.
 */
export const getDisplayName = (contact: Contact): string | undefined => {
	if ((contact.firstName || contact.middleName || contact.lastName) && !contact.displayName) {
		return trim(
			`${contact.firstName || ''} ${contact.middleName || ''} ${contact.lastName || ''} ${
				contact.nameSuffix || ''
			}`
		);
	}
	if (contact.displayName) {
		return contact.displayName;
	}
	const emailsTypes = Object.keys(contact.email);
	if (contact.email && emailsTypes.length > 0) {
		return `<${t('label.no_name', 'No Name')}> ${contact.email[emailsTypes[0]].mail}`;
	}

	return undefined;
};

/*
 * UseDisplayName hook is returning the Display name
 * It will check the firstName, middleName and lastName props in contact and will return in string which are available.
 * If firstName, middleName or lastName not available and email found in contact then will return <No name> with email.
 */
export const useDisplayName = (contact: Contact): string => {
	const [t] = useTranslation();
	return useMemo(() => {
		if (contact) {
			const displayName = getDisplayName(contact);
			if (displayName) {
				return displayName;
			}
			if (contact.email && Object.keys(contact.email).length > 0) {
				return `<${t('label.no_name', 'No Name')}> ${contact.email[0].mail}`;
			}
		}
		return `<${t('label.no_data', 'No Data')}>`;
	}, [contact, t]);
};
