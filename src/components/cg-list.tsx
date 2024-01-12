/*
 * SPDX-FileCopyrightText: 2023 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React, { useMemo } from 'react';

import { map } from 'lodash';
import { useTranslation } from 'react-i18next';

import { CGListItem } from './cg-list-item';
import { MainList } from './main-list';
import { StyledListItem } from './styled-components';
import { useActiveItem } from '../hooks/useActiveItem';
import { ContactGroup } from '../model/contact-group';

export type CGListProps = {
	contactGroups: Array<ContactGroup>;
	onListBottom?: () => void;
};

export const CGList = ({ contactGroups, onListBottom }: CGListProps): React.JSX.Element => {
	const [t] = useTranslation();
	const { activeItem, setActive } = useActiveItem();

	const items = useMemo(
		() =>
			map(contactGroups, (contactGroup) => (
				<StyledListItem
					key={contactGroup.id}
					active={contactGroup.id === activeItem}
					data-testid={'list-item'}
				>
					{(visible): React.JSX.Element => (
						<CGListItem
							visible={visible}
							title={contactGroup.title}
							id={contactGroup.id}
							onClick={setActive}
							members={contactGroup.members}
						/>
					)}
				</StyledListItem>
			)),
		[activeItem, contactGroups, setActive]
	);

	return (
		<MainList
			emptyMessage={t('contactGroupList.emptyList', 'No contact groups have been created yet')}
			onListBottom={onListBottom}
		>
			{items}
		</MainList>
	);
};
