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
  var products = [["Product Id", 
                   "Title", 
                   "Conv Value/Cost", 
                   "Conversions", 
                   "Conv Value", 
                   "Cost", 
                   "Cost/Conv", 
                   "Impressions", 
                   "Clicks", 
                   "CTR", 
                   "CPC"]];
  
  let search = AdsApp.search(`SELECT segments.product_item_id, ` +  
                             `segments.product_title, ` +
                             `metrics.conversions, ` +
                             `metrics.conversions_value,` + 
                             `metrics.cost_per_conversion, ` +
                             `metrics.cost_micros, ` + 
                             `metrics.impressions, `+
                             `metrics.clicks, ` +
                             `metrics.ctr, ` + 
                             `metrics.average_cpc ` + 
                             `FROM shopping_performance_view ` +
                             `WHERE segments.date DURING ${duration} AND metrics.conversions > 0 ` +
                             `ORDER BY metrics.conversions DESC ` +
                             `LIMIT ${limit}`);
  
  while(search.hasNext()) {
    let row = search.next();
    //Logger.log(JSON.stringify(row));
    
    // we don't get conv value / cost from shopping view. we need to calculate this one 
    let convValuePerCost = (row.metrics.conversionsValue/row.metrics.costMicros) * 1000000;
    
    let product = [
    row.segments.productItemId,
    row.segments.productTitle,
    round(convValuePerCost, 1),
    round(row.metrics.conversions, 2),
    round(row.metrics.conversionsValue, 2),
    round(convertToNormal(row.metrics.costMicros), 2),
    round(convertToNormal(row.metrics.costPerConversion), 2),
    round(convertToNormal(row.metrics.impressions), 1),
    row.metrics.clicks,
    round((row.metrics.ctr*100), 1),
    round(convertToNormal(row.metrics.averageCpc), 1),
  ];
    
  products.push(product);
  }
  //console.log(products);
  
  const ss = SpreadsheetApp.openByUrl(SPREADSHEET_URL);
   const sheet = ss.insertSheet(getSheetName(Date()));
  
  // 2 is row - 1 is column number - 3rd is rows length - 4th column length 
  sheet.getRange(1,1).setValue("Date");
  sheet.getRange(1,2).setValue(Date());
  sheet.getRange(2, 1, products.length, products[0].length).setValues(products);

}

function round(value, precision) {
    var multiplier = Math.pow(10, precision || 0);
   return Math.round(value * multiplier) / multiplier;
}

function convertToNormal(value) {
    // convert the value to normal by diving 1000000 
    let convertedVal = value/1000000 // You get number in general currency. 
    return convertedVal;
}

function getSheetName(date) {
    date = new Date(date);
    return String((monthNames[date.getMonth()]) + ' ' + date.getFullYear());
}

