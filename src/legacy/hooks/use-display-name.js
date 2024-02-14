/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { useMemo } from 'react';

import { t } from '@zextras/carbonio-shell-ui';
import { trim } from 'lodash';

/*
 * UseDisplayName hook is returning the Display name
 * It will check the firstName, middleName and lastName props in contact and will return in string which are available.
 * If firstName, middleName or lastName not available and email found in contact then will return <No name> with email.
 */
export const useDisplayName = (contact) =>
	useMemo(() => {
		if (contact) {
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
			if (contact.email && contact.email.length > 0)
				return `<${t('label.no_name', 'No Name')}> ${contact.email[0].mail}`;
		}
		return `<${t('label.no_data', 'No Data')}>`;
	}, [contact]);
