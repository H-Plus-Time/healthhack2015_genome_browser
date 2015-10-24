var connection = new autobahn.Connection({
  url: 'ws://115.146.87.241/ws',
  realm: 'realm1'
});


connection.onopen = function(session) {
    
//  uploadFasta = document.getElementById('uploadFasta');
//  uploadBED = document.getElementById('uploadBED');  
//  uploadRa = document.getElementById('uploadRa');
    
  console.log("Connected", session.details);
  ping = function() {
      connection.session.call('com.ping.ping', [connection.session._id]).then(
        function(res) {
          console.log(res);
        },
        function(err) {
          console.log(err);
        }
      );
    }
  setInterval(ping, 1000);
    
  connection.session.call('com.gb.fetch_genomes').then(
      function(res) {
          template.genomes = res;
          genomeGrid.items = template.genomes;
          genomeGrid.clearCache();
          console.log(res);
      },
      function(err) {
          console.log(err);
      }
  );
    
  session.subscribe('com.example.upload.on_progress', function(args) {
    var pinfo = args[0];
    console.log('upload event received', pinfo.status, pinfo.chunk, pinfo.remaining, pinfo.total, pinfo.progress);
  });

  var r = new Resumable({
    target: 'upload',
    chunkSize: 1 * 1024 * 1024,
    forceChunkSize: true, // https://github.com/23/resumable.js/issues/51
    simultaneousUploads: 4,
    testChunks: true,
    query: {
      on_progress: 'com.example.upload.on_progress',
      session: session.id
    }
  });
  if (!r.support) {
    console.log("Fatal: ResumableJS not supported!");
  } else {
    r.assignBrowse([uploadFasta, uploadBED, uploadRa]);
    r.on('fileAdded', function(file) {
      console.log('fileAdded', file);
      r.upload();
    });
    r.on('fileSuccess', function(file, message) {
      console.log('fileSuccess', file, message);
      console.log(r.files);
      // enable repeated upload since other user can delete the file on the server
      // and this user might want to reupload the file
      file.cancel();
    });
    r.on('fileError', function(file, message) {
      console.log('fileError', file, message);
    });
  }

  upload_reference_genome = function() {}
  
  session.call('com.gb.taxon_search', ['drosophila birchii']).then(
      function(res) {
          console.log(res);
      },
      function(err) {
          console.log(err);
      }
  );
}


document.addEventListener('WebComponentsReady', function() {

  var template = document.getElementById('t');
  genomeGrid = document.getElementById('genomeGrid');
  connection.open();
  template.selected = 0;
  template.subselected = 0;
  document.getElementById('bedNavButton').addEventListener('click', function(e) {
    template.subselected = 1;
  });
    console.log("Opened connection");
  
  
});
