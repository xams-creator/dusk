/**
 *  interface
 * **/
export interface ApiResponse<T = any> {
    code: number;
    data: T;
    message: string;
    notify: boolean;
    params: any;
    success: boolean;
}

export interface PageEntity<T = any> {
    total: number;
    limit: number;
    rows: T[];
    page: number;
    size: number;
}

/**
 *  exception
 * **/
export class BusinessError extends Error {}

/**
 *  enums
 * **/
export enum DateFormat {
    YEAR_ONLY = 'YYYY',
    YEAR_MONTH = 'YYYY-MM',
    YEAR_MONTH_DAY = 'YYYY-MM-DD',
    YEAR_MONTH_DAY_HOUR = 'YYYY-MM-DD HH',
    YEAR_MONTH_DAY_HOUR_MINUTE = 'YYYY-MM-DD HH:mm',
    DATE_TIME = 'YYYY-MM-DD HH:mm:ss',
    HOUR_MINUTE = 'HH:mm',
    TIME_ONLY = 'HH:mm:ss',
}

// 是/否
export enum Whether {
    YES = 1,
    NO = 0,
}

// 符号
export enum Symbol {
    COMMA = ',',
    SEMICOLON = ';',
    COLON = ':',
    VERTICAL = '|',
    HYPHEN = '-',
    UNDERLINE = '_',
    HASH = '#',
    AT = '@',
    EXCLAMATION = '!',
    DOLLAR = '$',
    PERCENT = '%',
    CARET = '^',
    AMPERSAND = '&',
    STAR = '*',
    QUESTION = '?',
    PERIOD = '.',
    SPACE = ' ',
    SIMILARITY = '~',
    EQUAL = '=',
}

// 请求方法
export enum HttpMethod {
    GET = 'GET',
    POST = 'POST',
    PUT = 'PUT',
    PATCH = 'PATCH',
    DELETE = 'DELETE',
}

export enum RequestHeader {
    JWT = 'x-jwt',
    AUTHORIZATION = 'Authorization',
}

/**
 *  utils
 * **/
export const downloadFile = (filename, blob) => {
    const inBrowser = typeof window !== 'undefined';
    if (inBrowser && 'msSaveOrOpenBlob' in window.navigator) {
        // @ts-ignore
        const { msSaveOrOpenBlob } = window.navigator;
        // @ts-ignore
        msSaveOrOpenBlob(blob, filename);
        return;
    }
    const url = URL.createObjectURL(blob);
    downloadUrl(filename, url);
};

export const downloadUrl = (filename, url) => {
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
};

export const convertBool = (value: boolean | string | number) => {
    return typeof value === 'boolean' ? value : typeof value === 'number' ? !!value : value === 'true';
};

export * from './util';
