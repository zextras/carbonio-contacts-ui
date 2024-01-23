/*
 * SPDX-FileCopyrightText: 2023 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import {
	Button,
	Container,
	Divider,
	TabBar,
	TabBarProps,
	useSnackbar
} from '@zextras/carbonio-design-system';
import { difference, isEqual, xor } from 'lodash';
import { useTranslation } from 'react-i18next';

import { DLDetailsInfo } from './dl-details-info';
import { EditDLDetails, EditDLDetailsProps } from './edit-dl-details';
import { EditDLMembersComponent } from './edit-dl-members';
import { ManagerList } from './manager-list';
import { ScrollableContainer } from './styled-components';
import { DL_TABS } from '../constants';
import { DistributionList } from '../model/distribution-list';
import { client } from '../network/client';

export type EditDLControllerComponentProps = Pick<
	DistributionList,
	'email' | 'displayName' | 'owners' | 'members' | 'description'
>;

type DLDetails = Pick<DistributionList, 'displayName' | 'description'>;

export const getMembersPartition = (
	originalMembers: Array<string>,
	updatedMembers: Array<string>
): { membersToAdd: Array<string>; membersToRemove: Array<string> } => ({
	membersToAdd: difference(updatedMembers, originalMembers),
	membersToRemove: difference(originalMembers, updatedMembers)
});

export const EditDLControllerComponent = ({
	email,
	displayName = '',
	members: membersPage,
	owners: ownersProp,
	description = ''
}: EditDLControllerComponentProps): React.JSX.Element => {
	const [members, setMembers] = useState<string[]>(membersPage?.members ?? []);
	const [loadingMembers, setLoadingMembers] = useState(membersPage === undefined);
	const originalMembersRef = useRef<string[]>(membersPage?.members ?? []);
	const [details, setDetails] = useState<DLDetails>({
		displayName,
		description
	});
	const originalDetailsRef = useRef<DLDetails>({
		displayName,
		description
	});
	const [totalMembers, setTotalMembers] = useState<number>(membersPage?.total ?? 0);
	const [selectedTab, setSelectedTab] = useState<string>(DL_TABS.details);
	const [owners, setOwners] = useState<DistributionList['owners']>(ownersProp);
	const [loadingOwners, setLoadingOwners] = useState(ownersProp === undefined);

	const [t] = useTranslation();
	const createSnackbar = useSnackbar();

	useEffect(() => {
		if (membersPage === undefined) {
			client
				.getDistributionListMembers(email)
				.then((response) => {
					setMembers(() => {
						originalMembersRef.current = response.members;
						return response.members;
					});
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
		if (selectedTab === DL_TABS.managers && ownersProp === undefined) {
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
	}, [createSnackbar, email, ownersProp, selectedTab, t]);

	const onAddMembers = useCallback((newMembers: string[]) => {
		setMembers((prevState) => [...newMembers, ...prevState]);
		setTotalMembers((prevState) => prevState + newMembers.length);
	}, []);

	const onRemoveMember = useCallback((member: string) => {
		setMembers((prevState) => prevState.filter((item) => item !== member));
		setTotalMembers((prevState) => prevState - 1);
	}, []);

	const onConfirm = useCallback(() => {
		const { membersToAdd, membersToRemove } = getMembersPartition(
			originalMembersRef.current,
			members
		);
		client
			.distributionListAction(email, membersToAdd, membersToRemove)
			.then(() => {
				createSnackbar({
					key: `dl-save-success-${email}`,
					type: 'success',
					label: t(
						'snackbar.edit_distribution_list.save.success',
						'"{{displayName}}" distribution list edits saved successfully',
						{ displayName }
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
	}, [createSnackbar, displayName, email, members, t]);

	const isDirty = useMemo(
		() =>
			xor(members, originalMembersRef.current).length > 0 ||
			!isEqual(details, originalDetailsRef.current),
		[details, members]
	);

	const tabItems = useMemo(
		(): TabBarProps['items'] => [
			{ id: DL_TABS.details, label: t('distribution_list.tabs.details', 'Details') },
			{ id: DL_TABS.members, label: t('distribution_list.tabs.members', 'Member list') },
			{ id: DL_TABS.managers, label: t('distribution_list.tabs.managers', 'Manager list') }
		],
		[t]
	);

	const onTabChange = useCallback<TabBarProps['onChange']>((ev, selectedId) => {
		setSelectedTab(selectedId);
	}, []);

	const onDetailsChange = useCallback<EditDLDetailsProps['onChange']>((newData) => {
		setDetails((prevState) => ({ ...prevState, ...newData }));
	}, []);

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
				<Button label={t('label.save', 'save')} disabled={!isDirty} onClick={onConfirm} />
			</Container>
			<DLDetailsInfo displayName={displayName} email={email} padding={{ bottom: 'large' }} />
			<Divider />
			<ScrollableContainer
				padding={{ top: 'large', bottom: 'extralarge', left: 'large', right: 'large' }}
				mainAlignment={'flex-start'}
				crossAlignment={'flex-start'}
				background={'gray6'}
				height={'100%'}
				flexGrow={1}
			>
				<TabBar
					items={tabItems}
					selected={selectedTab}
					onChange={onTabChange}
					background={'gray6'}
					flexShrink={0}
					height={'3rem'}
					maxWidth={'32rem'}
					borderColor={{ bottom: 'gray3' }}
				/>
				{selectedTab === DL_TABS.details && (
					<EditDLDetails name={displayName} description={description} onChange={onDetailsChange} />
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
					<Container padding={{ top: 'large' }} height={'auto'}>
						<ManagerList managers={owners} loading={loadingOwners} />
					</Container>
				)}
			</ScrollableContainer>
		</Container>
	);
};
