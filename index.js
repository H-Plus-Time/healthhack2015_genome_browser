var connection = new autobahn.Connection({
  url: 'ws://genbanksql.bioinf.science.depi.vic.gov.au:80/ws',
  realm: 'realm1'
});


connection.onopen = function(session) {
  console.log("Connected", details);
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
    r.assignBrowse(document.getElementById('browseButton'));
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
}


document.addEventListener('WebComponentsReady', function() {

  var template = document.getElementById('t');

  template.selected = 0;
});
