import { Component, Input, OnInit, Sanitizer, Directive, ElementRef, Inject, HostListener, ViewChild, AfterViewInit, ViewRef } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { DomSanitizer } from "@angular/platform-browser";
import { SafeHtml } from "./dialog.favor.component";
import { Router, Route, ActivatedRoute } from "@angular/router";
import { HttpRequest } from "./net.request";
import { isFormattedError } from "@angular/compiler";

enum SL {
    URL = 2,
    DEPART = 3,
    ARRIVE = 4,
    DATE = 5, 
    SUBMIT = 6, 
}
const Airlines = {
    "EU": ["成都航空有限公司", "028-6666-8888", "https://www.cdal.com.cn/", "#trpDeparture", "#trpDeparture", "#DepartDateInput", "#indexForm > div.item-con > div > div.module-item.other-module-group.all > div.search-btn-wrap > input"],
    "HU": ["海南航空公司", "95339", "https://www.hnair.com/", "#from_city1", "#to_city1", "#flightBeginDate1", "#ticket-1 > div.clearfix.display-none.row-5 > div:nth-child(1) > button"],
    "NS": ["河北航空", "0311-96699", "http://www.hbhk.com.cn/", "#depCitySelecter", "#arrCitySelecter", "#biginTime", "#buyTicket"],
    "HO": ["吉祥航空公司", "021-95520", "http://www.juneyaoair.com/", "", "", "", ""],
    "SC": ["山东航空公司", "95369", "http://www.sda.cn/", "", "", "", ""],
    "FM": ["上海航空公司", "95530", "https://shanghai.ceair.com/zh/", "", "", "", ""],
    "ZH": ["深圳航空公司", "95361", "http://www.shenzhenair.com/", "", "", "", ""],
    "GS": ["天津航空", "95350", "http://www.tianjin-air.com/", "", "", "", ""],
    "TV": ["西藏航空公司", "400-808-9188", "http://www.tibetairlines.com.cn", "", "", "", ""],
    "MF": ["厦门航空有限公司", "95557", "http://www.xiamenair.com/zh-cn/", "body > div > div.bannerBlock > div > div.tabBlock.clearfix > ul > li > div.select-container.clearfix.this-tab > div.info.clearfix > div:nth-child(1) > div > input[type=text]", "body > div > div.bannerBlock > div > div.tabBlock.clearfix > ul > li > div.select-container.clearfix.this-tab > div.info.clearfix > div:nth-child(3) > div > input[type=text]", "body > div > div.bannerBlock > div > div.tabBlock.clearfix > ul > li > div.select-container.clearfix.this-tab > div.info.clearfix > div:nth-child(4) > div > input", "body > div > div.bannerBlock > div > div.tabBlock.clearfix > ul > li > div.select-container.clearfix.this-tab > div.btn-large-yellow"],
    "8L": ["云南祥鹏航空", "95326", "http://www.luckyair.net/", "", "", "", ""],
    "MU": ["中国东方航空公司", "95530", "http://www.ceair.com/", "input._value[name='deptCd']", "input._value[name='arrCd']", "#depDt", "#btn_flight_search"],
    "CA": ["中国国际航空公司", "95583", "http://www.airchina.com.cn/", "#0 ", "#1", "#deptDateShowGo", "#portalBtn"],
    "KN": ["中国联合航空公司", "95530", "http://www.flycua.com/", "", "", "", ""],
    "CZ": ["中国南方航空公司", "95539", "http://www.csair.com/cn/", "#fDepCity", "#fArrCity", "#fDepDate", "#commonbox > div.zsl-query > div > div > div.zsl-query-con.tab-pane.flight.tab-box > div > div.query-child-search > div.search-line.search-bottom > a"],
    "EY": ["阿联酋阿提哈德航空公司", "4008-822-050", "http://flights.etihad.com/zh-cn/", "", "", "", ""],
    "EK": ["阿联酋航空公司", "", "http://www.emirates.com", "", "", "", ""],
    "ET": ["埃塞俄比亚航空公司", "", "https://www.ethiopianairlines.com/CN/ZH/", "", "", "", ""],
    "OS": ["奥地利航空公司", "", "https://www.austrian.com/?cc=CN", "", "", "", ""],
    "NX": ["澳门航空公司", "021-6248-1110", "http://www.airmacau.com.cn/", "", "", "", ""],
    "SK": ["北欧航空", "", "https://www.flysas.com/cn-zh/", "", "", "", ""],
    "OQ": ["重庆航空公司", "", "http://chongqingairlines.cn/", "", "", "", ""],
    "LH": ["德国汉莎航空公司", "021-53524999", "http://www.lufthansa.com", "", "", "", ""],
    "J5": ["东海航空", "", "http://b2c.donghaiair.com/dz/main.jsp", "", "", "", ""],
    "SU": ["俄罗斯航空公司", "021-68355510（工作日）", "http://www.aeroflot.ru", "", "", "", ""],
    "S7": ["俄罗斯西伯利亚航空公司", "", "https://www.s7-airlines.com/", "", "", "", ""],
    "PR": ["菲律宾航空公司", "", "http://www.philippineairlines.com", "", "", "", ""],
    "Z2": ["菲律宾亚洲航空公司", "", "https://www.airasia.com/zh/cn", "", "", "", ""],
    "AY": ["芬兰航空公司", "", "http://www.finnair.com", "", "", "", ""],
    "CX": ["国泰航空公司", "4008-886-628", "http://www.cathaypacific.com", "", "", "", ""],
    "ZE": ["韩国易斯达航空", "", "https://www.eastarjet.com/", "", "", "", ""],
    "OZ": ["韩亚航空公司", "400-650-8000", "http://cn.flyasiana.com/", "", "", "", ""],
    "AC": ["加拿大航空", "4008-112-001", "http://www.aircanada.com", "", "", "", ""],
    "K6": ["柬埔寨吴哥航空", "", "https://www.cambodiaangkorair.com/", "", "", "", ""],
    "Y8": ["金鹏航空", "950719", "http://www.yzr.com.cn/", "", "", "", ""],
    "QR": ["卡塔尔航空公司", "021-23207555", "http://www.qatarairways.com", "", "", "", ""],
    "KY": ["昆明航空公司", "", "https://www.airkunming.com/#/", "", "", "", ""],
    "MM": ["乐桃航空", "", "http://www.flypeach.com/", "", "", "", ""],
    "B7": ["立荣航空", "021-68352946", "http://www.uniair.com.tw", "", "", "", ""],
    "MH": ["马来西亚航空公司", "4006015331", "http://www.malaysiaairlines.com", "", "", "", ""],
    "MK": ["毛里求斯航空", "021-63300538", "http://www.airmauritius.com/", "", "", "", ""],
    "AA": ["美国航空公司", "400-815-0800", "http://www.aa.com", "#reservationFlightSearchForm\.originAirport", "#reservationFlightSearchForm\.destinationAirport", "#aa-leavingOn", "#bookingModule-submit"],
    "UA": ["美国联合航空公司", "4008-810-213", "https://www.united.com", "#bookFlightOriginInput", "#bookFlightDestinationInput", "#DepartDate", "#bookFlightForm > div.app-components-BookFlightForm-bookFlightForm__flightBottomRow--1Joks.app-components-BookFlightForm-bookFlightForm__flightBottomRowWithNoEconomyFares--3a-KA > button"],
    "LV": ["美佳环球航空", "", "", "", "", "", ""],
    "AM": ["墨西哥航空公司", "021-60899985（工作日）", "http://www.aeromexico.com", "", "", "", ""],
    "NH": ["全日空航空公司", "400-882-8888", "https://www.ana.co.jp/zh/cn/", "", "", "", ""],
    "LX": ["瑞士国际航空公司", "4008-820-880", "https://www.staralliance.com/", "", "", "", ""],
    "3U": ["四川航空公司", "4008-300-999", "http://www.sichuanair.com/", "", "", "", ""],
    "5J": ["宿务太平洋航空", "021-51503966/51503977", "https://www.cebupacificair.com/", "", "", "", ""],
    "BR": ["台湾长荣航空公司", "400-820-5890", "https://www.evaair.com/sc-cn/index.html", "", "", "", ""],
    "TG": ["泰国航空公司", "021-33664000", "http://www.thaiairways.com", "", "", "", ""],
    "TK": ["土耳其航空公司", "021-32220022", "https://www.turkishairlines.com/", "", "", "", ""],
    "VS": ["维珍航空公司", "021-53534600", "https://www.virginatlantic.com/", "", "", "", ""],
    "PN": ["西部航空", "", "http://www.westair.cn/portal/", "", "", "", ""],
    "HX": ["香港航空公司", "+86 950715", "https://www.hongkongairlines.com", "", "", "", ""],
    "SQ": ["新加坡航空公司", "021-62887999", "http://www.singaporeair.com", "", "", "", ""],
    "NZ": ["新西兰航空公司", "021-23253333", "http://www.airnewzealand.cn", "", "", "", ""],
    "D7": ["亚洲航空（长途）", "", "http://www.airasia.com", "", "", "", ""],
    "W5": ["伊朗马汉航空", "021-62473300", "http://www.mahan.aero", "", "", "", ""],
    "AI": ["印度航空公司", "021-68355559（航班时）", "http://www.airindia.com/", "", "", "", ""],
    "GA": ["印尼航空", "021-52391000", "http://www.garuda-indonesia.com", "", "", "", ""],
    "BA": ["英国航空公司", "4008-810-207", "http://www.britishairways.com", "", "", "", ""],
    "VN": ["越南航空公司", "", "https://www.vietnamairlines.com/cn/zh/home", "", "", "", ""],
    "9C": ["中国春秋航空公司", "021-95524", "https://en.ch.com/", "", "", "", ""],
    "QF": ["澳洲航空公司", "", "http://www.qantas.com.au", "", "", "", ""],
    "JS": ["朝鲜高丽航空公司", "", "", "", "", "", ""],
    "KE": ["大韩航空公司", "400-658-8888", "https://www.koreanair.com/global/zh_cn.html", "", "", "", ""],
    "AF": ["法国航空公司", "4008-808-808", "http://www.airfrance.com.cn", "", "", "", ""],
    "TW": ["韩国德威航空", "", "http://www.twayair.com/", "", "", "", ""],
    "LJ": ["韩国真航空公司", "", "http://www.jinair.com/Language/CHN/", "", "", "", ""],
    "KL": ["荷兰皇家航空公司", "4008-808-222", "http://www.klm.com", "", "", "", ""],
    "DL": ["美国达美航空公司", "", "http://zh.delta.com/", "", "", "", ""],
    "JL": ["日本航空公司", "400-888-0808", "https://www.jal.co.jp/inter/", "", "", "", ""],
    "UL": ["斯里兰卡航空公司", "62376887*17", "http://www.srilankan.com/zh_cn", "", "", "", ""],
    "OX": ["泰国东方航空公司", "", "https://www.ufsoo.com/airline/ox/", "", "", "", ""],
    "BI": ["文莱皇家航空公司", "2153027532", "https://www.flyroyalbrunei.com/", "", "", "", ""],
    "CI": ["中华航空有限公司", "-8200", "https://www.china-airlines.com/cn/zh", "", "", "", ""],
    "KA/CX": ["国泰港龙航空", "4008-886-628", "https://www.cathaypacific.com/cx/en_CN.html", "", "", "", ""]
};
@Component({
    selector: 'external',
    template: `<iframe #iframe [srcdoc]="url" (load)="onLoad()" style="position:fixed;top:0;right:0;bottom:0;left:0;width:100%;height:100%;" ></iframe>`
})
export class ExternalComponent implements AfterViewInit {
    @Input() depart: string;
    @Input() arrive: string;
    @Input() datetime: string;
    @Input() airco: string;
    @ViewChild('iframe',{static:true}) iframe;

    url;
    constructor(
        public hr: HttpRequest,
        public sanitizer: DomSanitizer,
        private ar: ActivatedRoute
    ) {
        this.airco = ar.snapshot.paramMap.get('airco') || this.airco;
        this.depart = ar.snapshot.paramMap.get('depart') || this.depart;
        this.arrive = ar.snapshot.paramMap.get('arrive') || this.arrive;
        this.datetime = ar.snapshot.paramMap.get('datetime') || this.datetime;
        var base = `<base href="${Airlines[this.airco][SL.URL]}" />`;
        console.log('load 1', Airlines[this.airco][SL.URL])
        this.url = hr.download('proxy/get/'+encodeURIComponent(Airlines[this.airco][SL.URL]), (result : string) =>{
            result = result.replace('<head>', '<head>'+base);
            this.url = sanitizer.bypassSecurityTrustHtml(result);
        });
    }
    onLoad(){
        let el = this.getElements([SL.DEPART,SL.ARRIVE,SL.DATE,SL.SUBMIT]);
        console.log('load 2', el, this.depart)
        if(el.length == 4){
            el[0].setAttribute('value', this.depart);
            el[1].setAttribute('value', this.arrive);
            el[2].setAttribute('value', this.datetime);
            el[3].click();
        }
    }
    get doc(){
        return this.iframe.nativeElement.contentDocument || this.iframe.nativeElement.contentWindow;
    }
    getElements(sl: SL[]){
        return sl.map(e => this.doc.querySelector(Airlines[this.airco][e]) as HTMLElement).filter(e=>!!e);
    }
    ngAfterViewInit() {
        
        
    }

}
