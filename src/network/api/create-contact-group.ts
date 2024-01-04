/*
 * SPDX-FileCopyrightText: 2023 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
export const createContactGroup = (title: string, members: Array<string>): Promise<unknown> =>
	fetch(`/service/soap/CreateContactRequest`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json'
		},
		body: JSON.stringify({
			Body: {
				CreateContactRequest: {
					_jsns: 'urn:zimbraMail',
					cn: {
						a: [
							{ n: 'fullName', _content: title },
							{ n: 'nickname', _content: title },
							{ n: 'type', _content: 'group' },
							{ n: 'fileAs', _content: `8:${title}` }
						],
						m: members.map((member) => ({ type: 'I', value: member }))
					}
				}
			},
			Header: {
				context: {
					_jsns: 'urn:zimbra'
				}
			}
		})
	}).then((response) => {
		if (response.ok) {
			return response.json();
		}
		throw new Error('Something went wrong');
	});
