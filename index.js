var connection = new autobahn.Connection({
  url: 'ws://115.146.87.241/ws',
  realm: 'realm1'
});


connection.onopen = function(session) {
    
//  uploadFasta = document.getElementById('uploadFasta');
//  uploadBED = document.getElementById('uploadBED');  
//  uploadRa = document.getElementById('uploadRa');
    uploadButton = document.getElementById('uploadButton');
    landingAnnotation = document.getElementById('landingAnnotation');
    landingAnnotation.addEventListener('click', function(e) {
    	template.selected = 1;
	template.subselected = 0;
    });
    landingGenome = document.getElementById('landingGenome');
    landingGenome.addEventListener('click', function(e) {
	template.selected = 1;
	template.subselected = 1;
    });
   template = document.getElementById('t');
  console.log("Connected", session.details);
  templateWrapper = document.getElementById('templatewrapper');
  genomeTemplate = templateWrapper.querySelector('template');
  ping = function() {
      connection.session.call('com.gb.ping', [connection.session._id]).then(
        function(res) {
          console.log(res);
        },
        function(err) {
          console.log(err);
        }
      );
    }
  setInterval(ping, 1000);
    
  session.call('com.gb.fetch_genomes').then(
      function(res) {
          console.log(res);
	  gens = _.map(res, function(item) {
	  	return {'name': item[0], 'abbrev': item[1]}
	  });
          template.genomes = res;
	  console.log(genomeGrid);
          genomeGrid.items = template.genomes;
          genomeGrid.clearCache(template.genomes.length);
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
    r.assignBrowse([uploadButton]);
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
  template.genomes = [];
  genomeGrid = document.getElementById('genomeGrid');
  connection.open();
  template.selected = 0;
  template.subselected = 0;
  document.getElementById('uploadFasta').addEventListener('click', function(e) {
    template.subselected = 2;
  });
    console.log("Opened connection");
    history.pushState(null, null, '');
      window.addEventListener('popstate', function(event) {
          history.pushState(null, null, '');
          alert('Back navigation is disabled on this page. Use the tabs.');
      });
    
    document.getGenomeDetails = function(genome) {
        genomeTemplate.annotations = genome.annotations;
        return templateWrapper.querySelector(".genomedetails").outerHTML;
      }

    genomeGrid.rowDetailsGenerator = function(rowIndex) {
        var elem = document.createElement('div');
        elem.setAttribute('class', 'featurenamedetailswrapper');
        genomeGrid.getItem(rowIndex, function(error, item) {
          console.log(item);
          if (!error) {
            console.log(item);
            elem.innerHTML = document.getGenomeDetails(item);
          }
        });

        return elem;
      }

      var gridDetailsOpenIndex = -1;

      // Show details for the selected row
      genomeGrid.addEventListener('select', function() {
        genomeGrid.setRowDetailsVisible(gridDetailsOpenIndex, false);
        var selected = genomeGrid.selection.selected();
        if (selected.length == 1) {
          genomeGrid.setRowDetailsVisible(selected[0], true);
          detailsOpenIndex = selected[0];
        }
      }); 
  
});
