/**
 * Created by aadisriram on 5/1/15.
 */
var port = 3000;

var server_name = "http://152.46.20.89:" + port + "/";
var server = io.connect(server_name);

var wikiBaseUrl = "https://en.wikipedia.org/w/api.php?format=json&action=query&prop=extracts&exintro=&explaintext=&titles=Stack%20Overflow";
var wikiURL = "https://en.wikipedia.org/wiki/";

var time;

server.on('result', function(data) {

    var timeTaken = ((new Date().getMilliseconds()) - time)/1000;
    if(timeTaken < 0)
        timeTaken = 0.01;

    var parsed = jQuery.parseJSON(data);
    $("#result-time").html(parsed.length + " results in " + timeTaken + " seconds");

    parsed.forEach(function(result) {
        var pageId = result[0].split(",")[0];
        var pageRank = result[0].split(",")[1];
        var articles = $("#search-results").append(
            '<div><a target="_blank" href="' + wikiURL + pageId + '" ><b>' + pageId + '</b></a>' +
            ' [' + pageRank + ']' +
            '<div class="box"><iframe src="' + wikiURL + pageId + '" width = "100%" height = "500px"></iframe></div>' +
            '<article id="' + pageId +'">Loading summary for ' + pageId + '</article><br />' +
            '</div>'
        );
        server.emit("get_summary", pageId);
    });
});

server.on("wiki_summary", function(result) {
    $("#" + result["pageId"]).html(result["summary"]);
    $('#' + result["pageId"] + ' sup').remove();
    $('#' + result["pageId"] + ' a').contents().unwrap();
    $("article").readmore();
});

var availableTags = [
    "Canada",
    "India"
];

$("#category").autocomplete({
    source: availableTags,
    select: function(event, ui) { console.log(ui.item.label); }
});

$('form').submit(function(){
    time = new Date().getMilliseconds();
    server.emit("search", $("#category").val());
    $("#search-results").empty();
    return false;
});
