/*
 * SPDX-FileCopyrightText: 2023 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

const defaultResponse = {
	dlm: [{ _content: 'user1@mail.com' }],
	total: '1',
	more: false
};

export const getDistributionListCustomResponse = ({
	dlm,
	total,
	more
}: {
	dlm?: Array<{ _content: string }>;
	total?: number;
	more?: boolean;
}): any => ({
	Header: {
		context: {
			session: {
				id: 1403,
				_content: 1403
			}
		}
	},
	Body: {
		GetDistributionListMembersResponse: {
			dlm: dlm ?? defaultResponse.dlm,
			total: total ?? defaultResponse.total,
			more: more ?? defaultResponse.more
		}
	}
});

const getResponse = (): any => ({
	Header: {
		context: {
			session: {
				id: 1403,
				_content: 1403
			}
		}
	},
	Body: {
		GetDistributionListMembersResponse: defaultResponse
	}
});

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types,@typescript-eslint/explicit-function-return-type
export const handleGetDistributionListMembersRequest = (req, res, ctx) => {
	const response = getResponse();
	return res(ctx.json(response));
};
