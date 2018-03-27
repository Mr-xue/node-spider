var cheerio = require('cheerio');
var http = require('http');
var iconv = require('iconv-lite');
var fs = require('fs');

// var movieUrl = 'http://www.dytt8.net/html/gndy/dyzz/index.html';
var movieUrl = 'http://www.dytt8.net/html/gndy/dyzz/list_23_';

var index = 1;
var titles = [];

let titleHrefCount = 1
let btCount = 0

let title_href = []
let btLink = []

function getTitle(url,i){
	console.log("正在获取第" + i + "页的内容"); 
	http.get(movieUrl+i+'.html',function(res){
		var chunks = [];
		res.on('data',function(chunk){
			chunks.push(chunk);
		});
		// chunks里面存储着网页的 html 内容，将它zhuan ma传给 cheerio.load 之后
		// 就可以得到一个实现了 jQuery 接口的变量，将它命名为 `$`
		// 剩下就都是 jQuery 的内容了
		res.on('end',function(){
			//由于咱们发现此网页的编码格式为gb2312，所以需要对其进行转码，否则乱码
	    	//依据：“<meta http-equiv="Content-Type" content="text/html; charset=gb2312">”
	    	 var html = iconv.decode(Buffer.concat(chunks), 'gb2312');
	    	 var $ = cheerio.load(html,{decodeEntities: false});
	    	 $('.co_content8 .ulink').each(function (idx, element) {
		      var $element = $(element);
		      titles.push({
		        title: $element.text()
		      })
		    })
	    	if(i < 2) { //为了方便只爬了两页
		        getTitle(movieUrl, ++index); //递归执行，页数+1
		    } else {
		        console.log(titles); 
		        console.log("Title获取完毕！");              
		    }
		})
	})
}

/**
 * 获取详情页链接
 *
 * @param {String} url
 * @param {Number} page
 * @param {Number} i
 */
const getTitleHref = (url, page, i) => {
  http.get(movieUrl + i + '.html', sres => {
    let chunks = []
    sres.on('data', chunk => {
      chunks.push(chunk)
    })
    sres.on('end', chunk => {
      let html = iconv.decode(Buffer.concat(chunks), 'gb2312')
      let $ = cheerio.load(html, { decodeEntities: false })
      $('.co_content8 .ulink').each((idx, element) => {
        let $element = $(element)
        title_href.push({
          titleHref: $element.attr('href')
        })
      })
      if(i < page) {
       
        getTitleHref(movieUrl, page, ++index )
      } else {
      	// console.log(title_href.length);
        getBtLink(title_href, btCount)
      }
    })
  })
}

/**
 * 获取BT种子
 *
 * @param {Arrary} urls
 * @param {Number} n
 */
function getBtLink(urls,n){
	console.log("正在获取第" + n + "个url的内容");
	http.get('http://www.dytt8.net' + urls[n].titleHref,function(res){
		var chunks = [];
		res.on('data',function(chunk){
			chunks.push(chunk);
		})
		res.on('end',function(){
			var html = iconv.decode(Buffer.concat(chunks),'gb2312');
			var $ = cheerio.load(html,{decodeEntities:false});
			$('#Zoom td').children('a').each(function(idx, element){
				var $element = $(element);
				console.log($element.attr('href'));
				btLink.push({
					bt:$element.attr('href')
				})
			})

			if(n < urls.length-1){
				getBtLink(urls, ++btCount);
			}else{
				console.log("btlink获取完毕！");
		        // console.log(btLink);   
		        var content = '';
		        btLink.forEach((item,n)=>{
		        	content+=item.bt+'\n\n';
		        })
		        fs.writeFile("DownLink.txt",content,function(err){
		        	if (err) throw err ;
                    console.log("File Saved !"); //文件被保存
		        })
			}
		})
	})
}
function main() {
  console.log("开始爬取");
  // getTitle(movieUrl, index);
  getTitleHref(movieUrl,1,index)
}

main(); //运行主函数
