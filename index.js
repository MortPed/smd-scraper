var request = require('request');
var cheerio = require('cheerio');
var fs = require('fs');
var http = require('http');

function HtmlDecode(html) {
    var div = document.createElement("div");
    div.innerHTML = html;
    return div.childNodes[0].nodeValue;
}

request("http://web.archive.org/web/20141228201725/http://www.system-method.com/IceBreak/Features", function(error, response, body) {
  if(error) {
    console.log("Error: " + error);
  }
  console.log("Status code: " + response.statusCode);

  var $ = cheerio.load(body);
  var result = {
    products: [],
    environments: []
  }

  var listCreated = false;

  $('div#devider-wrapper > .column').each(function( i ) {
    result.products.push(HtmlDecode($(this).find('h3').html()));
    var environmentCount = -1;

    $(this).find('.comparison-list').each(function( n ) {

      if($(this).find('font').html()){
        environmentCount++;
        catCount = 0;
      }

      if(!listCreated){
        if($(this).find('font').html()){
          var environment = {
            title: HtmlDecode($(this).find('font').html()),
            catagories: []
          }
          result.environments.push(environment)
        }

        var catagory = {
          title: HtmlDecode($(this).find('b').html()),
          features: []
        }
        $(this).find('li').each(function( a ) {
          var feature = {
            name: HtmlDecode($(this).html()),
            values: [
              $(this).hasClass('cl-yes')
            ]
          };
          catagory.features.push(feature)
        });
        result.environments[environmentCount].catagories.push(catagory)
      }else{
        $(this).find('li').each(function( b ) {
          result.environments[environmentCount].catagories[catCount].features[b].values.push($(this).hasClass('cl-yes'));
        });
        catCount++;
      }
    });


  listCreated = true;
  });


  var print = JSON.stringify(result);

  fs.writeFile("data.json", print, function(err) {
      if(err) {
        console.log(err);
      } else {
        console.log("JSON saved to " + "data.json");
      }
  });

});
