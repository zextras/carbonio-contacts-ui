/*
 * SPDX-FileCopyrightText: 2023 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, {
	useCallback,
	useEffect,
	useImperativeHandle,
	useMemo,
	useRef,
	useState
} from 'react';

import { type ChipAction, Container, Input, ListV2, Row } from '@zextras/carbonio-design-system';
import { reduce, uniqBy } from 'lodash';
import { useTranslation } from 'react-i18next';

import { FilterMembersIcon } from './filter-members-icon';
import { loadingItems } from './loading-items';
import { MemberListItemComponent } from './member-list-item';
import { Text } from './Text';
import { CHIP_DISPLAY_NAME_VALUES } from '../constants/contact-input';
import { ContactInput } from '../legacy/integrations/contact-input';
import type { ContactInputValue } from '../legacy/types/integrations';

const DUPLICATED_MEMBER_ACTION_ID = 'duplicated';

export type ResetMembers = { reset: () => void };

export type EditDLComponentProps = {
	totalMembers: number;
	members: Array<string>;
	onRemoveMember: (member: string) => void;
	onAddMembers: (members: Array<string>) => void;
	loading?: boolean;
	resetRef: React.RefObject<ResetMembers>;
};

const createDuplicatedMemberAction = (): ChipAction => ({
	id: DUPLICATED_MEMBER_ACTION_ID,
	color: 'error',
	type: 'icon',
	icon: 'AlertCircle'
});

export const EditDLMembersComponent = ({
	members,
	totalMembers,
	onRemoveMember,
	onAddMembers,
	loading,
	resetRef
}: EditDLComponentProps): React.JSX.Element => {
	const [t] = useTranslation();
	const [contactInputValue, setContactInputValue] = useState<ContactInputValue>([]);
	const [searchValue, setSearchValue] = useState('');
	const contactInputInputRef = useRef<HTMLInputElement>(null);

	useImperativeHandle(
		resetRef,
		() => ({
			reset: (): void => {
				setContactInputValue([]);
				if (contactInputInputRef.current) {
					contactInputInputRef.current.value = '';
				}
			}
		}),
		[]
	);

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
					if (contactInputItem.error || contactInputItem.email === undefined) {
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
				defaultValue_one: 'Invalid address',
				defaultValue_other: 'Invalid addresses'
			});
		}

		if (invalid === 0 && duplicated >= 1) {
			return t('edit_dl_component.error.duplicated_address', {
				count: duplicated,
				defaultValue_one: 'Address already present',
				defaultValue_other: 'Addresses already present'
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

	const decorateContactInputValue = useCallback(
		(value: ContactInputValue) =>
			value.map((item): ContactInputValue[number] => {
				const duplicated = item.email !== undefined && isMemberDuplicated(item.email);
				const hasDuplicatedAction = item.actions?.some(
					(action) => action.id === DUPLICATED_MEMBER_ACTION_ID
				);
				if (duplicated && !hasDuplicatedAction) {
					return {
						...item,
						actions: [createDuplicatedMemberAction(), ...(item.actions ?? [])]
					};
				}
				if (!duplicated && hasDuplicatedAction) {
					return {
						...item,
						actions:
							item.actions?.filter((action) => action.id !== DUPLICATED_MEMBER_ACTION_ID) ?? []
					};
				}

				return item;
			}),
		[isMemberDuplicated]
	);

	useEffect(() => {
		setContactInputValue((prevState) => decorateContactInputValue(prevState));
	}, [decorateContactInputValue]);

	const onContactInputChange = useCallback(
		(value: ContactInputValue) => {
			// TODO item are filtered to be uniq, because the ContactInput filters out dropdown duplicated items only visually,
			//  but provide them inside onChange arg
			const uniqueValue = uniqBy(value, (item) => item.email);
			setContactInputValue(decorateContactInputValue(uniqueValue));
		},
		[decorateContactInputValue]
	);

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
		<Container mainAlignment={'flex-start'} crossAlignment={'flex-start'} gap={'0.5rem'}>
			<Row>
				<Text size={'small'} color={'secondary'}>
					{t('edit_dl_component.label.members_total', 'Member list {{total}}', {
						total: totalMembers
					})}
				</Text>
			</Row>
			<Text size={'small'} overflow={'break-word'}>
				{t(
					'edit_dl_component.label.hint',
					'You can filter this list by looking for specific member’s name or add new ones by editing the Distribution List.'
				)}
			</Text>
			<Row width={'fill'}>
				<ContactInput
					placeholder={t(
						'edit_dl_component.placeholder.add_members',
						"Type an address, click '+' to add to the distribution list"
					)}
					defaultValue={contactInputValue}
					icon={'Plus'}
					iconAction={onAddRawMembers}
					onChange={onContactInputChange}
					iconDisabled={!isAddMembersAllowed}
					chipDisplayName={CHIP_DISPLAY_NAME_VALUES.email}
					description={contactInputErrorDescription}
					hasError={isOnlyInvalidContacts}
					inputRef={contactInputInputRef}
				/>
			</Row>
			<Input
				data-testid={'dl-members-filter-input'}
				label={t('edit_dl_component.placeholder.filter_member', 'Filter an address')}
				CustomIcon={FilterMembersIcon}
				value={searchValue}
				onChange={onSearchChange}
			/>
			<Container minHeight={'10rem'} mainAlignment={'flex-start'}>
				<ListV2>{(!loading && memberItems) || loadingItems(3)}</ListV2>
			</Container>
		</Container>
	);
};
