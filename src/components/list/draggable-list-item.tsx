/*
 * SPDX-FileCopyrightText: 2025 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React, { SyntheticEvent } from 'react';

import { Drag } from '@zextras/carbonio-design-system';

type DraggableListItemProps = React.PropsWithChildren & {
	item: { id: string };
	data: Record<string, unknown>;
	dragCheck: (e: SyntheticEvent, itemId: string) => void;
};
export const DraggableListItem = ({
	children,
	item,
	data,
	dragCheck
}: DraggableListItemProps): React.JSX.Element => (
	<Drag
		type="contact"
		data={data}
		style={{ display: 'block' }}
		onDragStart={(e): void => dragCheck(e, item.id)}
	>
		{children}
	</Drag>
);
