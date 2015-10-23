

class GenomeBrowser(ApplicationSession):

    def __init__(self, config):
        ApplicationSession.__init__(self, config)
        self.init()

    def init(self):
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

