export class Singleton {
    
    private static _instance: Singleton;

    public  static get instance(): any{
        return this._instance || (this._instance = new this() );
    }
}