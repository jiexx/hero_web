export const HOSTPORT = "8999";
export const MEDIADIR = "./assets/media/img/";
export const COUNTERFILE = ".counter";
export const NUMPERPAGE = 10;
export const NUMPERSUBPAGE = 5;
export const PAY = {
    ALI: {
        NOTIFY: 'http://49.234.15.176:8999/alipay',
        APPID: 2021001102615262,
        KEY: '-----BEGIN RSA PRIVATE KEY-----\r\nMIIEpQIBAAKCAQEA28oy16iY4aYdv/H47jhwmxHudjPJcegZwvjd0OxTUsZLtpKUi1QWJrfOtHtIjHmFIhig6r1a7bmFqZ0ncBxgfoi7l/1WLTf0D0bkON3/S/tEEUQrJ5RPxHP20V9RsS3+MkHHffi1GJwTZd0rFd0e/fTiOuGm7pmlviqsN0UL5sZ9eJdRlnFSnUqzKR857IKJCDHoickTgljJVE5ELzLajNafvvpjMEiqVLmMBB+TCd5J0WTQ/yiedIW0ulDKxWEHNu7h3rSHwokY5RWDgxnWdfLEMnSpRj8zizJqMGNPAANn9yMaQLUNnLZplRn5JaiO5RnP1szg8EGRZ8TsF0oCfwIDAQABAoIBAQClWzhpG8T5b1rOgCPCReAiKpl3gHq8IdzP3SA1ALenfNyVnS34rOiFdKAlFON+HCbXgiP+tztjwsIW289B/3dxezl3nfdpycDqhXFKf2qFJaMOQnUdL+3bZUt6NfZmEK4/7VFDKwxEWZgWeRDjQBsDAWv61K4csKgLrFsosd/EXIdIeRqcwQnu7m8Jj1bGNl4p42GRXyd11tGfeAHdtQ+vjhukxbmD5euL0TgfdhLlFAXPfxxvXBNrliB7G+6syp1iQjJVeykgYitPk2LpFkG9PnH1SjlyOnPR6NeOAhTdOqdxUIOEg2kZ5RZ0h96L6InTIRUwVgaNYhFYBkQEx+qhAoGBAP8QPZILhwAwkBXLAXh6kvGCeYpQwf1/GLTHhE2y6hxp9VMdh6BnGAoIfpuCveiMyk10LyklB6dJv8sXkBezhO2g+7iIFodKITXLJM2Yo0z31f103vPKnrnymsDyBBfObn7E+W+cjzL/GwDCAOlPLvmDIx1IuuaWBK9BOJBmgusXAoGBANyYzQmfr3YNhnyNxwaQbZyb9yHwYGVFBZ7S1PE7i27Js8TifMUKjPRRMJuJ9TEE+G6c4VuOsh8IlJvCPDrxPzSHLOeRImggifgsC+zF1QdEkAYIgV96rArrjD3Iw12znUGbSrxXP6EfUHR6Qo0fnXjz4HP5Co8eXr4GEZjDuqTZAoGBAO41Jqt8pIoi0I3p1+fC4fU3m3b30RSEXHiJVSCTlV0QABOtonrFjYfhQwzNX7sNseoANgNBGBK+J6buzJ22BNFA5ZYDUrbrHnT00dxJT0mUtH9PZOFePDsBPlIwNG5fVoaCQ0pfdsVzxq5AgUVjtEVGmcbBo/ux45IhYUhK1L3lAoGAUs6FARzRR5ZSKoUp9bvXeZdOUI4kET+0mWb5CkjY0VCjy79dKLYKLVggz/IceTctbpAzRCQvltiouENUSqfumvA3GgHwEXhNcjxOiaXFjsHc8nbU4Ztx43OCJFstgwn+ePcrOcHin7/aeq6+Nq1sdk/NrJsKrKiw1dH/XwHyGRkCgYEAvk/wOAxdsh7AkVDY3fWCh4lFsVGwFeZfIOgirY+WGduNJVmSkC8ECm5xz6TTVaHx4h+3u4RVagFSVrEgWGRUPS9tMTRKSVR/F/TFSgRl4vZmtVdChUsxnEatK7AJFBnAejNCrU35rRYmkQipWnO5pjdybW76JRGbY3DwrSsT1Bc=\r\n-----END RSA PRIVATE KEY-----',
        PUBKEY: '-----BEGIN PUBLIC KEY-----\r\nMIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA28oy16iY4aYdv/H47jhwmxHudjPJcegZwvjd0OxTUsZLtpKUi1QWJrfOtHtIjHmFIhig6r1a7bmFqZ0ncBxgfoi7l/1WLTf0D0bkON3/S/tEEUQrJ5RPxHP20V9RsS3+MkHHffi1GJwTZd0rFd0e/fTiOuGm7pmlviqsN0UL5sZ9eJdRlnFSnUqzKR857IKJCDHoickTgljJVE5ELzLajNafvvpjMEiqVLmMBB+TCd5J0WTQ/yiedIW0ulDKxWEHNu7h3rSHwokY5RWDgxnWdfLEMnSpRj8zizJqMGNPAANn9yMaQLUNnLZplRn5JaiO5RnP1szg8EGRZ8TsF0oCfwIDAQAB\r\n-----END PUBLIC KEY-----',
        HOST: 'http://openapi.alipay.com/gateway.do',
        SELLERID: 2088231676446074
    }
    
}
export const MS = {
    MASTER: {
        ONLINE: true,
        ADDR: 'http://49.234.15.176:8999',
        // ADDR: 'http://127.0.0.1:8999',
        SIGNATURE: '!QAZ@WSX',
        ASSETS: '../web/dist',   //req: cache /assets/... => ../web/dist/assets/....
        MEDIA: './assets/'       //req: /media/... => ./assets/....
    },
    SLAVER: {
        ONLINE: true,
        TASK: true,
        ADDR: 'http://92.242.63.43:8999',
        // ADDR: 'http://127.0.0.1:8999',
        SIGNATURE: 'XSW@ZAQ!',
        TASKTIME: 24,
        
    }
}