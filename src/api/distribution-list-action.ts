/*
 * SPDX-FileCopyrightText: 2023 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { SoapFault, soapFetch } from '@zextras/carbonio-shell-ui';

import { GenericSoapPayload } from './types';
import { NAMESPACES } from '../constants/api';

export type DistributionListActionOperation = 'addMembers' | 'removeMembers';

export interface DistributionListActionRequest
	extends GenericSoapPayload<typeof NAMESPACES.account> {
	dl: {
		by: 'name';
		_content: string;
	};
	action: {
		op: DistributionListActionOperation;
		dlm: Array<{
			_content: string;
		}>;
	};
}

export type DistributionListActionResponse = GenericSoapPayload<typeof NAMESPACES.account>;

export interface BatchDistributionListActionRequest
	extends GenericSoapPayload<typeof NAMESPACES.generic> {
	DistributionListActionRequest: Array<DistributionListActionRequest>;
}

export interface BatchDistributionListActionResponse
	extends GenericSoapPayload<typeof NAMESPACES.generic> {
	DistributionListActionResponse: Array<DistributionListActionResponse>;
	Fault?: Array<SoapFault>;
}

export interface BatchDistributionListActionResponse
	extends GenericSoapPayload<typeof NAMESPACES.generic> {
	DistributionListActionResponse: Array<DistributionListActionResponse>;
}

export const distributionListAction = (
	email: string,
	membersToAdd: Array<string>,
	membersToRemove: Array<string>
): Promise<void> => {
	if (!membersToAdd.length && !membersToRemove.length) {
		return Promise.resolve();
	}

	const actionRequests: Array<DistributionListActionRequest> = [];

	if (membersToAdd.length > 0) {
		actionRequests.push({
			dl: {
				by: 'name',
				_content: email
			},
			action: {
				op: 'addMembers',
				dlm: membersToAdd.map((member) => ({ _content: member }))
			},
			_jsns: NAMESPACES.account
		});
	}

	if (membersToRemove.length > 0) {
		actionRequests.push({
			dl: {
				by: 'name',
				_content: email
			},
			action: {
				op: 'removeMembers',
				dlm: membersToRemove.map((member) => ({ _content: member }))
			},
			_jsns: NAMESPACES.account
		});
	}

	return soapFetch<BatchDistributionListActionRequest, BatchDistributionListActionResponse>(
		'Batch',
		{
			DistributionListActionRequest: actionRequests,
			_jsns: NAMESPACES.generic
		}
	).then((response) => {
		if ('Fault' in response) {
			// TODO create a specific BatchSoapError
			throw new Error('Batch error', { cause: response.Fault });
		}
	});
};

/*
 "Body": {
        "BatchRequest": {
             "_jsns": "urn:zimbra",
            "DistributionListActionRequest": [
                {
                    "_jsns": "urn:zimbraAccount",
                    "dl": {
                        "by": "name",
                        "_content": "italy-sub-dl@demo.zextras.io"
                    },
                    "action": {
                        "op": "addMembers",
                        "dlm": [{
                            "by": "name",
                            "type": "usr",
                            "_content": "beatrice@demo.zextras.io"
                        }]
                    }
                },
                {
                    "_jsns": "urn:zimbraAccount",
                    "dl": {
                        "by": "name",
                        "_content": "italy-sub-dl@demo.zextras.io"
                    },
                    "action": {
                        "op": "removeMembers",
                        "dlm": [{
                            "by": "name",
                            "type": "usr",
                            "_content": "eugenia.muffolini@demo.zextras.io"
                        }]
                    }
                }
            ]
        }
    },
 */

/*
"Body": {
        "BatchResponse": {
            "DistributionListActionResponse": [
                {
                    "_jsns": "urn:zimbraAccount"
                },
                {
                    "_jsns": "urn:zimbraAccount"
                }
            ],
            "_jsns": "urn:zimbra"
        }
    },
 */
/*
 "Fault": {
            "Code": {
                "Value": "soap:Sender"
            },
            "Reason": {
                "Text": "non-existent members: beatrice@demo.zextras.io in distribution list: italy-sub-dl@demo.zextras.io"
            },
            "Detail": {
                "Error": {
                    "Code": "account.NO_SUCH_MEMBER",
                    "Trace": "qtp832432849-90455:1702396365300:0a9471bdbc660070",
                    "_jsns": "urn:zimbra"
                }
            }
        }
 */

/*
{
    "Header": {
        "context": {
            "change": {
                "token": 107
            },
            "_jsns": "urn:zimbra"
        }
    },
    "Body": {
        "BatchResponse": {
            "Fault": [
                {
                    "Code": {
                        "Value": "soap:Sender"
                    },
                    "Reason": {
                        "Text": "non-existent members: beatrice@demo.zextras.io in distribution list: italy-sub-dl@demo.zextras.io"
                    },
                    "Detail": {
                        "Error": {
                            "Code": "account.NO_SUCH_MEMBER",
                            "Trace": "qtp832432849-90231:1702397023318:0a9471bdbc660070",
                            "_jsns": "urn:zimbra"
                        }
                    },
                    "_jsns": "urn:zimbraSoap"
                },
                {
                    "Code": {
                        "Value": "soap:Sender"
                    },
                    "Reason": {
                        "Text": "non-existent members: eugenia.muffolini@demo.zextras.io in distribution list: italy-sub-dl@demo.zextras.io"
                    },
                    "Detail": {
                        "Error": {
                            "Code": "account.NO_SUCH_MEMBER",
                            "Trace": "qtp832432849-90231:1702397023321:0a9471bdbc660070",
                            "_jsns": "urn:zimbra"
                        }
                    },
                    "_jsns": "urn:zimbraSoap"
                }
            ],
            "_jsns": "urn:zimbra"
        }
    },
    "_jsns": "urn:zimbraSoap"
}
 */

/*
"Fault": [
                {
                    "Code": {
                        "Value": "soap:Sender"
                    },
                    "Reason": {
                        "Text": "non-existent members: beatrice@demo.zextras.io,eugenia.muffolini@demo.zextras.io in distribution list: italy-sub-dl@demo.zextras.io"
                    },
                    "Detail": {
                        "Error": {
                            "Code": "account.NO_SUCH_MEMBER",
                            "Trace": "qtp832432849-90530:1702397292455:0a9471bdbc660070",
                            "_jsns": "urn:zimbra"
                        }
                    },
                    "_jsns": "urn:zimbraSoap"
                }
            ],
 */

/*
* 		await soapFetch('Batch', {
				FolderActionRequest: [
					{
						action: {
							id: folder.id,
							op,
							l,
							recursive,
							name,
							color
						},
						_jsns: 'urn:zimbraMail'
					},
					{
						action: {
							id: folder.id,
							op: 'retentionpolicy',
							retentionPolicy
						},
						_jsns: 'urn:zimbraMail'
					}
				],
				_jsns: 'urn:zimbra'
		  })
		  * */

/*
"Body": {
        "BatchResponse": {
            "DistributionListActionResponse": [
                {
                    "_jsns": "urn:zimbraAccount"
                }
            ],
            "Fault": [
                {
                    "Code": {
                        "Value": "soap:Sender"
                    },
                    "Reason": {
                        "Text": "non-existent members: eugenia.muffolini@demo.zextras.io in distribution list: italy-sub-dl@demo.zextras.io"
                    },
                    "Detail": {
                        "Error": {
                            "Code": "account.NO_SUCH_MEMBER",
                            "Trace": "qtp832432849-90618:1702398472371:0a9471bdbc660070",
                            "_jsns": "urn:zimbra"
                        }
                    },
                    "_jsns": "urn:zimbraSoap"
                }
            ],
            "_jsns": "urn:zimbra"
        }
    },
 */
