/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { useCallback, useMemo } from 'react';

import { Container, Text } from '@zextras/carbonio-design-system';
import { useTranslation } from 'react-i18next';

export const ContactsImportModal = ({
	closeCallback,
	confirmCallback,
	fileName,
	folderName
}: {
	closeCallback: () => void;
	confirmCallback: () => void;
	fileName: string;
	folderName: string;
}): React.JSX.Element => {
	const [t] = useTranslation();
	const title = useMemo(() => t('import_contacts.modal.title', 'Import contacts'), [t]);

	const confirmLabel = useMemo(() => t('import_contacts.modal.confirm', 'Import'), [t]);

	const onClose = useCallback(() => {
		closeCallback();
	}, [closeCallback]);

	const onConfirm = useCallback(() => {
		confirmCallback();
		closeCallback();
	}, [closeCallback, confirmCallback]);

	return (
		<Container
			padding={{ all: 'large' }}
			mainAlignment="center"
			crossAlignment="flex-start"
			height="fit"
		>
			<ModalHeader title={title} onClose={onClose} />
			<Container height="fit" padding={{ vertical: 'large' }}>
				<Text overflow="break-word" size="medium">
					{t('import_contacts.modal.description', {
						fileName,
						folderName,
						defaultValue: `The contacts contained within the specified {{fileName}} file will be imported into "{{folderName}}" folder`
					})}
				</Text>
			</Container>
			<ModalFooter
				label={confirmLabel}
				onConfirm={onConfirm}
				secondaryLabel={t('folder.modal.footer.go_back', 'Go back')}
			/>
		</Container>
	);
};
