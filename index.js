var connection = new autobahn.Connection({
       url: 'ws://genbanksql.bioinf.science.depi.vic.gov.au:80/ws',
       realm: 'realm1'
     });


connection.onopen = function(session) {
    upload_reference_genome = function() {
    }
}


document.addEventListener('WebComponentsReady', function() {
    
    var template = document.getElementById('t');

    template.selected = 0;
});
