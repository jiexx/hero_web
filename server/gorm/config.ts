
export const PORT = "8899";
export const DBHOST = "127.0.0.1"
export const DBUSER = "root";
export const DBPWD = "Roger2019$%^";
export const DBNAME = "crawler";
export const DBDATE = (field:string) =>{ return `STR_TO_DATE(${field}, '%c/%e/%Y, %r'))`; };