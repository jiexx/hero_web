import { ID } from "../common/id";

const xStopsBody ={
	"method": "search",
	"params": {
		"2": [
			"carrierStopMatrix",
			"currencyNotice",
			"durationSliderItinerary",
			"itineraryArrivalTimeRanges",
			"itineraryCarrierList",
			"itineraryDepartureTimeRanges",
			"itineraryDestinations",
			"itineraryOrigins",
			"itineraryPriceSlider",
			"itineraryStopCountList",
			"solutionList",
			"warningsItinerary"
		],
		"3": {
			"4": {
				"1": 1,
				"2": 30
			},
			"5": {
				"1": 1
			},
			"7": [
				{
					"1": {
						"1": 0,
						"2": 1
					},
					"3": [
						"<%= arrive %>"
					],
					"5": [
						"<%= depart %>"
					],
					"8": "<%= date %>",
					"9": 0,
					"11": 1
				}
			],
			"8": "COACH",
			"9": 1,
			"10": 1,
			"13": "2020-01-19",
			"15": "MONDAY",
			"16": 0,
			"17": 0,
			"22": "default",
			"23": "2019-12-19",
			"25": 0
		},
		"4": "specificDates",
		"7": "!fn2lfVxCe7KWzL3GVOBEAPErLXg7bR0CAAAAblIAAAAUmQG3o1saup3BYTepzpG0uHImC6G9SS5zWEs04CZUJwUU59w7yVEdjYV_JqvlBoBwnGSW6zOBcriOOaRC04NhCMQtPffgMomYVOIYMh6NUhQkf2oCWFd6sMLAjrkJfLV7kW-IaHPBsaRZiJakwZUJZtgpHMHE7fmPvA1oeT44h1RhopbYAu5IA9xyF0-owJPw9z2oh-nwsM1F7gZcsVeUwrQU8BHr-8zu3pp4yzBcVdTJNQQo_nzKR73cmw9duMQoZS4YRas2bxNZgDCwVG6aaT9iTWSiL1S6sDhmgCUR7yPRz_xTVXWxPTAzFeia7bU5gKREaHKhY2BAu_2r33XX52iEyINNnw5hiNLGvGodBquKvpyiOJY3ujfCB0FkldMgQiiEWu0HjQVTMN_z2u4lJKLVT0oUIQ1mJSqQP4ikEyZUBQBXD8YsWgXD57c-KlXuKKh-XAgTR5_2Shvqr5wei7MlLzzkcwuxRBBL1qA4fsW-oidgvBgS72SFK3UtGrEDJTALWBRPbJA-IWAUOu99UDPWpJV4rY4luxzig-NzTS8hr9EcA2iBSqLpsxsTzap6pHVBdrI-TbuTmg",
		"8": "wholeTrip"
	}
}
const iStopsBody = {
	"method": "search",
	"params": {
		"2": [
			"carrierStopMatrix",
			"currencyNotice",
			"durationSliderItinerary",
			"itineraryArrivalTimeRanges",
			"itineraryCarrierList",
			"itineraryDepartureTimeRanges",
			"itineraryDestinations",
			"itineraryOrigins",
			"itineraryPriceSlider",
			"itineraryStopCountList",
			"solutionList",
			"warningsItinerary"
		],
		"3": {
			"4": {
				"1": 1,
				"2": 30
			},
			"5": {
				"1": 1
			},
			"7": [
				{
					"3": [
						"<%= arrive %>"
					],
					"5": [
						"<%= depart %>"
					],
					"8": "<%= date %>",
					"9": 0,
					"11": 0
				}
			],
			"8": "COACH",
			"9": 1,
			"10": 1,
			"15": "MONDAY",
			"16": 0,
			"22": "default",
			"25": 1 //only set 0 to nostops
		},
		"4": "specificDates",
		"7": "!fn2lfVxCe7KWzL3GVOBEAPErLXg7bR0CAAAAblIAAAAUmQG3o1saup3BYTepzpG0uHImC6G9SS5zWEs04CZUJwUU59w7yVEdjYV_JqvlBoBwnGSW6zOBcriOOaRC04NhCMQtPffgMomYVOIYMh6NUhQkf2oCWFd6sMLAjrkJfLV7kW-IaHPBsaRZiJakwZUJZtgpHMHE7fmPvA1oeT44h1RhopbYAu5IA9xyF0-owJPw9z2oh-nwsM1F7gZcsVeUwrQU8BHr-8zu3pp4yzBcVdTJNQQo_nzKR73cmw9duMQoZS4YRas2bxNZgDCwVG6aaT9iTWSiL1S6sDhmgCUR7yPRz_xTVXWxPTAzFeia7bU5gKREaHKhY2BAu_2r33XX52iEyINNnw5hiNLGvGodBquKvpyiOJY3ujfCB0FkldMgQiiEWu0HjQVTMN_z2u4lJKLVT0oUIQ1mJSqQP4ikEyZUBQBXD8YsWgXD57c-KlXuKKh-XAgTR5_2Shvqr5wei7MlLzzkcwuxRBBL1qA4fsW-oidgvBgS72SFK3UtGrEDJTALWBRPbJA-IWAUOu99UDPWpJV4rY4luxzig-NzTS8hr9EcA2iBSqLpsxsTzap6pHVBdrI-TbuTmg",
		"8": "wholeTrip"
	}
}

function format(){
    let r = JSON.stringify(JSON.stringify(iStopsBody.params)).substr(1).slice(0, -1);
    return r;
}

const template = [
    {
        name: 'matrix.itasoftware.com',
        url: 'http://matrix.itasoftware.com/search',
        headers: {
            "Content-Type": "application/javascript; charset=UTF-8",
            "X-GWT-Permutation": "F7A207C948CE258EA199F421984E5905",
            "User-Agent":"Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/75.0.3770.142 Safari/537.36"
        },
        method:'POST',
        body:{"method":"search","params":"{\"2\":[\"carrierStopMatrix\",\"currencyNotice\",\"durationSliderItinerary\",\"itineraryArrivalTimeRanges\",\"itineraryCarrierList\",\"itineraryDepartureTimeRanges\",\"itineraryDestinations\",\"itineraryOrigins\",\"itineraryPriceSlider\",\"itineraryStopCountList\",\"solutionList\",\"warningsItinerary\"],\"3\":{\"4\":{\"1\":1,\"2\":30},\"5\":{\"1\":1},\"7\":[{\"3\":[\"<%= arrive %>\"],\"5\":[\"<%= depart %>\"],\"8\":\"<%= date %>\",\"9\":0,\"11\":0}],\"8\":\"COACH\",\"9\":1,\"10\":1,\"15\":\"MONDAY\",\"16\":0,\"22\":\"default\",\"25\":1},\"4\":\"specificDates\",\"7\":\"!fn2lfVxCe7KWzL3GVOBEAPErLXg7bR0CAAAAblIAAAAUmQG3o1saup3BYTepzpG0uHImC6G9SS5zWEs04CZUJwUU59w7yVEdjYV_JqvlBoBwnGSW6zOBcriOOaRC04NhCMQtPffgMomYVOIYMh6NUhQkf2oCWFd6sMLAjrkJfLV7kW-IaHPBsaRZiJakwZUJZtgpHMHE7fmPvA1oeT44h1RhopbYAu5IA9xyF0-owJPw9z2oh-nwsM1F7gZcsVeUwrQU8BHr-8zu3pp4yzBcVdTJNQQo_nzKR73cmw9duMQoZS4YRas2bxNZgDCwVG6aaT9iTWSiL1S6sDhmgCUR7yPRz_xTVXWxPTAzFeia7bU5gKREaHKhY2BAu_2r33XX52iEyINNnw5hiNLGvGodBquKvpyiOJY3ujfCB0FkldMgQiiEWu0HjQVTMN_z2u4lJKLVT0oUIQ1mJSqQP4ikEyZUBQBXD8YsWgXD57c-KlXuKKh-XAgTR5_2Shvqr5wei7MlLzzkcwuxRBBL1qA4fsW-oidgvBgS72SFK3UtGrEDJTALWBRPbJA-IWAUOu99UDPWpJV4rY4luxzig-NzTS8hr9EcA2iBSqLpsxsTzap6pHVBdrI-TbuTmg\",\"8\":\"wholeTrip\"}"},
        curr: {
            j: {
                price: '.result .38 .2 .1 .1', 
                airline: '.result .38 .2 .2 .3 .2',
                A: '.result .38 .2 .2 .3 .2',
                flight: '.result .38 .2 .2 .2 .7',
                depart: '.result .38 .2 .2 .2 .4',
                arrive: '.result .38 .2 .2 .2 .3',
                begin: '.result .38 .2 .2 .2 .1 .2',
                B: '.result .38 .2 .2 .2 .1 .1',
                end: '.result .38 .2 .2 .2 .2 .2',
                E: '.result .38 .2 .2 .2 .2 .1',
                stops:'.result .38 .2 .2 .2 .8 .2',
                S: '.result .38 .2 .2 .2 .8 .1'
            },
            x: null
        },
        next: null,
    }
];

const depart = ["SHA", "PVG"];
const arrive = [ "SYD","CDG","REP","AKL" ,"MUC","SIN","FRA","MEL","CMB","AMS","BUD","DPS","SVO","CEB","HND","LGW","KUL","MNL","MXP","VVO","HKT","DMK","ICN","KIX","DXB","KLO","CJU", "HKG","MFM","CNX","NRT","TSA","TAE","BKK","CTS","TPE","IBR","GMP","PUS","SGN","TAK","PNH","KHH","MYJ","KMQ","NGO","HSG","NGS","ZRH","OKA","HEL","FUK","LHR","FSZ","DTW","JFK","ORD","ATL","YYZ","MLE","SEA","FCO","LAX","YVR","SFO","CPH","DEL","HAN","BWN","EWR","CGK","HNL","OKJ","HIJ","DFW","YUL","RGN","BNE","BKI","IST","ADD","DOH","AUH","IKA","VTE","BCN","MRU","VIE","MAD","BOS","MEX","SPN","FNJ","CRK","DAD","PRG","ARN","SSN","MWX","TOY","KIJ","KOJ","HNA","AKJ","SDJ","LPQ","POM","TIJ" ];

const params = [
    [
        {depart:"SHA", arrive:"LAX", date:"2019-12-22"},
    ]
]

function translate(){
	let _depart = depart;
	let _arrive = arrive;
    let result = [];
    _depart.forEach(d =>{
        _arrive.forEach(a => {
            for(let k = 0 ; k < 30 ; k ++ ) {
                result.push({depart:d, arrive:a, date: ID.timeFormat(ID.dayAdd(ID.now, k))});
            }
        })
	})
	_depart = arrive;
	_arrive = depart;
	_depart.forEach(d =>{
        _arrive.forEach(a => {
            for(let k = 0 ; k < 30 ; k ++ ) {
                result.push({depart:d, arrive:a, date: ID.timeFormat(ID.dayAdd(ID.now, k))});
            }
        })
    })
    return result;
}

const threads = [
    {
        name:"thread1"
    },{
        name:"thread2"
    }
]

export const config = {
    threads: threads,
    template: template,
    params: [translate()]
}