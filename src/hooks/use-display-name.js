/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { useMemo } from 'react';
import { trim } from 'lodash';

export const useDisplayName = (contact) =>
	useMemo(() => {
		if (contact) {
			if (contact.firstName || contact.middleName || contact.lastName) {
				return trim(
					`${contact.namePrefix || ''} ${contact.firstName || ''} ${contact.middleName || ''} ${
						contact.lastName || ''
					} ${contact.nameSuffix || ''}`
				);
			}
			if (contact.email && contact.email.length > 0) return `<No Name> ${contact.email[0].mail}`;
		}
		return '<No Data>';
	}, [contact]);
