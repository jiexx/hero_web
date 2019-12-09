import { ComponentRef, ViewChild, ViewContainerRef, ComponentFactoryResolver, Component, Input } from '@angular/core';
import { DclComponent } from './dcl.component';
import { DclWrapperMessage } from './dcl.wrapper.message';
import { BusService } from './dcl.bus.service';


@Component({
    selector: 'wrapper',
    template: `<div #target></div>`
})
export class DclWrapper {
    @ViewChild('target', { read: ViewContainerRef,static:false }) target;
    //@Input() name: string = 'DclWrapper';
    private _name: string = 'DclWrapper';
    @Input() set name(value: string) {
        this._name = value;
    }
    get name(): string {
        return this._name;
    }
    cmpRef: ComponentRef<DclComponent>;
    private isViewInitialized: boolean = false;
    dclMessage: DclWrapperMessage;

    constructor(public resolver: ComponentFactoryResolver,public busService: BusService) {
        busService.receive(this,dclmsg => {
            this.dclMessage = <DclWrapperMessage>dclmsg;
            this.loadComponent();
        })
    }
    removeComponent(){
        if (this.cmpRef) {
            this.cmpRef.destroy();
        }
    }

    loadComponent() {
        if (!this.isViewInitialized || !this.dclMessage /* || this.dclMessage.to != this */) {
            return;
        }
        if (this.cmpRef) {
            this.cmpRef.destroy();
        }
        var factory = this.resolver.resolveComponentFactory(this.dclMessage.component);
        this.cmpRef = this.target.createComponent(factory);
        (<DclComponent>this.cmpRef.instance).load(this.dclMessage.data);
        this.cmpRef.changeDetectorRef.detectChanges();
    }

    ngOnChanges() {
        this.loadComponent();
    }

    ngAfterViewInit() {
        this.isViewInitialized = true;
        this.loadComponent();
    }

    ngOnDestroy() {
        if (this.cmpRef) {
            this.cmpRef.destroy();
        }
    }
}