import { HttpRequest } from "./net.request";
import { BusService } from "./dcl.bus.service";

export interface DclComponent {
    hr: HttpRequest;
    busService: BusService;
    load(d: any) : void;
}