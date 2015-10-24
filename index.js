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
    genomeTemplate = document.getElementById('genomeTemplate');
    speciesInput = document.getElementById('species_input');
    genusInput = document.getElementById('genus_input');
    taxonInput = document.getElementById('taxon_input');
    speciesCheckInd = document.getElementById('speciesCheckInd');
    template = document.getElementById('t');

    document.detectEnter = function (event) {
    if (event.which == 13 || event.keyCode == 13) {
        document.checkSpecies();
        return false;
    }
    return true;
    };
    document.checkSpecies = function() {
      console.log(template.genusVal + ' ' + template.speciesVal);
      session.call('com.gb.taxon_search', [template.genusVal + ' ' + template.speciesVal]).then(
        function(res) {
          console.log(res);
          if(res != -1) {
            speciesCheckInd.icon = 'done';
            speciesCheckInd.style.backgroundColor = '#009688';
            template.taxon_ID = res.toString();
            // taxonInput.style.backgroundColor = '#51beb4';
          } else {
            speciesCheckInd.icon = 'warning';
            speciesCheckInd.style.backgroundColor = '#F44336';
            setTimeout(function() {speciesCheckInd.icon = 'search';
                  speciesCheckInd.style.backgroundColor = '#fff';}, 3000);

          }
        },
        function(err) {
          console.log(err);
        }
      );
    }

    landingAnnotation.addEventListener('click', function(e) {
    	template.selected = 2;
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
          genomeTemplate.genomes = template.genomes;
	  console.log(genomeGrid);
          genomeGrid.items = genomeTemplate.genomes;
          genomeGrid.clearCache(genomeTemplate.genomes.length);
          console.log(res);
      },
      function(err) {
          console.log(err);
      }
  );

  session.subscribe('com.example.upload.on_progress', function(args) {
    var pinfo = args[0];
    template.progress = pinfo.progress * 100;
    console.log('upload event received', pinfo.status, pinfo.chunk, pinfo.remaining, pinfo.total, pinfo.progress);
  });

  document.r = new Resumable({
    target: 'upload',
    chunkSize: 1 * 512 * 1024,
    forceChunkSize: true, // https://github.com/23/resumable.js/issues/51
    simultaneousUploads: 4,
    testChunks: true,
    query: {
      on_progress: 'com.example.upload.on_progress',
      session: session.id
    }
  });
  if (!document.r.support) {
    console.log("Fatal: ResumableJS not supported!");
  } else {
    document.r.assignBrowse([uploadButton]);
    document.r.on('fileAdded', function(file) {
      console.log('fileAdded', file);
    });
    document.r.on('fileSuccess', function(file, message) {
      console.log('fileSuccess', file, message);
      console.log(r.files);
      // enable repeated upload since other user can delete the file on the server
      // and this user might want to reupload the file
      template.progress = 0;
      file.cancel();
    });
    document.r.on('fileError', function(file, message) {
      console.log('fileError', file, message);
    });
  }

  upload_reference_genome = function() {}

  // session.call('com.gb.taxon_search', ['drosophila birchii']).then(
  //     function(res) {
  //         console.log(res);
  //     },
  //     function(err) {
  //         console.log(err);
  //     }
  // );
}


document.addEventListener('WebComponentsReady', function() {

  var template = document.getElementById('t');
    genomeTemplate = document.getElementById('genomeTemplate');
  genomeTemplate.genomes = [];
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

    document.getElementById('search_input').addEventListener('keyup', function() {
        console.log(genomeTemplate.search_val);
        genomeTemplate.genomes = _.filter(template.genomes, function(genome) {
            console.log(genome);
            if(genome.name.indexOf(genomeTemplate.search_val) > -1 || genome.abbrev.indexOf(genomeTemplate.search_val) > -1) {
                return genome;
            }
        });
//        genomeGrid.clearCache(genomeTemplate.genomes.length);
    });

    // genomeGrid.rowDetailsGenerator = function(rowIndex) {
    //     var elem = document.createElement('div');
    //     elem.setAttribute('class', 'featurenamedetailswrapper');
    //     genomeGrid.getItem(rowIndex, function(error, item) {
    //       console.log(item);
    //       if (!error) {
    //         console.log(item);
    //         elem.innerHTML = document.getGenomeDetails(item);
    //       }
    //     });
    //
    //     return elem;
    //   }
    //
    //   var gridDetailsOpenIndex = -1;
    //
    //   // Show details for the selected row
    //   genomeGrid.addEventListener('select', function() {
    //     genomeGrid.setRowDetailsVisible(gridDetailsOpenIndex, false);
    //     var selected = genomeGrid.selection.selected();
    //     if (selected.length == 1) {
    //       genomeGrid.setRowDetailsVisible(selected[0], true);
    //       detailsOpenIndex = selected[0];
    //     }
    //   });

});
