/**
 * Dependencies
 */
var request = require('request')
  , cheerio = require('cheerio')
  , fs      = require('fs')
  , s       = require('string')
  , mkdirp  = require('mkdirp');
   
module.exports = function(baseUrl, directory) {
  var searchRoot = 'bresults.asp?';
  
  if (baseUrl.substr(-1) == '/') {
    baseUrl = baseUrl.substr(0, baseUrl.length - 1);
  }
  
  request(baseUrl, function(err, res, body) {
    if (err) {
      throw err;
    }
    
    var $ = cheerio.load(body);
    $('#QuickList').find('option').each(function() {
      var category = $(this).text()
        , cid = $(this).val()
        , url = [baseUrl, searchRoot].join('/') + 'STerms=&SType=A&CMType=L&PBID='+cid+'&NUM=';
        
        parseCategory(url, category);
    });
  });

  function parseCategory(url, category) {
    console.log("parsing " + category + "...");
  
    request(url, function(err, res, body) {
      if (err) {
        throw err;
      }
      
      var $ = cheerio.load(body);
      $('.DetailsLink').each(function() {
        var url = baseUrl + $(this).attr('href')
          , id  = $(this).data('num');
          
        if (url && id) {
          parseRecord(url, category, id);
        }
      });
    });
  }

  function parseRecord(url, category, id) {
    request(url, function(err, res, body) {
      if (err) {
        throw err;
      }
    
      var doc = {}
        , $ = cheerio.load(body)
        , name = $('.TitleBox.RecordDetailsHeader h2').text();
    
      doc['Name'] = (name) ? (id + "-" + name) : id;
      name = s(doc["Name"]).slugify().s + ".json";
    
      doc['Id'] = id;
      doc['Category'] = category;
    
      $('#page_content table td.FieldLabelLeft').each(function() {
        var key = $(this).text();
        
        if (key) {
          if (key == 'Address & Map') {
            doc['Address'] = $(this).siblings().first().find('[style="float:left;"]').text() || "";
            doc['Latitude'] = $(this).siblings().first().find('.DetailsMapCanvas').attr('latitude') || "";
            doc['Longitude'] = $(this).siblings().first().find('.DetailsMapCanvas').attr('longitude') || "";
          } else {
            doc[key] = $(this).siblings().first().text() || "";
          }
        }
      });
    
      mkdirp(directory, function(err) {
        if (err) {
          throw err;
        }
        
        fs.writeFile([directory, name].join('/'), JSON.stringify(doc, null, 4), function(err) {
          if (err) {
            throw err;
          }
          
          console.log("Saved " + name + " in " + category);
        });
      });
    });
  } 
}