export const HOSTPORT = "8999";
export const MEDIADIR = "./assets/media/img/";
export const COUNTERFILE = ".counter";
export const NUMPERPAGE = 10;
export const NUMPERSUBPAGE = 5;

export const MS = {
    MASTER: {
        ONLINE: false,
        ADDR: 'http://49.234.15.176:8999',
        //ADDR: 'http://127.0.0.1:8999',
        SIGNATURE: '!QAZ@WSX',
        WEBBASE: '../web/dist',
        ASSETS: './assets/'
    },
    SLAVER: {
        ONLINE: true,
        TASK: true,
        ADDR: 'http://92.242.63.43:8999',
        //ADDR: 'http://127.0.0.1:8999',
        SIGNATURE: 'XSW@ZAQ!',
        TASKTIME: 24,
        
    }
}