import { Component, OnInit } from "@angular/core";
import { HttpRequest } from "./net.request";
import { KeyValue } from "@angular/common";
import { BusService } from "./dcl.bus.service";
import { DialogMessage } from "./dcl.dialog.message";
import { FavorDialogComponent } from "./dialog.favor.component";
import { ImageUrl } from "./net.image";
import { User } from "./net.user";
const Airlines = {
    "EU": ["成都航空有限公司", "028-6666-8888", "http://www.chengduair.cc/"],
    "HU": ["海南航空公司", "95339", "http://www.hnair.com/"],
    "NS": ["河北航空", "0311-96699", "http://www.hbhk.com.cn"],
    "HO": ["吉祥航空公司", "021-95520", "http://www.juneyaoair.com/"],
    "SC": ["山东航空公司", "95369", "http://www.shandongair.com.cn/"],
    "FM": ["上海航空公司", "95530", "http://www.shanghai-air.com/"],
    "ZH": ["深圳航空公司", "95361", "http://www.shenzhenair.com/"],
    "GS": ["天津航空", "95350", "http://www.tianjin-air.com"],
    "TV": ["西藏航空公司", "400-808-9188", "http://www.tibetairlines.com.cn"],
    "MF": ["厦门航空有限公司", "95557", "http://www.xiamenair.com/zh-cn/"],
    "8L": ["云南祥鹏航空", "95326", "http://www.luckyair.net/"],
    "MU": ["中国东方航空公司", "95530", "http://www.ce-air.com/"],
    "CA": ["中国国际航空公司", "95583", "http://www.airchina.com.cn/"],
    "KN": ["中国联合航空公司", "95530", "http://www.flycua.com/"],
    "CZ": ["中国南方航空公司", "95539", "http://www.csair.com/cn/"],
    "EY": ["阿联酋阿提哈德航空公司", "4008-822-050", "http://flights.etihad.com/zh-cn/"],
    "EK": ["阿联酋航空公司", "", "http://www.emirates.com"],
    "ET": ["埃塞俄比亚航空公司", "", ""],
    "OS": ["奥地利航空公司", "", ""],
    "NX": ["澳门航空公司", "021-6248-1110", "http://www.airmacau.com.cn/"],
    "SK": ["北欧航空", "", "http://www.flysas.com/zh-cn/cn/"],
    "OQ": ["重庆航空公司", "", "http://www.flycq.com"],
    "LH": ["德国汉莎航空公司", "021-53524999", "http://www.lufthansa.com"],
    "J5": ["东海航空", "", ""],
    "SU": ["俄罗斯航空公司", "021-68355510（工作日）", "http://www.aeroflot.ru"],
    "S7": ["俄罗斯西伯利亚航空公司", "", "https://www.s7-airlines.com/"],
    "PR": ["菲律宾航空公司", "", "http://www.philippineairlines.com"],
    "Z2": ["菲律宾亚洲航空公司", "", ""],
    "AY": ["芬兰航空公司", "", "http://www.finnair.com"],
    "CX": ["国泰航空公司", "4008-886-628", "http://www.cathaypacific.com"],
    "ZE": ["韩国易斯达航空", "", ""],
    "OZ": ["韩亚航空公司", "400-650-8000", "http://cn.flyasiana.com/"],
    "AC": ["加拿大航空", "4008-112-001", "http://www.aircanada.com"],
    "K6": ["柬埔寨吴哥航空", "", ""],
    "Y8": ["金鹏航空", "950719", "http://www.yzr.com.cn/"],
    "QR": ["卡塔尔航空公司", "021-23207555", "http://www.qatarairways.com"],
    "KY": ["昆明航空公司", "", ""],
    "MM": ["乐桃航空", "", "http://www.flypeach.com/"],
    "B7": ["立荣航空", "021-68352946", "http://www.uniair.com.tw"],
    "MH": ["马来西亚航空公司", "4006015331", "http://www.malaysiaairlines.com"],
    "MK": ["毛里求斯航空", "021-63300538", "http://www.airmauritius.com/"],
    "AA": ["美国航空公司", "400-815-0800", "http://www.aa.com"],
    "UA": ["美国联合航空公司", "4008-810-213", ""],
    "LV": ["美佳环球航空", "", "http://megamaldivesair.com/cn/"],
    "AM": ["墨西哥航空公司", "021-60899985（工作日）", "http://www.aeromexico.com"],
    "NH": ["全日空航空公司", "400-882-8888", "http://www.ana.co.jp/asw/wws/cn/c/"],
    "LX": ["瑞士国际航空公司", "4008-820-880", ""],
    "3U": ["四川航空公司", "4008-300-999", "http://www.scal.com.cn/"],
    "5J": ["宿务太平洋航空", "021-51503966/51503977", "http://www.cebupacific.cn/"],
    "BR": ["台湾长荣航空公司", "400-820-5890", "https://www.evaair.com/sc-cn/index.html"],
    "TG": ["泰国航空公司", "021-33664000", "http://www.thaiairways.com"],
    "TK": ["土耳其航空公司", "021-32220022", "http://www.thy.com/zh-CN/index.aspx"],
    "VS": ["维珍航空公司", "021-53534600", "http://www.virgin-atlantic.com"],
    "PN": ["西部航空", "", ""],
    "HX": ["香港航空公司", "+86 950715", "https://www.hongkongairlines.com/en_CN/homepage"],
    "SQ": ["新加坡航空公司", "021-62887999", "http://www.singaporeair.com"],
    "NZ": ["新西兰航空公司", "021-23253333", "http://www.airnewzealand.cn"],
    "D7": ["亚洲航空（长途）", "", "http://www.airasia.com"],
    "W5": ["伊朗马汉航空", "021-62473300", "http://www.mahan.aero"],
    "AI": ["印度航空公司", "021-68355559（航班时）", "http://home.airindia.in"],
    "GA": ["印尼航空", "021-52391000", "http://www.garuda-indonesia.com"],
    "BA": ["英国航空公司", "4008-810-207", "http://www.britishairways.com"],
    "VN": ["越南航空公司", "", ""],
    "9C": ["中国春秋航空公司", "021-95524", "https://en.ch.com/"],
    "QF": ["澳洲航空公司", "", "http://www.qantas.com.au"],
    "JS": ["朝鲜高丽航空公司", "", ""],
    "KE": ["大韩航空公司", "400-658-8888", "https://www.koreanair.com/global/zh_cn.html"],
    "AF": ["法国航空公司", "4008-808-808", "http://www.airfrance.com.cn"],
    "TW": ["韩国德威航空", "", "http://www.twayair.com/"],
    "LJ": ["韩国真航空公司", "", "http://www.jinair.com/Language/CHN/"],
    "KL": ["荷兰皇家航空公司", "4008-808-222", "http://www.klm.com"],
    "DL": ["美国达美航空公司", "", "http://zh.delta.com/"],
    "JL": ["日本航空公司", "400-888-0808", "http://www.cn.jal.com/zhcn/"],
    "UL": ["斯里兰卡航空公司", "62376887*17", "http://www.srilankan.com/zh_cn"],
    "OX": ["泰国东方航空公司", "", ""],
    "BI": ["文莱皇家航空公司", "2153027532", ""],
    "CI": ["中华航空有限公司", "-8200", "https://www.china-airlines.com/cn/zh"],
    "KA/CX": ["国泰港龙航空", "4008-886-628", "https://www.cathaypacific.com/cx/en_CN.html"],
};
const Places = {
    "SYD": "悉尼",
    "CDG": "巴黎 夏尔戴高乐",
    "REP": "暹粒",
    "AKL": "奥克兰",
    "MUC": "慕尼黑",
    "SIN": "新加坡",
    "FRA": "法兰克福",
    "MEL": "墨尔本",
    "CMB": "科伦坡",
    "AMS": "阿姆斯特丹",
    "BUD": "布达佩斯",
    "DPS": "巴厘岛",
    "SVO": "莫斯科 谢列梅捷沃",
    "CEB": "宿雾",
    "HND": "东京 羽田",
    "LGW": "伦敦 盖特威克",
    "KUL": "吉隆坡",
    "MNL": "马尼拉 尼诺阿基诺",
    "MXP": "米兰 马尔彭萨",
    "VVO": "符拉迪沃斯托克",
    "HKT": "普吉岛",
    "DMK": "BANKOK",
    "ICN": "首尔 仁川",
    "KIX": "大阪 关西",
    "DXB": "迪拜",
    "KLO": "Kalibo",
    "CJU": "济州",
    "HKG": "香港",
    "MFM": "澳门",
    "CNX": "清迈",
    "NRT": "东京 成田",
    "TSA": "台北 松山",
    "TAE": "大邱",
    "BKK": "曼谷",
    "CTS": "千岁",
    "TPE": "台北 桃园",
    "IBR": "茨城",
    "GMP": "首尔 金浦",
    "PUS": "釜山 金海",
    "SGN": "胡志明市",
    "TAK": "高松",
    "PNH": "金边",
    "KHH": "台湾 高雄",
    "MYJ": "松山",
    "KMQ": "小松",
    "NGO": "名古屋国际",
    "HSG": "佐贺",
    "NGS": "长崎",
    "ZRH": "苏黎世",
    "OKA": "冲绳 那霸",
    "HEL": "赫尔辛基 万塔",
    "FUK": "福冈",
    "LHR": "伦敦 希思罗",
    "FSZ": "静冈",
    "DTW": "底特律 都会",
    "JFK": "纽约 约翰肯尼迪",
    "ORD": "芝加哥 奥黑尔",
    "ATL": "亚特兰大",
    "YYZ": "多伦多",
    "MLE": "马累",
    "SEA": "西雅图",
    "FCO": "罗马 菲乌米奇诺",
    "LAX": "洛杉矶",
    "YVR": "温哥华",
    "SFO": "旧金山",
    "CPH": "哥本哈根 凯斯楚普",
    "DEL": "德里",
    "HAN": "河内",
    "BWN": "斯里巴加湾",
    "EWR": "纽瓦克自由国际",
    "CGK": "雅加达",
    "HNL": "火奴鲁鲁",
    "OKJ": "岗山",
    "HIJ": "广岛",
    "DFW": "Dallas Fort Worth Texas",
    "YUL": "Montreal Dorval",
    "RGN": "仰光",
    "BNE": "布里斯班",
    "BKI": "哥打京那巴鲁",
    "IST": "伊斯坦布尔",
    "ADD": "亚的斯亚贝巴",
    "DOH": "多哈",
    "AUH": "阿布扎比",
    "IKA": "德黑兰 伊玛目·霍梅尼",
    "VTE": "万象",
    "BCN": "巴塞罗那",
    "MRU": "毛里求斯",
    "VIE": "维也纳 施韦夏特",
    "MAD": "马德里 巴拉哈斯",
    "BOS": "波士顿 洛根",
    "MEX": "墨西哥城",
    "SPN": "塞班岛",
    "FNJ": "平壤 顺安",
    "CRK": "克拉克",
    "DAD": "岘港",
    "PRG": "Prag",
    "ARN": "斯德哥尔摩 阿兰达",
    "SSN": "韩国 新川里",
    "MWX": "务安",
    "TOY": "富山",
    "KIJ": "新泻",
    "KOJ": "鹿尔岛",
    "HNA": "花卷",
    "AKJ": "旭川",
    "SDJ": "仙台",
    "LPQ": "LUANG PRABANG",
    "POM": "Port Moresby",
    "TIJ": "蒂华纳",
    "SHA": "上海虹桥机场",
    "PVG": "上海浦东机场"
}
const PlaceOptions = [{"key":"AUH","value":"阿布扎比"},{"key":"AMS","value":"阿姆斯特丹"},{"key":"AKL","value":"奥克兰"},{"key":"MFM","value":"澳门"},{"key":"DPS","value":"巴厘岛"},{"key":"CDG","value":"巴黎 夏尔戴高乐"},{"key":"BCN","value":"巴塞罗那"},{"key":"BOS","value":"波士顿 洛根"},{"key":"BUD","value":"布达佩斯"},{"key":"BNE","value":"布里斯班"},{"key":"OKA","value":"冲绳 那霸"},{"key":"IBR","value":"茨城"},{"key":"KIX","value":"大阪 关西"},{"key":"TAE","value":"大邱"},{"key":"IKA","value":"德黑兰 伊玛目·霍梅尼"},{"key":"DEL","value":"德里"},{"key":"DXB","value":"迪拜"},{"key":"DTW","value":"底特律 都会"},{"key":"TIJ","value":"蒂华纳"},{"key":"NRT","value":"东京 成田"},{"key":"HND","value":"东京 羽田"},{"key":"DOH","value":"多哈"},{"key":"YYZ","value":"多伦多"},{"key":"FRA","value":"法兰克福"},{"key":"VVO","value":"符拉迪沃斯托克"},{"key":"FUK","value":"福冈"},{"key":"PUS","value":"釜山 金海"},{"key":"TOY","value":"富山"},{"key":"OKJ","value":"岗山"},{"key":"TAK","value":"高松"},{"key":"CPH","value":"哥本哈根 凯斯楚普"},{"key":"BKI","value":"哥打京那巴鲁"},{"key":"HIJ","value":"广岛"},{"key":"SSN","value":"韩国 新川里"},{"key":"HAN","value":"河内"},{"key":"HEL","value":"赫尔辛基 万塔"},{"key":"SGN","value":"胡志明市"},{"key":"HNA","value":"花卷"},{"key":"HNL","value":"火奴鲁鲁"},{"key":"KUL","value":"吉隆坡"},{"key":"CJU","value":"济州"},{"key":"PNH","value":"金边"},{"key":"FSZ","value":"静冈"},{"key":"SFO","value":"旧金山"},{"key":"CMB","value":"科伦坡"},{"key":"CRK","value":"克拉克"},{"key":"KOJ","value":"鹿尔岛"},{"key":"LGW","value":"伦敦 盖特威克"},{"key":"LHR","value":"伦敦 希思罗"},{"key":"FCO","value":"罗马 菲乌米奇诺"},{"key":"LAX","value":"洛杉矶"},{"key":"MAD","value":"马德里 巴拉哈斯"},{"key":"MLE","value":"马累"},{"key":"MNL","value":"马尼拉 尼诺阿基诺"},{"key":"BKK","value":"曼谷"},{"key":"MRU","value":"毛里求斯"},{"key":"MXP","value":"米兰 马尔彭萨"},{"key":"NGO","value":"名古屋国际"},{"key":"SVO","value":"莫斯科 谢列梅捷沃"},{"key":"MEL","value":"墨尔本"},{"key":"MEX","value":"墨西哥城"},{"key":"MUC","value":"慕尼黑"},{"key":"EWR","value":"纽瓦克自由国际"},{"key":"JFK","value":"纽约 约翰肯尼迪"},{"key":"FNJ","value":"平壤 顺安"},{"key":"HKT","value":"普吉岛"},{"key":"CTS","value":"千岁"},{"key":"CNX","value":"清迈"},{"key":"SPN","value":"塞班岛"},{"key":"GMP","value":"首尔 金浦"},{"key":"ICN","value":"首尔 仁川"},{"key":"ARN","value":"斯德哥尔摩 阿兰达"},{"key":"BWN","value":"斯里巴加湾"},{"key":"MYJ","value":"松山"},{"key":"ZRH","value":"苏黎世"},{"key":"CEB","value":"宿雾"},{"key":"TSA","value":"台北 松山"},{"key":"TPE","value":"台北 桃园"},{"key":"KHH","value":"台湾 高雄"},{"key":"VTE","value":"万象"},{"key":"VIE","value":"维也纳 施韦夏特"},{"key":"YVR","value":"温哥华"},{"key":"MWX","value":"务安"},{"key":"SEA","value":"西雅图"},{"key":"SYD","value":"悉尼"},{"key":"SDJ","value":"仙台"},{"key":"REP","value":"暹粒"},{"key":"DAD","value":"岘港"},{"key":"HKG","value":"香港"},{"key":"KMQ","value":"小松"},{"key":"SIN","value":"新加坡"},{"key":"KIJ","value":"新泻"},{"key":"AKJ","value":"旭川"},{"key":"CGK","value":"雅加达"},{"key":"ADD","value":"亚的斯亚贝巴"},{"key":"ATL","value":"亚特兰大"},{"key":"RGN","value":"仰光"},{"key":"IST","value":"伊斯坦布尔"},{"key":"NGS","value":"长崎"},{"key":"ORD","value":"芝加哥 奥黑尔"},{"key":"HSG","value":"佐贺"},{"key":"DMK","value":"BANKOK"},{"key":"DFW","value":"Dallas Fort Worth Texas"},{"key":"KLO","value":"Kalibo"},{"key":"LPQ","value":"LUANG PRABANG"},{"key":"YUL","value":"Montreal Dorval"},{"key":"POM","value":"Port Moresby"},{"key":"PRG","value":"Prag"}];

@Component({
    selector: 'tickets',
    template:
`<mat-list>
<mat-list-item>
    <mat-form-field>
        <mat-label>{{filter1.hint}}</mat-label>
        <mat-select [(ngModel)]="filter1.input" (openedChange)="getTicketList(0, $event);getTicketCount($event)" multiple>
            <mat-option *ngFor="let place of filter1.options" [value]="place.key">
                {{place.value}}
            </mat-option>
        </mat-select>
    </mat-form-field>
    <mat-form-field>
        <mat-label>{{filter2.hint}}</mat-label>
        <mat-select [(ngModel)]="filter2.input" (openedChange)="getTicketList(0, $event);getTicketCount($event)">
            <mat-option *ngFor="let place of filter2.options | keyvalue" [value]="place.key">
                {{place.value}}
            </mat-option>
        </mat-select>
    </mat-form-field>
</mat-list-item>   
<mat-accordion>
    <mat-expansion-panel *ngFor="let airline of airlines" (afterExpand)="open(airline)" #panel>
        <mat-expansion-panel-header [collapsedHeight]="'auto'" [expandedHeight]="'auto'">
            <mat-list-item>
                <span mat-list-icon style="width:auto;height:auto"><img style="width:4rem;border-radius:4px"  src={{dest(airline.E)}}></span>
                <h5 mat-line><button  mat-icon-button  color="warn"><mat-icon (click)="favorite(airline, panel)">{{airline.favorited ? airline.favorited : 'location_on'}}</mat-icon></button>{{destname(airline.E)}}({{airline.end}})</h5>
                <h6 mat-line>出发:{{airport(airline.B)}}|{{airline.depart.replace('T',' ')}}</h6>
                <h6 mat-line *ngIf="airline.stops && airline.stops!='null'" > 经停:{{airline.stops}} </h6>
                <h6 mat-line >
                    航班:<span *ngFor="let flight of flights(airline.flight); let i = index"><button mat-icon-button class="small" (click)="link(flight)" color="warn"><img style="width:15px" src={{company(flight)}}></button>
                    {{cname(flight)}}|{{airline.flight.split(',')[i]}}</span>
                </h6>
                <h6 mat-line>到达:{{airport(airline.E)}}({{airline.E}})|{{airline.arrive.replace('T',' ')}}</h6>
                <h4>{{airline.price}}</h4>
            </mat-list-item>
        </mat-expansion-panel-header>
        <mat-list style="margin-left:30px;">
            <mat-list-item  *ngFor="let airline of airline.sublist">
                <h5 mat-line>{{destname(airline.E)}}({{airline.end}})</h5>
                <h6 mat-line>出发:{{airport(airline.B)}}|{{airline.depart.replace('T',' ')}}</h6>
                <h6 mat-line *ngIf="airline.stops && airline.stops!='null'" > 经停:{{airline.stops}} </h6>
                <h6 mat-line >
                    航班:<span *ngFor="let flight of flights(airline.flight); let i = index"><button mat-icon-button class="small" (click)="link(flight)" color="warn"><img style="width:15px" src={{company(flight)}}></button>
                    {{cname(flight)}}|{{airline.flight.split(',')[i]}}</span>
                </h6>
                <h6 mat-line>到达:{{airport(airline.E)}}({{airline.E}})|{{airline.arrive.replace('T',' ')}}</h6>
                <h4>{{airline.price}}</h4>
            </mat-list-item>
            <mat-list-item>
                <mat-paginator [length]="subpgNumber" [pageSize]="5" (page)="subPage(airline, $event)"> </mat-paginator>
            </mat-list-item>
        </mat-list>
    </mat-expansion-panel>
    <mat-expansion-panel [disabled]=true>
        <mat-expansion-panel-header>
            <mat-panel-title></mat-panel-title>
            <div fxFlex></div>
            <mat-paginator [length]="pgNumber" itemsPerPageLabel="每页" [pageSize]="10" (page)="page($event)"> </mat-paginator>
        </mat-expansion-panel-header>
    </mat-expansion-panel>
</mat-accordion>
</mat-list>
`
})

export class TicketComponent implements OnInit {
    items = { 1: 'value 1', 2: 'value 2', 3: 'value 3' };
    filter1 = {hint: '目的地', input: '', options: PlaceOptions};
    filter2 = {hint: '经停地', input: '', options: {'B':'包含经停航班','I':'只包含经停航班','X':'不包含经停航班'} };
    airlines: any;
    pgNumber: number;
    subpgNumber: number;
    constructor(public hr: HttpRequest, public imgUrl: ImageUrl, public busService: BusService, public user: User) {
    }
    airport(B:string){
        return Places[B];
    }
    favor(price, method, ticketid, airline, orderid){
        this.hr.post('favor/post', { price: parseInt(price), method: method, to: ticketid, orderid: orderid }, result => {
            airline.favorited = 'where_to_vote';
        });
    }
    setImageToSVG(svg){
        return svg;
    }​
    
    qrcode(msg: DialogMessage, success: Function, timeout: Function){
        var counter = 0;
        var lastOrderid = '';
        var refresh = ()=>{
            if(msg.info._ref && counter < 20){
                this.hr.get('pay/qrcode?subject=Infomation',result => {
                    msg.info.qrcode = this.setImageToSVG(result.data.qrcode);
                    lastOrderid = result.data.orderid;
                    //console.log( !!msg.info._ref, counter, lastOrderid, result.data.orderid, msg.info.qrcode)
                    if(counter < 20){
                        //console.log('refresh timer');
                        counter ++;
                        setTimeout(query,3000)
                    }else if(counter >= 20){
                        msg.info._ref && msg.info._ref.close();
                        msg.info._ref = null;
                        timeout && timeout();
                    }
                })
            }
        }
        var query = ()=>{
            if(msg.info._ref && counter < 20){
                this.hr.get('pay/query?orderid='+lastOrderid,result => {
                    //console.log( !!msg.info._ref, counter, lastOrderid, result.data)
                    switch(parseInt(result.data)){
                        case -500:
                        case -200:
                            counter ++;
                            setTimeout(query,3000);
                            break;
                        case -400:
                        case -300:
                        case -100:
                            refresh();
                            break;
                        case 100:
                        case 200:
                            msg.info._ref && msg.info._ref.close();
                            msg.info._ref = null;
                            success && success(lastOrderid);
                            break;
                    }
                })
            }else if(counter >= 20){
                msg.info._ref && msg.info._ref.close();
                msg.info._ref = null;
                timeout && timeout();
            }
        }
        refresh();
    }
    favorite(airline, panel){
        //console.log(airline.favorited, airline.favorited);
        if(!airline.favorited || airline.favorited == 'location_on') {
            panel.disabled = true;
            var msg = null;
            this.busService.send(msg = new DialogMessage(this, FavorDialogComponent, {qrcode:''},
                null, 
                null, 
                ()=>{panel.disabled = false;panel.hideToggle = false},
            ));
            this.qrcode(msg, (orderid)=>{this.favor(msg.info._result.price, 1, airline.id, airline, orderid);}, null);
            
        }else if(airline.favorited == 'where_to_vote'){
            airline.favorited = 'location_on'
        }
    }
    getTicketList(pg: number, opened: boolean = false){
        if(!opened) {
            this.hr.post('ticket/list', { page: pg, note: ['SHA','PVG'], eqe: this.filter1.input, stops:this.filter2.input }, result => {
                //console.log('ticket list', result)
                this.airlines = result.data;
            });
        } 
    }
    getTicketCount(opened: boolean = false){
        if(!opened) {
            this.hr.post('ticket/count', { note: ['SHA','PVG'], eqe: this.filter1.input, stops:this.filter2.input }, result => {
                this.pgNumber = parseInt(result.data);
            });
        }
    }
    getSubTicketList(airline, pg: number, opened: boolean = false){
        if(!opened) {
            this.hr.post('ticket/sublist', { page: pg, end: airline.E, note: ['SHA','PVG'], eqe: this.filter1.input, stops:this.filter2.input }, result => {
                airline['sublist'] = result.data;
            });
        } 
    }
    getSubTicketCount(airline, opened: boolean = false){
        if(!opened) {
            this.hr.post('ticket/subcount', { end: airline.E, note: ['SHA','PVG'], eqe: this.filter1.input, stops:this.filter2.input }, result => {
                this.subpgNumber = parseInt(result.data);
            });
        }
    }
    valueAscOrder = (a: KeyValue<string,string>, b: KeyValue<string,string>): number => {
        return a.value.localeCompare(b.value);
    }
    flights(flight: string) {
        return flight ? flight.split(',').map(e => { var a = e.match(/.[^0-9]*/); return a.length > 0 ? a[0] : '' }) : '';
    }
    company(flight: string) {
        return flight ? this.imgUrl.assets.imgLink('assets/img/com/' + flight.replace('/', '-') + '.png', 'assets/img/default.png') : '';
    }
    link(flight: string) {
         Airlines[flight] ? window.open(Airlines[flight][2],'_blank')  : '';
    }
    cname(flight: string) {
        return Airlines[flight] ? Airlines[flight][0] : '';
    }
    dest(flight: string) {
        return Places[flight] ? this.imgUrl.assets.imgLink('assets/img/dest/' + flight + '.jpg', 'assets/img/default.png') : '';
    }
    destname(flight: string) {
        return Places[flight]
    }
    open(airline) {
        this.getSubTicketList(airline, 0);
        this.getSubTicketCount(airline)
    }
    ngOnInit() {
        this.getTicketList(0);
        this.getTicketCount();
    }
    page($event) {
        this.getTicketList($event ? $event.pageIndex : 0);
    }
    subPage(airline, $event) {
        this.getSubTicketList(airline, $event ? $event.pageIndex : 0);
        this.getSubTicketCount(airline)
    }
}