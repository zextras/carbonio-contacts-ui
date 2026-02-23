/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React from 'react';

import { Divider, Text, Row, Padding, Button } from '@zextras/carbonio-design-system';

export const ModalHeader = ({ title, onClose }) => (
	<Row orientation="horizontal" mainAlignment="space-between" takeAvailableSpace width="100%">
		<Text weight="bold" size="large">
			{title}
		</Text>
		<Button size="large" type={'ghost'} onClick={onClose} icon="CloseOutline" />
		<Divider />
		<Padding bottom="medium" />
	</Row>
);
