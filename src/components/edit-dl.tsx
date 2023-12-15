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
import { CHIP_DISPLAY_NAME_VALUES } from '../constants/contact-input';
import { ContactInput } from '../legacy/integrations/contact-input';

export type EditDLComponentProps = {
	email: string;
	totalMembers: number;
	members: Array<string>;
	onRemoveMember: (member: string) => void;
	onAddMembers: (members: Array<string>) => void;
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

	const isMemberDuplicated = useCallback(
		(member: string): boolean => members.includes(member),
		[members]
	);

	const { validEmails, invalidEmailContacts, duplicatedContacts } = useMemo(
		() =>
			contactInputValue.reduce<{
				validEmails: Array<string>;
				invalidEmailContacts: ContactInputValue;
				duplicatedContacts: ContactInputValue;
			}>(
				(result, contactInputItem) => {
					if (contactInputItem.error) {
						result.invalidEmailContacts.push(contactInputItem);
					} else if (isMemberDuplicated(contactInputItem.email)) {
						result.duplicatedContacts.push(contactInputItem);
					} else {
						result.validEmails.push(contactInputItem.email);
					}

					return result;
				},
				{
					validEmails: [],
					invalidEmailContacts: [],
					duplicatedContacts: []
				}
			),
		[contactInputValue, isMemberDuplicated]
	);

	const contactInputErrorDescription = useMemo(() => {
		const valid = validEmails.length;
		const duplicated = duplicatedContacts.length;
		const invalid = invalidEmailContacts.length;

		if (valid > 0) {
			return undefined;
		}

		if (invalid > 0 && duplicated > 0) {
			return t(
				'edit_dl_component.error.invalid_and_duplicated_addresses',
				'Invalid and already present addresses'
			);
		}

		if (invalid >= 1 && duplicated === 0) {
			return t('edit_dl_component.error.invalid_address', {
				count: invalid,
				defaultValue: 'Invalid address',
				defaultValue_plural: 'Invalid addresses'
			});
		}

		if (invalid === 0 && duplicated >= 1) {
			return t('edit_dl_component.error.duplicated_address', {
				count: duplicated,
				defaultValue: 'Address already present',
				defaultValue_plural: 'Addresses already present'
			});
		}

		return undefined;
	}, [duplicatedContacts.length, invalidEmailContacts.length, t, validEmails.length]);

	const isOnlyInvalidContacts = useMemo(
		(): boolean =>
			validEmails.length === 0 &&
			(invalidEmailContacts.length > 0 || duplicatedContacts.length > 0),
		[duplicatedContacts.length, invalidEmailContacts.length, validEmails.length]
	);

	const isAddMembersAllowed = useMemo(() => validEmails.length > 0, [validEmails]);

	const onContactInputChange = useCallback((value: ContactInputValue) => {
		setContactInputValue(value);
	}, []);

	const onSearchChange = useCallback<React.ChangeEventHandler<HTMLInputElement>>((event) => {
		setSearchValue(event.currentTarget.value);
	}, []);

	const onAddRawMembers = useCallback(() => {
		if (validEmails.length > 0) {
			onAddMembers(validEmails);
			setContactInputValue([...invalidEmailContacts, ...duplicatedContacts]);
		}
	}, [duplicatedContacts, invalidEmailContacts, onAddMembers, validEmails]);

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
				chipDisplayName={CHIP_DISPLAY_NAME_VALUES.EMAIL}
				description={contactInputErrorDescription}
				hasError={isOnlyInvalidContacts}
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
