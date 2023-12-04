/*
 * SPDX-FileCopyrightText: 2023 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { FC, useCallback } from 'react';

import { Container, Icon, Input, Text } from '@zextras/carbonio-design-system';
import { useTranslation } from 'react-i18next';

import { ContactInput } from '../legacy/integrations/contact-input';

export type EditDLComponentProps = {
	email: string;
	totalMembers: number;
	members: Array<string>;
};

const SearchMembersIcon: FC = () => <Icon icon={'Search'} size={'large'}></Icon>;

export const EditDLComponent: FC<EditDLComponentProps> = ({ email, members, totalMembers }) => {
	const [t] = useTranslation();
	const onMembersAdd = useCallback(() => {}, []);
	return (
		<Container gap={'0.5rem'}>
			<Container padding={{ bottom: 'small' }}>
				<Text size={'small'}>{t('edit_dl_component.label.dl_email', 'Distribution list')}</Text>
				<Text size={'small'}>{email}</Text>
			</Container>
			<Text size={'small'}>
				{t(
					'edit_dl_component.label.hint',
					'You can filter this list by looking for specific member’s name or add new ones by editing the Distribution List.'
				)}
			</Text>
			<ContactInput
				placeholder={t(
					'edit_dl_component.placeholder.add_members',
					'Insert an address to add a new element'
				)}
				defaultValue={[]}
				icon={'Plus'}
				iconAction={onMembersAdd}
			></ContactInput>
			<Input
				data-testid={'dl-members-search-input'}
				label={t('edit_dl_component.placeholder.search_member', 'Search an address')}
				CustomIcon={SearchMembersIcon}
			></Input>
			<Text size={'small'}>
				{t('edit_dl_component.label.members_total', 'Member list {{total}}', {
					total: totalMembers
				})}
			</Text>
		</Container>
	);
};
