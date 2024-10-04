/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { useCallback } from 'react';

import { useSnackbar } from '@zextras/carbonio-design-system';
import { difference } from 'lodash';
import { useTranslation } from 'react-i18next';

import { DistributionList } from '../model/distribution-list';
import { apiClient } from '../network/api-client';
import { useDistributionListsStore } from '../store/distribution-lists';

type DistributionListActionFn = (data: {
	email: string;
	members?: {
		members: string[];
		total: number;
	};
	displayName?: string;
	description?: string;
}) => Promise<void>;

export const getMembersPartition = (
	originalMembers: Array<string>,
	updatedMembers: Array<string>
): { membersToAdd: Array<string>; membersToRemove: Array<string> } => ({
	membersToAdd: difference(updatedMembers, originalMembers),
	membersToRemove: difference(originalMembers, updatedMembers)
});

export const useUpdateDistributionList = (
	initialDistributionList: Pick<
		DistributionList,
		'email' | 'displayName' | 'description' | 'members'
	>
): DistributionListActionFn => {
	const [t] = useTranslation();
	const { upsertDistributionList } = useDistributionListsStore();
	const createSnackbar = useSnackbar();

	return useCallback<DistributionListActionFn>(
		({ email, members, displayName, description }) => {
			const { membersToAdd, membersToRemove } = getMembersPartition(
				initialDistributionList.members?.members ?? [],
				members?.members ?? []
			);
			return apiClient
				.distributionListAction({ email, membersToAdd, membersToRemove, displayName, description })
				.then(() => {
					upsertDistributionList({
						email,
						displayName: displayName ?? initialDistributionList.displayName,
						description: description ?? initialDistributionList.description,
						members: members
							? {
									members: members.members,
									total: members.total,
									more: initialDistributionList.members?.more ?? false
								}
							: initialDistributionList.members,
						canRequireMembers: true
					});
					createSnackbar({
						key: `dl-save-success-${email}`,
						type: 'success',
						label: t(
							'snackbar.edit_distribution_list.save.success',
							'"{{displayName}}" distribution list edits saved successfully',
							{
								displayName:
									(displayName !== undefined &&
										displayName.length > 50 &&
										`${displayName.substring(0, 50)}...`) ||
									displayName ||
									email
							}
						),
						hideButton: true
					});
				})
				.catch((error) => {
					createSnackbar({
						key: `dl-save-error-${email}`,
						severity: 'error',
						label: t('label.error_try_again', 'Something went wrong, please try again'),
						hideButton: true
					});
					console.error(error);
				});
		},
		[
			createSnackbar,
			initialDistributionList.description,
			initialDistributionList.displayName,
			initialDistributionList.members,
			t,
			upsertDistributionList
		]
	);
};
