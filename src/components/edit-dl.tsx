/*
 * SPDX-FileCopyrightText: 2023 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { FC, useCallback, useMemo, useState } from 'react';

import { Container, Icon, Input, ListV2, Text } from '@zextras/carbonio-design-system';
import { reduce } from 'lodash';
import { useTranslation } from 'react-i18next';

import { MemberListItemComponent } from './member-list-item';
import { ContactInput } from '../legacy/integrations/contact-input';

export type EditDLComponentProps = {
	email: string;
	totalMembers: number;
	members: Array<string>;
	onRemoveMember: (email: string) => void;
	onAddMembers: (emails: Array<string>) => void;
};

type ContactInputValue = Array<{ email: string; error: boolean }>;

const SearchMembersIcon: FC = () => <Icon icon={'Search'} size={'large'}></Icon>;

export const EditDLComponent: FC<EditDLComponentProps> = ({
	email,
	members,
	totalMembers,
	onRemoveMember,
	onAddMembers
}) => {
	const [t] = useTranslation();
	const [contactInputValue, setContactInputValue] = useState<ContactInputValue>([]);
	const [searchValue, setSearchValue] = useState('');

	const memberItems = useMemo(
		() =>
			reduce<string, React.JSX.Element[]>(
				members,
				(accumulator, member) => {
					if (member.includes(searchValue)) {
						accumulator.push(
							<MemberListItemComponent
								email={member}
								onRemove={(): void => onRemoveMember(member)}
								key={member}
							/>
						);
					}
					return accumulator;
				},
				[]
			),
		[members, onRemoveMember, searchValue]
	);

	const isAddMembersAllowed = useMemo(
		() => contactInputValue.some((chipValue) => !chipValue.error),
		[contactInputValue]
	);

	const onContactInputChange = useCallback((value: ContactInputValue) => {
		setContactInputValue(value);
	}, []);

	const onSearchChange = useCallback<React.ChangeEventHandler<HTMLInputElement>>((event) => {
		setSearchValue(event.currentTarget.value);
	}, []);

	const onAddRawMembers = useCallback(() => {
		const validEmails = contactInputValue.reduce<string[]>((result, contactInputItem) => {
			!contactInputItem.error && result.push(contactInputItem.email);
			return result;
		}, []);
		if (validEmails.length > 0) {
			onAddMembers(validEmails);
		}
	}, [contactInputValue, onAddMembers]);

	return (
		<Container gap={'0.5rem'}>
			<Container padding={{ bottom: 'small' }}>
				<Text size={'small'} color={'secondary'}>
					{t('edit_dl_component.label.dl_email', 'Distribution list')}
				</Text>
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
				// FIXME: remove ts-ignore when contact-input types are fixed
				// eslint-disable-next-line @typescript-eslint/ban-ts-comment
				// @ts-ignore
				defaultValue={contactInputValue}
				icon={'Plus'}
				iconAction={onAddRawMembers}
				// FIXME: remove ts-ignore when contact-input types are fixed
				// eslint-disable-next-line @typescript-eslint/ban-ts-comment
				// @ts-ignore
				onChange={onContactInputChange}
				iconDisabled={!isAddMembersAllowed}
			/>
			<Input
				data-testid={'dl-members-search-input'}
				label={t('edit_dl_component.placeholder.search_member', 'Search an address')}
				CustomIcon={SearchMembersIcon}
				value={searchValue}
				onChange={onSearchChange}
			/>
			<Text size={'small'} color={'secondary'}>
				{t('edit_dl_component.label.members_total', 'Member list {{total}}', {
					total: totalMembers
				})}
			</Text>
			<ListV2>{memberItems}</ListV2>
		</Container>
	);
};
