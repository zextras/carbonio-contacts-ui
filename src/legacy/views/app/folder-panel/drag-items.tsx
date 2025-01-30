/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React from 'react';

import { find, map, reduce } from 'lodash';

import { ContactListItem } from './contact-list-item';
import { ContactGroupListItemWrapper } from '../../../../views/contact-groups/list/contact-group-list-item-wrapper';
import { ContactOrGroup } from '../../../types/contact';

export const DragItems = ({
	contacts,
	draggedIds
}: {
	contacts: Array<ContactOrGroup>;
	draggedIds: Record<string, boolean> | undefined;
}): React.JSX.Element => {
	const items = reduce(
		draggedIds,
		(acc: Array<ContactOrGroup>, v, k) => {
			const obj = find(contacts, ['id', k]);
			if (obj) {
				return [...acc, obj];
			}
			return acc;
		},
		[]
	);

	return (
		<>
			{map(items, (item, index) => {
				if ('members' in item) {
					return <ContactGroupListItemWrapper visible={false} contactGroup={item} />;
				}
				return <ContactListItem item={item} key={index} />;
			})}
		</>
	);
};
