/*
 * SPDX-FileCopyrightText: 2023 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { useCallback, useEffect, useMemo, useState } from 'react';

import { Button, Container, Divider, TabBar, useSnackbar } from '@zextras/carbonio-design-system';
import { useBoardHooks } from '@zextras/carbonio-shell-ui';
import { difference, isEqual, pickBy, xor } from 'lodash';
import { useTranslation } from 'react-i18next';

import { DLDetailsInfo } from './dl-details-info';
import { EditDLDetails, EditDLDetailsProps } from './edit-dl-details';
import { EditDLMembersComponent } from './edit-dl-members';
import { ManagerList } from './manager-list';
import { ScrollableContainer } from './styled-components';
import { DL_NAME_MAX_LENGTH, DL_TABS } from '../constants';
import { useDLTabs } from '../hooks/use-dl-tabs';
import { DistributionList } from '../model/distribution-list';
import { client } from '../network/client';

export type EditDLControllerComponentProps = {
	distributionList: DistributionList;
};

type DLDetails = Required<Pick<DistributionList, 'displayName' | 'description'>>;

export const getMembersPartition = (
	originalMembers: Array<string>,
	updatedMembers: Array<string>
): { membersToAdd: Array<string>; membersToRemove: Array<string> } => ({
	membersToAdd: difference(updatedMembers, originalMembers),
	membersToRemove: difference(originalMembers, updatedMembers)
});

export const EditDLControllerComponent = ({
	distributionList
}: EditDLControllerComponentProps): React.JSX.Element => {
	const { email, displayName, description, members: membersPage } = distributionList;
	const [members, setMembers] = useState<string[]>(membersPage?.members ?? []);
	const [loadingMembers, setLoadingMembers] = useState(membersPage === undefined);
	const [originalMembers, setOriginalMembers] = useState<string[]>(membersPage?.members ?? []);
	const [details, setDetails] = useState<DLDetails>({
		displayName: displayName ?? '',
		description: description ?? ''
	});
	const [originalDetails, setOriginalDetails] = useState<DLDetails>({
		displayName: displayName ?? '',
		description: description ?? ''
	});
	const { items: tabItems, onChange: onTabChange, selected: selectedTab } = useDLTabs();
	const [totalMembers, setTotalMembers] = useState<number>(membersPage?.total ?? 0);
	const [owners, setOwners] = useState<DistributionList['owners']>(distributionList.owners);
	const [loadingOwners, setLoadingOwners] = useState(distributionList.owners === undefined);

	const [t] = useTranslation();
	const createSnackbar = useSnackbar();
	const { updateBoard } = useBoardHooks();

	useEffect(() => {
		if (membersPage === undefined) {
			client
				.getDistributionListMembers(email)
				.then((response) => {
					setOriginalMembers(response.members);
					setMembers(response.members);
					setTotalMembers(response.total ?? 0);
				})
				.catch((error: Error) => {
					createSnackbar({
						key: `dl-members-load-error-${email}`,
						type: 'error',
						label: t('label.error_try_again', 'Something went wrong, please try again'),
						hideButton: true
					});
					console.error(error);
				})
				.finally(() => {
					setLoadingMembers(false);
				});
		}
	}, [createSnackbar, email, membersPage, t]);

	useEffect(() => {
		if (selectedTab === DL_TABS.managers && owners === undefined) {
			client
				.getDistributionList({ email })
				.then((data) => {
					setOwners(data?.owners);
				})
				.catch((error: Error) => {
					createSnackbar({
						key: `dl-managers-load-error-${email}`,
						type: 'error',
						label: t('label.error_try_again', 'Something went wrong, please try again'),
						hideButton: true
					});
					console.error(error);
				})
				.finally(() => {
					setLoadingOwners(false);
				});
		}
	}, [createSnackbar, email, owners, selectedTab, t]);

	const onAddMembers = useCallback((newMembers: string[]) => {
		setMembers((prevState) => [...newMembers, ...prevState]);
		setTotalMembers((prevState) => prevState + newMembers.length);
	}, []);

	const onRemoveMember = useCallback((member: string) => {
		setMembers((prevState) => prevState.filter((item) => item !== member));
		setTotalMembers((prevState) => prevState - 1);
	}, []);

	const onSave = useCallback(() => {
		const { membersToAdd, membersToRemove } = getMembersPartition(originalMembers, members);
		const detailDifference = pickBy(
			details,
			(value, key) => originalDetails[key as keyof DLDetails] !== value
		);
		client
			.distributionListAction({ email, membersToAdd, membersToRemove, ...detailDifference })
			.then(() => {
				setOriginalMembers(members);
				setOriginalDetails(details);
				createSnackbar({
					key: `dl-save-success-${email}`,
					type: 'success',
					label: t(
						'snackbar.edit_distribution_list.save.success',
						'"{{displayName}}" distribution list edits saved successfully',
						{
							displayName:
								(details.displayName.length > 50 && `${details.displayName.substring(0, 50)}...`) ||
								details.displayName ||
								email
						}
					),
					hideButton: true
				});
			})
			.catch((error) => {
				createSnackbar({
					key: `dl-save-error-${email}`,
					type: 'error',
					label: t('label.error_try_again', 'Something went wrong, please try again'),
					hideButton: true
				});
				console.error(error);
			});
	}, [createSnackbar, details, email, members, originalDetails, originalMembers, t]);

	const isDirty = useMemo(
		() => xor(members, originalMembers).length > 0 || !isEqual(details, originalDetails),
		[details, members, originalDetails, originalMembers]
	);

	const onDetailsChange = useCallback<EditDLDetailsProps['onChange']>(
		(newData) => {
			newData.displayName !== undefined && updateBoard({ title: newData.displayName });
			setDetails((prevState) => ({ ...prevState, ...newData }));
		},
		[updateBoard]
	);

	const nameError = useMemo(() => {
		if (details.displayName.length > DL_NAME_MAX_LENGTH) {
			return t(
				'edit_dl_component.input.name.error.max_length',
				'Maximum length allowed is 256 characters'
			);
		}
		return undefined;
	}, [t, details.displayName]);

	const hasErrors = useMemo(() => nameError !== undefined, [nameError]);

	const onDiscard = useCallback(() => {
		setMembers(originalMembers);
		setDetails(originalDetails);
		updateBoard({ title: originalDetails.displayName });
	}, [originalDetails, originalMembers, updateBoard]);

	return (
		<Container
			orientation={'vertical'}
			padding={{ horizontal: 'large' }}
			mainAlignment={'flex-start'}
			crossAlignment={'flex-start'}
			height={'100%'}
			background={'gray5'}
		>
			<Container
				orientation={'horizontal'}
				padding={{ vertical: 'small' }}
				mainAlignment={'flex-end'}
				gap={'0.5rem'}
				height={'auto'}
			>
				<Button label={t('label.discard', 'Discard')} type={'outlined'} onClick={onDiscard} />
				<Button label={t('label.save', 'Save')} disabled={!isDirty || hasErrors} onClick={onSave} />
			</Container>
			<DLDetailsInfo
				displayName={details.displayName}
				email={email}
				padding={{ bottom: 'large' }}
			/>
			<Divider />
			<ScrollableContainer
				padding={{ top: 'large', bottom: 'extralarge', left: 'large', right: 'large' }}
				mainAlignment={'flex-start'}
				crossAlignment={'flex-start'}
				background={'gray6'}
				flexGrow={1}
			>
				<TabBar
					items={tabItems}
					selected={selectedTab}
					onChange={onTabChange}
					background={'gray6'}
					flexShrink={0}
					height={'3rem'}
					maxWidth={'50vw'}
					borderColor={{ bottom: 'gray3' }}
				/>
				<ScrollableContainer padding={{ top: 'large' }} mainAlignment={'flex-start'}>
					{selectedTab === DL_TABS.details && (
						<EditDLDetails
							name={details.displayName}
							nameError={nameError}
							description={details.description}
							onChange={onDetailsChange}
						/>
					)}
					{selectedTab === DL_TABS.members && (
						<EditDLMembersComponent
							members={members}
							totalMembers={totalMembers}
							onRemoveMember={onRemoveMember}
							onAddMembers={onAddMembers}
							loading={loadingMembers}
						/>
					)}
					{selectedTab === DL_TABS.managers && (
						<ManagerList managers={owners} loading={loadingOwners} />
					)}
				</ScrollableContainer>
			</ScrollableContainer>
		</Container>
	);
};
