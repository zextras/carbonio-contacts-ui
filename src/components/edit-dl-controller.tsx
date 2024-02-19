/*
 * SPDX-FileCopyrightText: 2023 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { Button, Container, Divider, TabBar } from '@zextras/carbonio-design-system';
import { useBoardHooks } from '@zextras/carbonio-shell-ui';
import { pickBy, some, xor } from 'lodash';
import { useTranslation } from 'react-i18next';

import { DLDetailsInfo } from './dl-details-info';
import { EditDLDetails, EditDLDetailsProps } from './edit-dl-details';
import { EditDLMembersComponent, ResetMembers } from './edit-dl-members';
import { ManagerList } from './manager-list';
import { ScrollableContainer } from './styled-components';
import { DL_NAME_MAX_LENGTH, DL_TABS } from '../constants';
import { useDLTabs } from '../hooks/use-dl-tabs';
import { useUpdateDistributionList } from '../hooks/use-update-distribution-list';
import { DistributionList } from '../model/distribution-list';

export type EditDLControllerComponentProps = {
	email: DistributionList['email'];
	displayName: DistributionList['displayName'];
	description: DistributionList['description'];
	members: DistributionList['members'];
	loadingMembers: boolean;
	owners: DistributionList['owners'];
	loadingOwners: boolean;
};

type DLDetails = Required<Pick<DistributionList, 'displayName' | 'description'>>;

export const EditDLControllerComponent = ({
	email,
	displayName,
	description,
	members: membersPage,
	loadingMembers,
	owners,
	loadingOwners
}: EditDLControllerComponentProps): React.JSX.Element => {
	const [t] = useTranslation();
	const { items: tabItems, onChange: onTabChange, selected: selectedTab } = useDLTabs();
	const [details, setDetails] = useState<DLDetails>({
		displayName: displayName ?? '',
		description: description ?? ''
	});

	const [members, setMembers] = useState<string[]>(membersPage?.members ?? []);
	const [totalMembers, setTotalMembers] = useState<number>(membersPage?.total ?? 0);

	const [initialDistributionList, setInitialDistributionList] = useState<{
		members: string[];
		totalMembers: number;
		displayName: string;
		description: string;
	}>({
		members: membersPage?.members ?? [],
		totalMembers: membersPage?.total ?? 0,
		displayName: displayName ?? '',
		description: description ?? ''
	});

	useEffect(() => {
		if (!loadingMembers) {
			setMembers(membersPage?.members ?? []);
		}
	}, [loadingMembers, membersPage?.members]);

	const updateDistributionList = useUpdateDistributionList({
		email,
		members: membersPage,
		displayName,
		description
	});
	const { updateBoard } = useBoardHooks();

	const onAddMembers = useCallback((newMembers: string[]) => {
		setMembers((prevState) => [...newMembers, ...prevState]);
		setTotalMembers((prevState) => prevState + newMembers.length);
	}, []);

	const onRemoveMember = useCallback((member: string) => {
		setMembers((prevState) => prevState.filter((item) => item !== member));
		setTotalMembers((prevState) => prevState - 1);
	}, []);

	const onSave = useCallback(() => {
		const detailDifference = pickBy(
			details,
			(value, key) => initialDistributionList[key as keyof DLDetails] !== value
		);
		updateDistributionList({
			email,
			members: { members, total: totalMembers },
			...detailDifference
		}).then(() => {
			setInitialDistributionList({
				members,
				totalMembers,
				...details
			});
		});
	}, [details, email, initialDistributionList, members, totalMembers, updateDistributionList]);

	const isDirty = useMemo(
		() =>
			xor(members, initialDistributionList.members).length > 0 ||
			some(details, (value, key) => initialDistributionList[key as keyof DLDetails] !== value),
		[details, initialDistributionList, members]
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

	const resetMembersRef = useRef<ResetMembers>(null);

	const onDiscard = useCallback(() => {
		setMembers(initialDistributionList.members);
		setTotalMembers(initialDistributionList.totalMembers);
		setDetails({
			description: initialDistributionList.description,
			displayName: initialDistributionList.displayName
		});
		updateBoard({ title: initialDistributionList.displayName });
		resetMembersRef.current?.reset();
	}, [initialDistributionList, updateBoard]);

	return (
		<Container
			orientation={'vertical'}
			padding={{ horizontal: 'large' }}
			mainAlignment={'flex-start'}
			crossAlignment={'flex-start'}
			height={'100%'}
			background={'gray5'}
			data-testid={'edit-dl-component'}
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
							resetRef={resetMembersRef}
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
