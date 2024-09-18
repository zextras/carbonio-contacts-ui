/*
 * SPDX-FileCopyrightText: 2023 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React, { useMemo } from 'react';

import { Container, ListV2 } from '@zextras/carbonio-design-system';
import { map } from 'lodash';
import { useTranslation } from 'react-i18next';

import { CGListItem } from './cg-list-item';
import { Navbar } from './sidebar/item-list/navbar';
import { StyledListItem } from './styled-components';
import { LIST_WIDTH } from '../constants';
import { useActiveItem } from '../hooks/useActiveItem';
import { EmptyListPanel } from '../legacy/views/app/folder-panel/empty-list-panel';
import { ContactGroup } from '../model/contact-group';

type ContactGroupListComponentProps = {
	onContactGroupClick: (contactGroupId: string) => void;
	contactGroups: Array<ContactGroup>;
	onListBottom: () => void;
};
export const ContactGroupListComponent = ({
	onContactGroupClick,
	contactGroups,
	onListBottom
}: ContactGroupListComponentProps): React.JSX.Element => {
	const [t] = useTranslation();
	const { activeItem } = useActiveItem();

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
							onClick={onContactGroupClick}
							members={contactGroup.members}
						/>
					)}
				</StyledListItem>
			)),
		[activeItem, contactGroups, onContactGroupClick]
	);

	return (
		<Container
			width={LIST_WIDTH}
			mainAlignment="flex-start"
			crossAlignment="unset"
			borderRadius="none"
			background={'gray6'}
			borderColor={{ right: 'gray3' }}
		>
			<Navbar
				name={`/ ${t('secondaryBar.contactGroups', 'Contact Groups')}`}
				itemsCount={items.length}
			/>
			<Container minHeight={0} maxHeight={'100%'}>
				{items && items.length > 0 ? (
					<ListV2
						data-testid="main-list"
						background={'gray6'}
						onListBottom={onListBottom}
						intersectionObserverInitOptions={{ threshold: 0.5 }}
					>
						{items}
					</ListV2>
				) : (
					<EmptyListPanel
						emptyListTitle={t(
							'contactGroupList.emptyList',
							'No contact groups have been created yet'
						)}
					/>
				)}
			</Container>
		</Container>
	);
};
