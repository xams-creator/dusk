import { axios } from '@xams-framework/dusk';

export function passwordLogin() {
    return axios.post<any>('/bi/login', {
        'userCode': 'string',
    });
}
