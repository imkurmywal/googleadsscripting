// You can update sheet url, duration and monthnames

const SPREADSHEET_URL = 'YOUR_SHEET_URL';

// predefine date ranges 
//https://developers.google.com/google-ads/api/docs/query/date-ranges

const duration = "LAST_30_DAYS"; 
const limit = 10; // Set your limit here

const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "JUl", "Aug", "Sep", "Oct", "Nov", "Dec"
];



function main() {
  
  var keywords = [["Keyword", "Match Type", "Conv Value/Cost", "Conversions", "Conv Value", "Cost", "Cost/Conv", "Impressions", "Clicks", "CTR", "CPC", "Quality Score Hist."]];
  
  
  let search = AdsApp.search(`SELECT ` + 
                             `metrics.cost_micros, ` +
                             `metrics.conversions_value_per_cost, ` +
                             `metrics.cost_per_conversion, ` +
                             `metrics.average_cpc, ` + 
                             `metrics.conversions, ` +
                             `metrics.conversions_value, ` + 
                             `metrics.impressions, ` +
                             `metrics.clicks, ` +
                             `metrics.ctr, ` +
                             `metrics.historical_quality_score, ` +
                             `ad_group_criterion.keyword.match_type, ` +
                             `ad_group_criterion.keyword.text ` +
                             `FROM keyword_view ` +
                             `WHERE segments.date DURING ${duration} AND metrics.conversions > 0 ` +
                             `ORDER BY metrics.conversions DESC ` +
                             `LIMIT ${limit}`);
  
  
  
  while(search.hasNext()) {
  let row = search.next();
    
  let keyword = [
    row.adGroupCriterion.keyword.text,
    row.adGroupCriterion.keyword.matchType,
    round(row.metrics.conversionsValuePerCost, 1),
    round(row.metrics.conversions, 2),
    round(row.metrics.conversionsValue, 2),
    round(convertToNormal(row.metrics.costMicros), 2),
    round(convertToNormal(row.metrics.costPerConversion), 2),
    round(row.metrics.impressions, 1),
    row.metrics.clicks,
    round(row.metrics.ctr*100,1),
    round(convertToNormal(row.metrics.averageCpc), 1),
    row.metrics.historicalQualityScore
  ];
    
  keywords.push(keyword);
    
  }

   const ss = SpreadsheetApp.openByUrl(SPREADSHEET_URL);
   const sheet = ss.insertSheet(getSheetName(Date()));
  
  // 2 is row - 1 is column number - 3rd is rows length - 4th column length 
  sheet.getRange(1,1).setValue("Date");
  sheet.getRange(1,2).setValue(Date());
  sheet.getRange(2, 1, keywords.length, keywords[0].length).setValues(keywords);
  
}

function convertToNormal(value) {
    // convert the value to normal by diving 1000000 
    let convertedVal = value/1000000 // You get number in general currency. 
    return convertedVal;
}

function round(value, precision) {
  
    var multiplier = Math.pow(10, precision || 0);
    return Math.round(value * multiplier) / multiplier;
}

function getSheetName(date) {
    date = new Date(date);
    return String((monthNames[date.getMonth()]) + ' ' + date.getFullYear());
}

