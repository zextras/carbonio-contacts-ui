/*
 * SPDX-FileCopyrightText: 2023 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React, { useMemo } from 'react';

import {
	Accordion,
	type AccordionItemType,
	Avatar,
	Container,
	IconButton,
	Padding,
	Text,
	Tooltip
} from '@zextras/carbonio-design-system';
import { useUserAccount } from '@zextras/carbonio-shell-ui';
import { noop } from 'lodash';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

import { ROUTES } from '../constants';
import { useNavigation } from '../hooks/useNavigation';

const StyledText = styled(Text)`
	min-width: 0;
	flex-basis: 0;
	flex-grow: 1;
`;

const AccordionItem = ({ item }: { item: AccordionItemType }): React.JSX.Element => (
	<Container
		orientation="horizontal"
		mainAlignment="flex-start"
		padding={{ all: 'small' }}
		height="2.5rem"
		style={{ minWidth: 0, flexBasis: 0, flexGrow: 1 }}
	>
		<Padding right="small">
			<Avatar label={item.label ?? ''} />
		</Padding>
		{item.label && (
			<StyledText size="medium" {...item.textProps}>
				{item.label}
			</StyledText>
		)}
	</Container>
);

const SecondaryBarView = ({ expanded }: { expanded: boolean }): React.JSX.Element => {
	const [t] = useTranslation();
	const { name } = useUserAccount();
	const { navigateTo } = useNavigation();

	const items = useMemo(
		(): AccordionItemType[] => [
			{
				id: 'id1',
				label: name,
				CustomComponent: AccordionItem,
				open: true,
				items: [
					{
						id: 'id2',
						icon: 'PeopleOutline',
						label: t('secondaryBar.myContactGroups', 'My Contact Groups'),
						onClick: (ev): void => {
							ev.stopPropagation();
							navigateTo(ROUTES.contactGroups);
						},
						active: true
					},
					{
						id: 'distribution-lists',
						icon: 'DistributionListOutline',
						label: t('secondaryBar.distributionLists', 'Distribution Lists'),
						items: [
							{
								id: 'distribution-lists-member',
								icon: 'DistributionListOutline',
								label: t('secondaryBar.distributionListsMember', 'Member'),
								onClick: (ev): void => {
									ev.stopPropagation();
									navigateTo(ROUTES.distributionListsMember);
								}
							},
							{
								id: 'distribution-lists-manager',
								icon: 'DistributionListOutline',
								label: t('secondaryBar.distributionListsManager', 'Manager'),
								onClick: (ev): void => {
									ev.stopPropagation();
									navigateTo(ROUTES.distributionListsManager);
								}
							}
						]
					}
				],
				onClick: (ev: React.SyntheticEvent | KeyboardEvent): void => {
					ev.stopPropagation();
				}
			}
		],
		[name, navigateTo, t]
	);

	const collapsedItems = useMemo(
		() =>
			items.map((item) => (
				<Tooltip label={item.label} key={item.id}>
					<IconButton
						customSize={{ iconSize: 'large', paddingSize: 'small' }}
						icon={item.icon ?? 'PeopleOutline'}
						onClick={item.onClick ?? noop}
						backgroundColor={item.active ? 'highlight' : undefined}
					/>
				</Tooltip>
			)),
		[items]
	);

	return (
		<Container
			height="auto"
			orientation="vertical"
			mainAlignment="flex-start"
			crossAlignment="flex-start"
		>
			{(expanded && <Accordion role="menuitem" items={items} />) || (
				<Container mainAlignment={'flex-start'} padding={{ vertical: 'small' }}>
					{collapsedItems}
				</Container>
			)}
		</Container>
	);
};
export default SecondaryBarView;
