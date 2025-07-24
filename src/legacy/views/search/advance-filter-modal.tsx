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
	query: Query;
	isSharedFolderIncludedInitialValue: boolean;
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
};
