/*
 * SPDX-FileCopyrightText: 2023 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { FC, useCallback, useEffect, useMemo, useRef, useState } from 'react';

import {
	Divider,
	ModalBody,
	ModalFooter,
	ModalHeader,
	useSnackbar
} from '@zextras/carbonio-design-system';
import { difference, xor } from 'lodash';
import { useTranslation } from 'react-i18next';

import { EditDLComponent } from './edit-dl';
import { distributionListAction } from '../api/distribution-list-action';
import { getDistributionListMembers } from '../api/get-distribution-list-members';

export type EditDLControllerComponentProps = {
	email: string;
	displayName: string;
	onClose: () => void;
	onSave: () => void;
};

export const getMembersPartition = (
	originalMembers: Array<string>,
	updatedMembers: Array<string>
): { membersToAdd: Array<string>; membersToRemove: Array<string> } => ({
	membersToAdd: difference(updatedMembers, originalMembers),
	membersToRemove: difference(originalMembers, updatedMembers)
});

export const EditDLControllerComponent: FC<EditDLControllerComponentProps> = ({
	email,
	displayName,
	onClose,
	onSave
}) => {
	const [members, setMembers] = useState<string[]>([]);
	const originalMembersRef = useRef<string[]>([]);
	const [totalMembers, setTotalMembers] = useState<number>(0);
	const [t] = useTranslation();
	const createSnackbar = useSnackbar();

	useEffect(() => {
		getDistributionListMembers(email)
			.then((response) => {
				const memberList = response.dlm.map(({ _content }) => _content);
				setMembers(() => {
					originalMembersRef.current = memberList;
					return memberList;
				});
				setTotalMembers(response.total);
			})
			.catch((error: Error) => {
				createSnackbar({
					key: `dl-members-load-error-${email}`,
					type: 'error',
					label: t('label.error_try_again', 'Something went wrong, please try again'),
					hideButton: true
				});
				console.error(error);
				onClose();
			});
	}, [createSnackbar, email, onClose, t]);

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
		distributionListAction(email, membersToAdd, membersToRemove)
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
				onSave();
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
	}, [createSnackbar, displayName, email, members, onSave, t]);

	const isDirty = useMemo(() => xor(members, originalMembersRef.current).length > 0, [members]);

	return (
		<>
			<ModalHeader
				title={t('modal.edit_distribution_list.title', 'Edit "{{displayName}}"', { displayName })}
				showCloseIcon
				closeIconTooltip={t('modal.close.tooltip', 'Close')}
				onClose={onClose}
			/>
			<Divider />
			<ModalBody>
				<EditDLComponent
					email={email}
					members={members}
					totalMembers={totalMembers}
					onRemoveMember={onRemoveMember}
					onAddMembers={onAddMembers}
				/>
			</ModalBody>
			<Divider />
			<ModalFooter
				confirmLabel={t('label.save', 'save')}
				onConfirm={onConfirm}
				confirmDisabled={!isDirty}
				dismissLabel={t('label.cancel', 'cancel')}
				onClose={onClose}
			/>
		</>
	);
};
