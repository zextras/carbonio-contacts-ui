/*
 * SPDX-FileCopyrightText: 2023 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React, { ReactElement } from 'react';

import { Container, ListItemProps, ListV2 } from '@zextras/carbonio-design-system';
import { useTranslation } from 'react-i18next';

import { Navbar } from '../../../components/sidebar/item-list/navbar';
import { LIST_WIDTH } from '../../../constants';
import { EmptyListPanel } from '../../../legacy/views/app/folder-panel/empty-list-panel';

type ContactGroupListComponentProps = {
	onContactGroupClick: (contactGroupId: string) => void;
	onListBottom: () => void;
	children: Array<ReactElement<ListItemProps>>;
};
export const ContactGroupListComponent = ({
	onListBottom,
	children
}: ContactGroupListComponentProps): React.JSX.Element => {
	const [t] = useTranslation();

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
				itemsCount={children.length}
			/>
			<Container minHeight={0} maxHeight={'100%'}>
				{children ? (
					<ListV2
						data-testid="main-list"
						background={'gray6'}
						onListBottom={onListBottom}
						intersectionObserverInitOptions={{ threshold: 0.5 }}
					>
						{children}
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
