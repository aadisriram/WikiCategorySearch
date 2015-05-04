/**
 * Created by aadisriram on 5/1/15.
 */
var port = 3000;

var server_name = "http://localhost:" + port + "/";
var server = io.connect(server_name);

server.on('result', function(data) {
    $("#search-results").append(data + '<br />');
    //data.forEach(function(result) {
    //    $("#search-results").append(result + '<br />');
    //});
    //var parsed = jQuery.parseJSON(data);
    //for(i = 0; i < parsed.hits.hits.length; i++) {
    //    $("#search-results").append(parsed.hits.hits[i]._id + '<br />');
    //}
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
    server.emit("search", $("#category").val());
    $("#search-results").empty();
    return false;
});