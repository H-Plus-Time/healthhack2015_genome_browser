from Bio import Entrez
from sqlalchemy import create_engine, desc
from sqlalchemy import Column, Integer, String, Text, DateTime, Boolean, ForeignKey, MetaData
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from twisted.internet.task import LoopingCall
from twisted.internet.defer import inlineCallbacks, returnValue
from autobahn.twisted.util import sleep
from autobahn.twisted.wamp import ApplicationSession
from subprocess import Popen
from sqlalchemy.ext.automap import automap_base



class GenomeBrowser(ApplicationSession):

    def __init__(self, config):
        ApplicationSession.__init__(self, config)
        self.init()

    def init(self):
        engine = create_engine("mysql+pymysql://root:mysqlroot@localhost/hgcentral")
        Base = automap_base()
        Base.prepare(engine, reflect=True)
        Session = sessionmaker(bind=engine)
        self.db = Session()
        self.Genome = Base.classes.defaultDb
        Entrez.email = 'nicholas.roberts.au@gmail.com'
        pass


    @inlineCallbacks
    def onJoin(self, details):
        print "Session attached"

        def upload_ref_genome(file_payload):
            size = file_payload['size']
            name = file_payload['name']
            binary_payload = file_payload['file_string'].decode('base64')
            save_path = reduce(os.path.join, [upload_path, str(last_modified) + "_" + name])
            with open(save_path, "wb") as f:
                f.write(binary_payload)

        def upload_bed(file_payload):
            pass
        
        def ping(id):
            return 'pinging' + str(id)
        
        def fetch_taxon_id(taxonomy_name):
            handle = Entrez.esearch(db="taxonomy", term=taxonomy_name)
            record = Entrez.read(handle)
            return record['IdList'][0]
        
        def fetch_genomes():
            genomes = map(lambda x: [x.name, x.genome], self.db.query(self.Genome).all())
            return genomes
            
        self.register(fetch_genomes, 'com.gb.fetch_genomes')
        self.register(fetch_taxon_id, 'com.gb.taxon_search')
        self.register(ping, 'com.gb.ping')
	while True:
		yield sleep(1)
