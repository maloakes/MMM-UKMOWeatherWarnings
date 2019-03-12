/* Magic Mirror
 * Module: MMM-UKMOWeatherWarnings
 *
 * By Malcolm Oakes https://github.com/maloakes
 *
 * MIT Licensed.
 *
 * create dummy warnings data in the current timeframe
 *
 * the JSON file can be loaded by setting the module config data
 */

const moment = require('moment')
const fs = require('fs')

let warns = createDummyData()
let fpath = '../public/warns.json'
writeFile(fpath, warns)

/*
 * create the data for the current time frame
 */
function createDummyData() {
  let fmt = 'ddd DD MMM'

  let hObj = createWarnHeader()

  let wTime = moment()
  let wfrom = '0200 ' + wTime.format(fmt)
  let wto = '1800 ' + wTime.format(fmt)
  hObj.items.push(createWarnItem('Red', 'Fog', wfrom, wto))

  wTime = moment()
  wfrom = '1600 ' + wTime.format(fmt)
  wto = '1800 ' + wTime.add(1, 'days').format(fmt)
  hObj.items.push(createWarnItem('Yellow', 'Snow and Ice', wfrom, wto))

  wTime = moment().add(1, 'days')
  wfrom = '0800 ' + wTime.format(fmt)
  wto = '1900 ' + wTime.add(1, 'days').format(fmt)
  hObj.items.push(createWarnItem('Amber', 'Rain', wfrom, wto))

  wTime = moment().add(1, 'days')
  wfrom = '0000 ' + wTime.format(fmt)
  wto = '1000 ' + wTime.format(fmt)
  hObj.items.push(createWarnItem('Red', 'Fog', wfrom, wto))

  return hObj

}

/*
 * create header, based on real data with times in current frame
 */
function createWarnHeader() {

  let now = moment.utc()
  let fmtTtl = 'DD-MMM-YYYY HH:mm'
  let fmtPub = 'ddd, DD MMM YYYY HH:mm:ss'
  let fmtDate = 'YYYY-MM-DDTHH:mm:ss'

  let hObj = {
      type: 'rss 2.0',
      title: 'Met Office Warnings - dummy data generated ' + now.format(fmtTtl),
      link: 'https://www.metoffice.gov.uk/public/weather/warnings/?regionName=gr',
      description: 'Weather Warnings of severe and extreme weather from the Met Office',
      language: 'en-gb',
      copyright: '(c) Crown copyright',
      pubdate: now.format(fmtPub) + ' GMT',
      'dc:creator': 'webteam@metoffice.gov.uk',
      'dc:date': now.format(fmtDate) + 'Z',
      'dc:language': 'en-gb',
      'dc:rights': '(c) Crown copyright',
      image:
       { text: '\r\n      \r\n      \r\n      \r\n    ',
         title: 'Met Office Warnings for Grampian',
         url: 'https://www.metoffice.gov.uk/lib/template/logo_crop.gif',
         link: 'https://www.metoffice.gov.uk/public/weather/warnings/?regionName=gr' },
      items: []
  }
  return hObj
}

/*
 * create item, based on real data with times in current frame
 */
 function createWarnItem(level, type, from, to) {
  var witemObj = {
    title: level + ' Warning of ' + type + ' affecting Scotland (Grampian)',
    link: 'https://www.metoffice.gov.uk/public/weather/warnings/?regionName=gr&from=rss&sn=bb9e7f32-549d-490e-bf5c-6f5fdef26723',
    description: 'Red Warning of Fog affecting Scotland (Grampian) : Aberdeen, Aberdeenshire, Moray ' +
                  'valid from ' + from + ' to ' + to,
    'metadata:warningkind': 'WARNING',
    'metadata:warninglevel': level.toUpperCase(),
    'metadata:warningtype': type.toUpperCase()
  }

  return witemObj
}

/*
 * write the JSON file
 */
function writeFile(fpath, wobj) {
  fs.writeFileSync(fpath, JSON.stringify(wobj))
}
