/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { FC, ReactElement, useState, useCallback, useMemo, useEffect } from 'react';

import {
	CustomModal,
	Container,
	Row,
	Padding,
	Icon,
	Tooltip,
	Text,
	ModalHeader,
	Divider,
	ModalFooter
} from '@zextras/carbonio-design-system';
import { ZIMBRA_STANDARD_COLORS, getTags } from '@zextras/carbonio-ui-commons';
import { TFunction } from 'i18next';
import { concat, filter, map } from 'lodash';

import CompanyNameRow from './parts/company-row';
import EmailAddressRow from './parts/email-address-row';
import JobRoleRow from './parts/job-role-row';
import NameRow from './parts/name-row';
import PhoneNumberRow from './parts/phone-number-row';
import KeywordRow, { KeywordState } from 'legacy/views/search/parts/keyword-row';
import TagRow from 'legacy/views/search/parts/tag-row';
import ToggleFilters from 'legacy/views/search/parts/toggle-filters';
import type { Query } from 'legacy/views/search/search-types';

export type AdvancedFilterModalProps = {
	open: boolean;
	onClose: () => void;
	t: TFunction;
	query: Query;
	isSharedFolderIncludedInitialValue: boolean;
	isSharedFolderIncludedDefault: boolean;
	onSearchConfirm: (request: { query: Query; includeSharedFolders: boolean }) => void;
};

export const AdvancedFilterModal: FC<AdvancedFilterModalProps> = ({
	open,
	onClose,
	t,
	query,
	onSearchConfirm,
	isSharedFolderIncludedInitialValue,
	isSharedFolderIncludedDefault
}): ReactElement => {
	const [otherKeywords, setOtherKeywords] = useState<KeywordState>([]);
	const [firstName, setFirstName] = useState<string>('');
	const [lastName, setLastName] = useState<string>('');
	const [companyName, setCompanyName] = useState<string>('');
	const [jobRole, setJobRole] = useState<string>('');
	const [emailAddress, setEmailAddress] = useState<string>('');
	const [phoneNumber, setPhoneNumber] = useState<string>('');
	const [tag, setTag] = useState<KeywordState>([]);
	const [hasPerformedSearch, setHasPerformedSearch] = useState(false);
	const tagOptions = useMemo(
		() =>
			map(getTags(), (item) => ({
				...item,
				label: item.name,
				customComponent: (
					<Row takeAvailableSpace mainAlignment="flex-start">
						<Row takeAvailableSpace mainAlignment="space-between">
							<Row mainAlignment="flex-end">
								<Padding right="small">
									<Icon icon="Tag" color={ZIMBRA_STANDARD_COLORS[item.color ?? 0].hex} />
								</Padding>
							</Row>
							<Row takeAvailableSpace mainAlignment="flex-start">
								<Tooltip label={item.name} overflowTooltip>
									<Text>{item.name}</Text>
								</Tooltip>
							</Row>
						</Row>
					</Row>
				)
			})),
		[]
	);
	const [isSharedFolderIncludedTobe, setIsSharedFolderIncludedTobe] = useState(
		isSharedFolderIncludedInitialValue
	);

	useEffect(() => {
		if (!open) {
			setHasPerformedSearch(false);
		}
		if (!hasPerformedSearch) {
			setIsSharedFolderIncludedTobe(isSharedFolderIncludedInitialValue);
		}
	}, [open, isSharedFolderIncludedInitialValue, hasPerformedSearch]);

	useEffect(() => {
		if (!open) return;

		const updatedQuery = map(
			filter(query, (v) => !/^tag:/.test(v.label ?? '') && !v.isQueryFilter),
			(q) => ({ ...q, hasAvatar: false })
		);

		const tagFromQuery = map(
			filter(query, (v) => /^tag:/.test(v.label ?? '')),
			(q) => ({ ...q, hasAvatar: true, icon: 'TagOutline' })
		);

		const firstNameQuery =
			query.find((v) => /^FirstName:/.test(v.label ?? ''))?.label?.replace('firstName:', '') || '';
		const lastNameQuery =
			query.find((v) => /^LastName:/.test(v.label ?? ''))?.label?.replace('lastName:', '') || '';

		setFirstName(firstNameQuery);
		setLastName(lastNameQuery);
		setTag(tagFromQuery);
		setOtherKeywords(updatedQuery);
	}, [query, open]);
	const queryToBe = useMemo(() => {
		const nameQuery = [];
		if (firstName) {
			nameQuery.push({ label: `firstName:"${firstName}"`, hasAvatar: false });
		}
		if (lastName) {
			nameQuery.push({ label: `lastName:"${lastName}"`, hasAvatar: false });
		}
		return concat(otherKeywords, tag, nameQuery);
	}, [otherKeywords, tag, firstName, lastName]);

	const secondaryDisabled = useMemo(
		() => queryToBe.length === 0 && isSharedFolderIncludedTobe === isSharedFolderIncludedDefault,
		[queryToBe.length, isSharedFolderIncludedTobe, isSharedFolderIncludedDefault]
	);

	// Reset all filters to default values
	const resetFilters = useCallback(() => {
		setIsSharedFolderIncludedTobe(isSharedFolderIncludedDefault);
		setOtherKeywords([]);
		setTag([]);
		setFirstName('');
		setLastName('');
		setHasPerformedSearch(false);
	}, [isSharedFolderIncludedDefault]);

	// Handle search confirmation
	const onConfirm = useCallback(() => {
		setHasPerformedSearch(true);
		onSearchConfirm({ query: queryToBe, includeSharedFolders: isSharedFolderIncludedTobe });
		onClose();
	}, [queryToBe, onSearchConfirm, isSharedFolderIncludedTobe, onClose]);

	// Props for child components
	const nameRowProps = useMemo(
		() => ({
			query,
			firstName,
			lastName,
			setFirstName,
			setLastName
		}),
		[firstName, lastName, query]
	);

	const companyNameRowProps = useMemo(
		() => ({
			query,
			companyName,
			setCompanyName
		}),
		[companyName, query]
	);

	const jobRoleRowProps = useMemo(
		() => ({
			query,
			jobRole,
			setJobRole
		}),
		[jobRole, query]
	);

	const emailAddressRowProps = useMemo(
		() => ({
			query,
			emailAddress,
			setEmailAddress
		}),
		[emailAddress, query]
	);

	const phoneNumberRowProps = useMemo(
		() => ({
			query,
			phoneNumber,
			setPhoneNumber
		}),
		[phoneNumber, query]
	);

	const keywordRowProps = useMemo(
		() => ({
			otherKeywords,
			setOtherKeywords,
			query
		}),
		[otherKeywords, query]
	);

	const tagRowProps = useMemo(
		() => ({
			tagOptions,
			tag,
			setTag
		}),
		[tagOptions, tag]
	);

	const toggleFiltersProps = useMemo(
		() => ({
			query,
			setIsSharedFolderIncludedTobe,
			isSharedFolderIncludedTobe
		}),
		[query, isSharedFolderIncludedTobe]
	);

	return (
		<CustomModal
			open={open}
			onClose={onClose}
			maxHeight="90vh"
			size="medium"
			data-testid={'advanced-filter-modal'}
		>
			<ModalHeader
				onClose={onClose}
				title={t('title.advanced_filters', 'Advanced Filters')}
				showCloseIcon
			/>
			<Divider />
			<Container padding={{ horizontal: 'medium', vertical: 'small' }}>
				<ToggleFilters compProps={toggleFiltersProps} />
				<KeywordRow compProps={keywordRowProps} />
				<NameRow compProps={nameRowProps} />
				<CompanyNameRow compProps={companyNameRowProps} />
				<JobRoleRow compProps={jobRoleRowProps} />
				<EmailAddressRow compProps={emailAddressRowProps} />
				<PhoneNumberRow compProps={phoneNumberRowProps} />
				<TagRow compProps={tagRowProps} />
			</Container>
			<Divider />
			<ModalFooter
				confirmLabel={t('action.search', 'Search')}
				confirmDisabled={queryToBe.length === 0}
				onConfirm={onConfirm}
				onSecondaryAction={resetFilters}
				secondaryActionDisabled={secondaryDisabled}
				secondaryActionLabel={t('action.reset_filters', 'Reset Filters')}
			></ModalFooter>
		</CustomModal>
	);
};

export default AdvancedFilterModal;
