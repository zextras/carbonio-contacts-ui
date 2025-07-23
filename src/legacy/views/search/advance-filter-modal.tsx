/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { FC, useCallback, useMemo } from 'react';

import { CustomModal, Divider, ModalFooter, ModalHeader } from '@zextras/carbonio-design-system';
import { useUserSettings } from '@zextras/carbonio-shell-ui';
import { FormProvider, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import { CompanyJobRoleRow } from './parts/company-job-role-row';
import { EmailAddressRow } from './parts/email-address-row';
import { KeywordRow } from './parts/keyword-row';
import { NameRow } from './parts/name-row';
import { PhoneNumberRow } from './parts/phone-number-row';
import { TagFolderRow } from './parts/tag-folder-row';
import { ToggleFilters } from './parts/toggle-filters';
import { AdvancedFilterModalFormValues, Query } from './types';
import { getAdvancedFiltersDefaultValues, getQueryToBe } from './utils';
import { ScrollableContainer } from 'components/styled-components';

export type AdvancedFilterModalProps = {
	open: boolean;
	onClose: () => void;
	// t: TFunction;
	query: Query;
	isSharedFolderIncludedInitialValue: boolean;
	// isSharedFolderIncludedDefault: boolean;
	onSearchConfirm: (request: { query: Query; includeSharedFolders: boolean }) => void;
};

export const AdvancedFilterModal: FC<AdvancedFilterModalProps> = ({
	open,
	onClose,
	query,
	onSearchConfirm,
	isSharedFolderIncludedInitialValue
}): React.JSX.Element => {
	const settings = useUserSettings();
	const [t] = useTranslation();
	const includeSharedItemsInSearchDefaultPref =
		settings.prefs.zimbraPrefIncludeSharedItemsInSearch === 'TRUE';

	const defaultValues: AdvancedFilterModalFormValues = useMemo(
		() => getAdvancedFiltersDefaultValues(query, isSharedFolderIncludedInitialValue),
		[query, isSharedFolderIncludedInitialValue]
	);

	const methods = useForm<AdvancedFilterModalFormValues>({ defaultValues });
	const { watch, setValue, control } = methods;
	const formValues = watch();

	const resetFilters = useCallback(() => {
		setValue('keywordInput', []);
		setValue('firstNameInput', []);
		setValue('lastNameInput', []);
		setValue('emailAddress', []);
		setValue('companyInput', []);
		setValue('jobRoleInput', []);
		setValue('phoneNumberInput', []);
		setValue('folderInput', []);
		setValue('tagInput', []);
		setValue('isSharedFolderIncluded', includeSharedItemsInSearchDefaultPref);
		setValue('tagInput', []);
		setValue('folderInput', []);
	}, [setValue, includeSharedItemsInSearchDefaultPref]);

	const queryToBe = getQueryToBe(formValues);

	const onConfirm = useCallback(() => {
		const controller = new AbortController();
		try {
			onSearchConfirm({ query: queryToBe, includeSharedFolders: watch('isSharedFolderIncluded') });
			onClose();
		} catch (error) {
			controller.abort();
		}
		return () => {
			controller.abort();
		};
	}, [onSearchConfirm, queryToBe, onClose, watch]);

	const onCloseCallback = useCallback(() => {
		resetFilters();
		onClose();
	}, [onClose, resetFilters]);

	const isSharedFolderIncludedInput = watch('isSharedFolderIncluded');
	return (
		<CustomModal
			open={open}
			onClose={onClose}
			maxHeight="90vh"
			size="medium"
			data-testid={'advanced-filter-modal'}
		>
			<ModalHeader
				onClose={onCloseCallback}
				title={t('label.single_advanced_filter', 'Advanced Filters')}
				showCloseIcon
			/>
			<Divider />

			<ScrollableContainer
				padding={{ horizontal: 'medium', vertical: 'small' }}
				mainAlignment={'flex-start'}
			>
				<FormProvider {...methods}>
					<ToggleFilters />
					<KeywordRow control={control} />
					<NameRow control={control} />
					<EmailAddressRow control={control} />
					<CompanyJobRoleRow control={control} />
					<PhoneNumberRow control={control} />
					<TagFolderRow control={control} setValue={setValue} />
				</FormProvider>
			</ScrollableContainer>
			<Divider />
			<ModalFooter
				onConfirm={onConfirm}
				confirmDisabled={queryToBe.length === 0}
				secondaryActionDisabled={
					queryToBe.length === 0 &&
					isSharedFolderIncludedInput === includeSharedItemsInSearchDefaultPref
				}
				confirmLabel={t('action.search', 'Search')}
				secondaryActionLabel={t('action.reset_filters', 'Reset Filters')}
				onSecondaryAction={resetFilters}
			/>
		</CustomModal>
	);

	// const [otherKeywords, setOtherKeywords] = useState<KeywordState>([]);
	// const [firstName, setFirstName] = useState<NameState>([]);
	// const [lastName, setLastName] = useState<NameState>([]);
	// const [companyName, setCompanyName] = useState<CompanyState>([]);
	// const [jobRole, setJobRole] = useState<JobRoleState>([]);
	// const [emailAddress, setEmailAddress] = useState<EmailAddressState>([]);
	// const [phoneNumber, setPhoneNumber] = useState<PhoneNumberState>([]);
	// const [tag, setTag] = useState<KeywordState>([]);
	// const [hasPerformedSearch, setHasPerformedSearch] = useState(false);
	// const tagOptions = useMemo(
	// 	() =>
	// 		map(getTags(), (item) => ({
	// 			...item,
	// 			label: item.name,
	// 			customComponent: (
	// 				<Row takeAvailableSpace mainAlignment="flex-start">
	// 					<Row takeAvailableSpace mainAlignment="space-between">
	// 						<Row mainAlignment="flex-end">
	// 							<Padding right="small">
	// 								<Icon icon="Tag" color={ZIMBRA_STANDARD_COLORS[item.color ?? 0].hex} />
	// 							</Padding>
	// 						</Row>
	// 						<Row takeAvailableSpace mainAlignment="flex-start">
	// 							<Tooltip label={item.name} overflowTooltip>
	// 								<Text>{item.name}</Text>
	// 							</Tooltip>
	// 						</Row>
	// 					</Row>
	// 				</Row>
	// 			)
	// 		})),
	// 	[]
	// );
	// const [isSharedFolderIncludedTobe, setIsSharedFolderIncludedTobe] = useState(
	// 	isSharedFolderIncludedInitialValue
	// );

	// useEffect(() => {
	// 	if (!open) {
	// 		setHasPerformedSearch(false);
	// 	}
	// 	if (!hasPerformedSearch) {
	// 		setIsSharedFolderIncludedTobe(isSharedFolderIncludedInitialValue);
	// 	}
	// }, [open, isSharedFolderIncludedInitialValue, hasPerformedSearch]);

	// useEffect(() => {
	// 	if (!open) return;

	// 	const updatedQuery = map(
	// 		filter(query, (v) => !/^tag:/.test(v.label ?? '') && !v.isQueryFilter),
	// 		(q) => ({ ...q, hasAvatar: false })
	// 	);

	// 	const tagFromQuery = map(
	// 		filter(query, (v) => /^tag:/.test(v.label ?? '')),
	// 		(q) => ({ ...q, hasAvatar: true, icon: 'TagOutline' })
	// 	);

	// 	// const firstNameQuery =
	// 	// 	query.find((v) => /^FirstName:/.test(v.label ?? ''))?.label?.replace('firstName:', '') || '';
	// 	// const lastNameQuery =
	// 	// 	query.find((v) => /^LastName:/.test(v.label ?? ''))?.label?.replace('lastName:', '') || '';

	// 	// setFirstName([firstNameQuery]);
	// 	// setLastName(lastNameQuery);
	// 	setTag(tagFromQuery);
	// 	setOtherKeywords(updatedQuery);
	// }, [query, open]);
	// const queryToBe = useMemo(
	// 	() =>
	// 		// const nameQuery = [];
	// 		// if (firstName) {
	// 		// 	nameQuery.push({ label: `firstName:"${firstName}"`, hasAvatar: false });
	// 		// }
	// 		// if (lastName) {
	// 		// 	nameQuery.push({ label: `lastName:"${lastName}"`, hasAvatar: false });
	// 		// }
	// 		concat(otherKeywords, tag),
	// 	[otherKeywords, tag]
	// );

	// const secondaryDisabled = useMemo(
	// 	() => queryToBe.length === 0 && isSharedFolderIncludedTobe === isSharedFolderIncludedDefault,
	// 	[queryToBe.length, isSharedFolderIncludedTobe, isSharedFolderIncludedDefault]
	// );

	// // Reset all filters to default values
	// const resetFilters = useCallback(() => {
	// 	setIsSharedFolderIncludedTobe(isSharedFolderIncludedDefault);
	// 	setOtherKeywords([]);
	// 	setTag([]);
	// 	setFirstName([]);
	// 	setLastName([]);
	// 	setEmailAddress([]);
	// 	setCompanyName([]);
	// 	setJobRole([]);
	// 	setPhoneNumber([]);
	// 	setHasPerformedSearch(false);
	// }, [isSharedFolderIncludedDefault]);

	// // Handle search confirmation
	// const onConfirm = useCallback(() => {
	// 	setHasPerformedSearch(true);
	// 	onSearchConfirm({ query: queryToBe, includeSharedFolders: isSharedFolderIncludedTobe });
	// 	onClose();
	// }, [queryToBe, onSearchConfirm, isSharedFolderIncludedTobe, onClose]);

	// // Props for child components
	// const nameRowProps = useMemo(
	// 	() => ({
	// 		query,
	// 		firstName,
	// 		lastName,
	// 		setFirstName,
	// 		setLastName
	// 	}),
	// 	[firstName, lastName, query]
	// );

	// const companyNameRowProps = useMemo(
	// 	() => ({
	// 		query,
	// 		companyName,
	// 		setCompanyName
	// 	}),
	// 	[companyName, query]
	// );

	// const jobRoleRowProps = useMemo(
	// 	() => ({
	// 		query,
	// 		jobRole,
	// 		setJobRole
	// 	}),
	// 	[jobRole, query]
	// );

	// const emailAddressRowProps = useMemo(
	// 	() => ({
	// 		query,
	// 		emailAddress,
	// 		setEmailAddress
	// 	}),
	// 	[emailAddress, query]
	// );

	// const phoneNumberRowProps = useMemo(
	// 	() => ({
	// 		query,
	// 		phoneNumber,
	// 		setPhoneNumber
	// 	}),
	// 	[phoneNumber, query]
	// );

	// const keywordRowProps = useMemo(
	// 	() => ({
	// 		otherKeywords,
	// 		setOtherKeywords,
	// 		query
	// 	}),
	// 	[otherKeywords, query]
	// );

	// const tagRowProps = useMemo(
	// 	() => ({
	// 		tagOptions,
	// 		tag,
	// 		setTag
	// 	}),
	// 	[tagOptions, tag]
	// );

	// const toggleFiltersProps = useMemo(
	// 	() => ({
	// 		query,
	// 		setIsSharedFolderIncludedTobe,
	// 		isSharedFolderIncludedTobe
	// 	}),
	// 	[query, isSharedFolderIncludedTobe]
	// );

	// return (
	// 	<CustomModal
	// 		open={open}
	// 		onClose={onClose}
	// 		maxHeight="90vh"
	// 		size="medium"
	// 		data-testid={'advanced-filter-modal'}
	// 	>
	// 		<ModalHeader
	// 			onClose={onClose}
	// 			title={t('title.advanced_filters', 'Advanced Filters')}
	// 			showCloseIcon
	// 		/>
	// 		<Divider />
	// 		<Container
	// 			padding={{ horizontal: 'medium', vertical: 'small' }}
	// 			mainAlignment={'flex-start'}
	// 			style={{ overflowY: 'auto', height: 'fit-content' }}
	// 		>
	// 			<ToggleFilters compProps={toggleFiltersProps} />
	// 			<KeywordRow compProps={keywordRowProps} />
	// 			<NameRow compProps={nameRowProps} />
	// 			<CompanyNameRow compProps={companyNameRowProps} />
	// 			<JobRoleRow compProps={jobRoleRowProps} />
	// 			<EmailAddressRow compProps={emailAddressRowProps} />
	// 			<PhoneNumberRow compProps={phoneNumberRowProps} />
	// 			<TagRow compProps={tagRowProps} />
	// 		</Container>
	// 		<Divider />
	// 		<ModalFooter
	// 			confirmLabel={t('action.search', 'Search')}
	// 			confirmDisabled={queryToBe.length === 0}
	// 			onConfirm={onConfirm}
	// 			onSecondaryAction={resetFilters}
	// 			secondaryActionDisabled={secondaryDisabled}
	// 			secondaryActionLabel={t('action.reset_filters', 'Reset Filters')}
	// 		></ModalFooter>
	// 	</CustomModal>
	// );
};

// export default AdvancedFilterModal;
